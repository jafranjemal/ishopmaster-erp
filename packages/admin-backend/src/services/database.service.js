const mongoose = require("mongoose");
const util = require("util");

// Enhanced debugging with configurable levels
const DEBUG_LEVEL = process.env.DB_DEBUG_LEVEL || 2; // 0=off, 1=errors, 2=warnings, 3=info, 4=verbose
const debugLog = (level, ...args) => {
  if (DEBUG_LEVEL >= level) {
    const prefix = `[DB:${["ERROR", "WARN", "INFO", "VERB"][level - 1]}]`;
    console.log(prefix, ...args);
  }
};

// Track registered schemas and model compilations
const registeredSchemas = new Map();
const modelCompilations = new Map();

// Track tenant connection health
const tenantConnections = {};
const connectionStates = {};

// Enhanced schema registration with deep inspection
function registerSchema(name, schema) {
  debugLog(3, `Registering schema: ${name}`);

  if (registeredSchemas.has(name)) {
    debugLog(2, `⚠️ Schema "${name}" already registered. Overwriting.`);
  }

  // Capture schema structure for diagnostics
  const schemaInfo = {
    name,
    paths: Object.keys(schema.paths),
    statics: Object.keys(schema.statics),
    methods: Object.keys(schema.methods),
    indexes: schema.indexes(),
    virtuals: Object.keys(schema.virtuals),
    stack: new Error().stack, // Capture registration origin
  };

  registeredSchemas.set(name, schema);
  debugLog(4, `🔍 Schema details: ${name}`, util.inspect(schemaInfo, { depth: 3, colors: true }));

  return schemaInfo;
}

// Connection management with enhanced diagnostics
const getTenantConnection = async (dbName) => {
  const connectionKey = dbName;

  debugLog(3, `Requesting connection for: ${connectionKey}`);

  // Check cached connection
  if (tenantConnections[connectionKey]) {
    const conn = tenantConnections[connectionKey];

    // Detailed connection health check
    const state = {
      readyState: conn.readyState,
      models: Object.keys(conn.models),
      transactions: conn.transactions,
      lastUsed: connectionStates[connectionKey]?.lastUsed || "unknown",
    };

    debugLog(4, `Connection state for ${connectionKey}:`, state);

    if (conn.readyState === 1) {
      debugLog(3, `Using cached connection for: ${connectionKey}`);
      connectionStates[connectionKey] = {
        ...state,
        lastUsed: new Date(),
        useCount: (connectionStates[connectionKey]?.useCount || 0) + 1,
      };
      return conn;
    }

    debugLog(
      2,
      `Cached connection stale (state: ${conn.readyState}). Reconnecting: ${connectionKey}`
    );
    delete tenantConnections[connectionKey];
  }

  // Create new connection
  const mongoUri = `${process.env.MONGO_URI_BASE}/${dbName}?retryWrites=true&w=majority`;
  debugLog(3, `Connecting to: ${mongoUri}`);

  const connection = mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 1,
    heartbeatFrequencyMS: 10000,
  });

  // Enhanced event listeners
  const events = [
    "connecting",
    "connected",
    "open",
    "disconnecting",
    "disconnected",
    "close",
    "reconnected",
    "error",
    "fullsetup",
  ];

  events.forEach((event) => {
    connection.on(event, (arg) => {
      debugLog(
        3,
        `📡 [${connectionKey}] Event: ${event}`,
        arg ? util.inspect(arg, { depth: 1 }) : ""
      );

      // Track state transitions
      connectionStates[connectionKey] = {
        ...(connectionStates[connectionKey] || {}),
        state: connection.readyState,
        lastEvent: {
          name: event,
          at: new Date(),
          arg: util.inspect(arg, { depth: 0 }),
        },
      };
    });
  });

  try {
    debugLog(3, `Awaiting connection ready...`);
    await connection.asPromise();

    tenantConnections[connectionKey] = connection;
    connectionStates[connectionKey] = {
      connectedAt: new Date(),
      lastUsed: new Date(),
      useCount: 1,
      readyState: connection.readyState,
    };

    debugLog(3, `✅ Connection established for: ${connectionKey}`);
    return connection;
  } catch (err) {
    debugLog(1, `❌ Connection FAILED for ${connectionKey}: ${err.message}`);

    // Capture detailed error info
    const errorInfo = {
      dbName,
      error: err.message,
      stack: err.stack,
      timestamp: new Date(),
      uri: mongoUri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, "mongodb://***:***@"), // Hide credentials
    };

    connectionStates[connectionKey] = {
      ...(connectionStates[connectionKey] || {}),
      lastError: errorInfo,
      readyState: connection.readyState,
    };

    throw Object.assign(err, { dbName, mongoUri: errorInfo.uri });
  }
};

