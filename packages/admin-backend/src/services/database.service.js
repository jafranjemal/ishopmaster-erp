// const mongoose = require("mongoose");
// const userSchema = require("./tenants/models/user.model"); // Import the shared schema
// const productSchema = require("../tenants/models/product.model"); // Import new schema

// // A cache to store active tenant connections. In a production environment,
// // you might want a more sophisticated cache with eviction policies.
// const tenantConnections = {};

// /**
//  * Creates and returns a Mongoose connection to a specific tenant's database.
//  * Uses a simple in-memory cache to avoid creating a new connection for each request
//  * within the same application instance.
//  * @param {string} dbName - The name of the tenant's database (e.g., "tenant_acme_corp").
//  * @returns {Promise<mongoose.Connection>} A promise that resolves to the Mongoose connection object.
//  */
// const getTenantConnection = async (dbName) => {
//   // If a connection for the tenant already exists in our cache, return it.
//   if (tenantConnections[dbName]) {
//     console.log(`CACHE: Using cached connection for: ${dbName}`);
//     return tenantConnections[dbName];
//   }

//   // Construct the new database URI from the base URI and the tenant's dbName.
//   // This base URI should point to your MongoDB instance without a specific database name.
//   // Example: MONGO_URI_BASE=mongodb://127.0.0.1:27017
//   const mongoUri = `${process.env.MONGO_URI_BASE}/${dbName}?retryWrites=true&w=majority`;

//   console.log(`CONNECTION: Creating new connection for: ${dbName}`);

//   // Create a new Mongoose connection. This is the key to multi-tenancy.
//   const connection = mongoose.createConnection(mongoUri);

//   // Store the new connection in the cache.
//   tenantConnections[dbName] = connection;

//   // Event listeners for logging and debugging connection status.
//   connection.on("connected", () => {
//     console.log(`Mongoose connected to tenant DB: ${dbName}`);
//   });

//   connection.on("error", (err) => {
//     console.error(`Mongoose tenant DB connection error for ${dbName}:`, err);
//   });

//   connection.on("disconnected", () => {
//     console.log(`Mongoose disconnected from tenant DB: ${dbName}`);
//     // When a connection is lost, we might want to remove it from the cache.
//     delete tenantConnections[dbName];
//   });

//   // Wait for the initial connection to be established before returning.
//   await connection.asPromise();

//   return connection;
// };

// /**
//  * Gets the Mongoose models for a given tenant connection.
//  * @param {mongoose.Connection} connection - The tenant's database connection.
//  * @returns {object} An object containing the compiled Mongoose models for the tenant.
//  */
// const getTenantModels = (connection) => {
//   return {
//     User: connection.model("User", userSchema),
//     Product: connection.model("Product", productSchema),

//     // Add other tenant-specific models here in the future
//     // Product: connection.model('Product', productSchema),
//   };
// };

// module.exports = { getTenantConnection, getTenantModels };

const mongoose = require("mongoose");

// This object will hold all registered schemas, e.g., { User: userSchema, Product: productSchema }
const registeredSchemas = new Map();
const tenantConnections = {};

/**
 * Registers a schema with the service so it can be compiled into a model.
 * This is called once at server startup for each module.
 * @param {string} name - The name of the model (e.g., 'User').
 * @param {mongoose.Schema} schema - The Mongoose schema object.
 */
function registerSchemaOld(name, schema) {
  registeredSchemas.set(name, schema);
}

function registerSchema(name, schema) {
  if (registeredSchemas.has(name)) {
    console.warn(`⚠️ Schema "${name}" already registered. Overwriting.`);
  }
  registeredSchemas.set(name, schema);
}

const getTenantConnectionOld = async (dbName) => {
  if (tenantConnections[dbName]) {
    return tenantConnections[dbName];
  }
  const mongoUri = `${process.env.MONGO_URI_BASE}/${dbName}?retryWrites=true&w=majority`;
  const connection = mongoose.createConnection(mongoUri);
  tenantConnections[dbName] = connection;
  await connection.asPromise();
  return connection;
};

const getTenantConnection = async (dbName) => {
  if (tenantConnections[dbName]) {
    const conn = tenantConnections[dbName];
    // Optional: check if connection is alive
    if (conn.readyState === 1) {
      console.log(`Using cached connection for DB: ${dbName}`);
      return conn;
    } else {
      console.log(`Cached connection stale. Reconnecting DB: ${dbName}`);
      delete tenantConnections[dbName];
    }
  }

  const mongoUri = `${process.env.MONGO_URI_BASE}/${dbName}?retryWrites=true&w=majority`;
  const connection = mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Set up listeners for debugging
  connection.on("connected", () => {
    console.log(`✅ Connected to tenant DB: ${dbName}`);
  });
  connection.on("error", (err) => {
    console.error(`❌ Connection error on DB ${dbName}:`, err);
  });
  connection.on("disconnected", () => {
    console.log(`⚠️ Disconnected from tenant DB: ${dbName}`);
    delete tenantConnections[dbName];
  });

  try {
    await connection.asPromise();
    tenantConnections[dbName] = connection; // Cache **after success**
    return connection;
  } catch (err) {
    console.error(`❌ Failed to connect to DB: ${dbName}`, err);
    throw err; // Let your controller handle rollback
  }
};

/**
 * Gets the compiled Mongoose models for a given tenant connection.
 * It dynamically iterates over all registered schemas and compiles them.
 * @param {mongoose.Connection} connection - The tenant's database connection.
 * @returns {object} An object containing all compiled Mongoose models for the tenant.
 */
const getTenantModelsOld = (connection) => {
  const models = {};
  for (const [name, schema] of registeredSchemas.entries()) {
    models[name] = connection.model(name, schema);
  }
  return models;
};

const getTenantModels = (connection) => {
  const models = {};
  for (const [name, schema] of registeredSchemas.entries()) {
    if (connection.models[name]) {
      models[name] = connection.models[name];
    } else {
      models[name] = connection.model(name, schema);
    }
  }
  return models;
};

module.exports = {
  registerSchema, // <-- Expose the registration function
  getTenantConnection,
  getTenantModels,
};
