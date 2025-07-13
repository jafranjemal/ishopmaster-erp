const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const morgan = require("morgan");
const { connectAdminDB } = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const tenantResolver = require("./middleware/tenantResolver");
const cron = require("node-cron");
const { backupTenantDatabase } = require("./services/backup.service.js");
const databaseService = require("./services/database.service"); // Our registry service
const licenseCheck = require("./middleware/licenseCheck.middleware"); // <-- 1. IMPORT NEW MIDDLEWARE

// Route files
const adminTenantRoutes = require("./modules/admin/tenants/tenant.routes.js");
const adminModulesRoutes = require("./modules/admin/modules/module.routes.js");
const adminPermissionsRoutes = require("./modules/admin/permissions/permission.routes.js");

const tenantAuthRoutes = require("./modules/tenant/auth/auth.routes.js");
const tenantRolesRoutes = require("./modules/tenant/roles/role.routes.js");
const tenantProfileRoutes = require("./modules/tenant/profile/profile.routes.js");
const tenantProductRoutes = require("../tenants/routes/product.routes.js");
const backupRoutes = require("./modules/backups/backup.routes.js");
const Tenant = require("./modules/admin/tenants/tenant.model.js");
const apiKeyAuth = require("./middleware/apiKeyAuth.middleware");
const { receiveDevicePunch } = require("./modules/tenant/hr/attendance.controller");
const dunningService = require("./services/dunning.service.js");
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Vite's default dev port
  "http://localhost:5174", // Vite's default dev port
  "https://ishop-master-frontend.onrender.com", // Example production frontend URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or requests from our whitelisted origins.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Load env vars
dotenv.config();

// --- SETUP ---
connectAdminDB();
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const publicApiRouter = express.Router();
publicApiRouter.post("/attendance/punch", tenantResolver, apiKeyAuth, receiveDevicePunch);
app.use("/api/v1/public", publicApiRouter);

// --- DYNAMIC TENANT MODULE LOADER ---
const tenantModulesPath = path.join(__dirname, "modules", "tenant");
const tenantRouter = express.Router(); // Create a dedicated router for all tenant modules

fs.readdirSync(tenantModulesPath).forEach((moduleName) => {
  const modulePath = path.join(tenantModulesPath, moduleName);
  if (fs.statSync(modulePath).isDirectory()) {
    console.log(`Loading tenant module: ${moduleName}`);
    const module = require(path.join(modulePath, "index.js"));

    // 1. Register all schemas from the module
    if (module.schemas) {
      for (const [name, schema] of Object.entries(module.schemas)) {
        databaseService.registerSchema(name, schema);
        console.log(`  - Registered schema: ${name}`);
      }
    }

    // 2. Mount the module's router on a sub-path
    if (module.router) {
      tenantRouter.use(`/${moduleName}`, module.router);
      console.log(`  - Mounted routes at /${moduleName}`);
    }
  }
});
// --- END OF LOADER ---

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security and Logging Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Set security headers
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Log HTTP requests in dev mode
}

// === Admin Routes ===
app.use("/api/v1/admin/tenants", adminTenantRoutes);
app.use("/api/v1/admin/modules", adminModulesRoutes);
app.use("/api/v1/admin/permissions", adminPermissionsRoutes);
app.use("/api/v1/backups", backupRoutes);

// === Tenant Specific Routes ===
// All routes below this line will have tenant context
app.use("/api/v1/tenant", tenantResolver, licenseCheck, tenantRouter); // IMPORTANT: Resolver runs first

// Now we mount the actual tenant business logic routes after the resolver.
// app.use("/api/v1/tenant/auth", tenantAuthRoutes);
// app.use("/api/v1/tenant/roles", tenantRolesRoutes);
// app.use("/api/v1/tenant/profile", tenantProfileRoutes);
// app.use("/api/v1/tenant/products", tenantProductRoutes);

// === Scheduled Jobs ===
// Schedule a cron job to run at 2:00 AM every day.
cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("Running daily backup job...");
    try {
      const tenants = await Tenant.find({ isActive: true });
      console.log(`Found ${tenants.length} active tenants to back up.`);
      for (const tenant of tenants) {
        try {
          await backupTenantDatabase(tenant.dbName);
        } catch (err) {
          console.error(`Failed to back up tenant ${tenant.dbName}:`, err);
        }
      }
      console.log("Daily backup job finished.");
    } catch (err) {
      console.error("Error fetching tenants for daily backup:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Colombo", // Use an appropriate timezone
  }
);

cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("Running nightly dunning job...");
    try {
      const tenants = await Tenant.find({ isActive: true });
      for (const tenant of tenants) {
        console.log(`Processing dunning for tenant: ${tenant.companyName}`);
        const dbConnection = await databaseService.getTenantConnection(tenant.dbName);
        const models = databaseService.getTenantModels(dbConnection);
        await dunningService.sendReminders(models);
      }
    } catch (error) {
      console.error("Error during nightly dunning job:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Colombo", // Use the appropriate timezone
  }
);
// Custom Error Handler Middleware (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Admin server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