// Model compilation with deep diagnostics
const getTenantModels = (connection) => {
  const dbName = connection.name;
  const models = {};

  debugLog(3, `Compiling models for: ${dbName}`);

  for (const [name, schema] of registeredSchemas.entries()) {
    try {
      let model;

      if (connection.models[name]) {
        debugLog(4, `Using existing model: ${name} in ${dbName}`);
        model = connection.models[name];
      } else {
        debugLog(4, `Compiling new model: ${name} in ${dbName}`);
        model = connection.model(name, schema);

        // Track model compilation
        modelCompilations.set(`${dbName}.${name}`, {
          db: dbName,
          model: name,
          compiledAt: new Date(),
          schemaVersion: schema.schemaVersion || "1.0",
          stack: new Error().stack, // Capture compilation origin
        });
      }

      models[name] = model;

      // Add debug hooks to model methods
      if (DEBUG_LEVEL >= 4) {
        wrapModelWithDebugging(model, name, dbName);
      }
    } catch (err) {
      debugLog(1, `🔥 CRITICAL: Failed to compile model ${name} in ${dbName}: ${err.message}`);

      // Enhanced error diagnostics
      const errorInfo = {
        model: name,
        db: dbName,
        error: err.message,
        stack: err.stack,
        registeredSchemas: Array.from(registeredSchemas.keys()),
        existingModels: Object.keys(connection.models),
        timestamp: new Date(),
      };

      throw Object.assign(err, {
        name: "ModelCompilationError",
        diagnostics: errorInfo,
      });
    }
  }

  return models;
};

// Debugging wrapper for model methods
function wrapModelWithDebugging(model, modelName, dbName) {
  const operations = ["find", "findOne", "save", "deleteOne", "updateOne"];

  operations.forEach((op) => {
    const original = model[op];
    if (typeof original === "function") {
      model[op] = function (...args) {
        debugLog(4, `🚀 [${dbName}.${modelName}] ${op} called`, args);
        const start = Date.now();

        return original
          .apply(this, args)
          .then((result) => {
            debugLog(4, `✅ [${dbName}.${modelName}] ${op} succeeded (${Date.now() - start}ms)`);
            return result;
          })
          .catch((err) => {
            debugLog(1, `❌ [${dbName}.${modelName}] ${op} FAILED: ${err.message}`);
            err.diagnosticInfo = {
              operation: op,
              model: modelName,
              db: dbName,
              args,
              timestamp: new Date(),
            };
            throw err;
          });
      };
    }
  });
}

// Diagnostic endpoints
module.exports = {
  registerSchema,
  getTenantConnection,
  getTenantModels,

  // Diagnostic functions
  getConnectionState: (dbName) => connectionStates[dbName],
  getRegisteredSchemas: () => Array.from(registeredSchemas.keys()),
  getModelCompilations: () => Array.from(modelCompilations.values()),
  getActiveConnections: () => Object.keys(tenantConnections),

  // Debugging controls
  setDebugLevel: (level) => {
    DEBUG_LEVEL = level;
  },
  flushConnection: (dbName) => {
    if (tenantConnections[dbName]) {
      tenantConnections[dbName].close();
      delete tenantConnections[dbName];
      debugLog(2, `♻️ Connection flushed for: ${dbName}`);
    }
  },
};
