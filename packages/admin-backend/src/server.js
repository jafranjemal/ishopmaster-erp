try {
  console.log("⚙️  server.js loaded – waiting for edits…")

  const { registerHandlebarsHelpers } = require("./config/handlebars-helpers.js")

  console.log("[DEBUG] Starting server.js execution...")
  const express = require("express")
  const dotenv = require("dotenv")
  const cors = require("cors")
  const path = require("path")
  const fs = require("fs")
  const helmet = require("helmet")
  const morgan = require("morgan")
  const chalk = require("chalk")

  const { connectAdminDB } = require("./config/db")
  const errorHandler = require("./middleware/errorHandler")
  const tenantResolver = require("./middleware/tenantResolver")
  const cron = require("node-cron")
  const databaseService = require("./services/database.service") // Our registry service
  const licenseCheck = require("./middleware/licenseCheck.middleware") // <-- 1. IMPORT NEW MIDDLEWARE

  // Route files
  const adminTenantRoutes = require("./modules/admin/tenants/tenant.routes.js")
  const adminModulesRoutes = require("./modules/admin/modules/module.routes.js")
  const adminPermissionsRoutes = require("./modules/admin/permissions/permission.routes.js")
  const adminConstantsRoutes = require("./modules/admin/constants/constants.routes.js")

  const tenantAuthRoutes = require("./modules/tenant/auth/auth.routes.js")
  const tenantRolesRoutes = require("./modules/tenant/roles/role.routes.js")
  const tenantProfileRoutes = require("./modules/tenant/profile/profile.routes.js")
  const tenantProductRoutes = require("../tenants/routes/product.routes.js")
  const Tenant = require("./modules/admin/tenants/tenant.model.js")
  const apiKeyAuth = require("./middleware/apiKeyAuth.middleware")
  const { receiveDevicePunch } = require("./modules/tenant/hr/attendance.controller")
  const dunningService = require("./services/dunning.service.js")
  const portalAuthRoutes = require("./modules/tenant/portal/customerAuth.routes.js")
  const customerAuthTokenSchema = require("./modules/tenant/portal/customerAuthToken.schema.js")
  const { metricsMiddleware } = require("./config/metrics.js")
  const { registerRepairListeners } = require("./modules/tenant/repairs/repair.listeners.js")
  console.log("[DEBUG] OK: Loaded ./modules/tenant/repairs/repair.listeners.js")
  const jobSchedulerService = require("./services/jobScheduler.service.js")
  console.log("[DEBUG] OK: Loaded ./services/jobScheduler.service.js")
  const { backupTenantDatabase } = require("./services/backup.service.js")
  const tenantBackupRoutes = require("./modules/tenant/backups/backup.routes")
  const adminBackupRoutes = require("./modules/admin/backups/backup.routes.js")

  // CORS configuration
  const allowedOrigins = [
    "http://localhost:5173", // Vite's default dev port
    "http://localhost:5174", // Vite's default dev port
    "https://ishopmaster-erp-admin-frontend.vercel.app", // Example production frontend URL
    "https://ishopmaster.vercel.app",
  ]

  // Regex patterns for dynamic subdomains
  const allowedPatterns = [
    /^https?:\/\/([a-z0-9-]+\.)?localhost:5173$/, // Local subdomains
    /^https?:\/\/([a-z0-9-]+\.)?localhost:5174$/, // Local subdomains
    /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/, // Production subdomains
  ]

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      // Check explicit allowlist
      if (allowedOrigins.includes(origin)) return callback(null, true)

      // Check regex patterns for dynamic subdomains
      if (allowedPatterns.some((pattern) => pattern.test(origin))) {
        return callback(null, true)
      }

      callback(new Error("Not allowed by CORS"))
    },
    credentials: true, // Enable if using cookies/auth
    optionsSuccessStatus: 200, // Legacy browser support
  }

  // Load env vars
  dotenv.config()

  // --- SETUP ---
  connectAdminDB()
  const app = express()
  app.use(express.json())
  //app.use(cors(corsOptions))
  app.use(cors(corsOptions))
  // Metrics endpoint
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
  })

  // Apply middleware
  app.use(metricsMiddleware)
  const portalApiRouter = express.Router()
  const publicApiRouter = express.Router()
  publicApiRouter.post("/attendance/punch", tenantResolver, apiKeyAuth, receiveDevicePunch)
  app.use("/api/v1/public", publicApiRouter)

  app.use("/api/v1/admin/backups", adminBackupRoutes)

  // --- DYNAMIC TENANT MODULE LOADER ---
  const tenantModulesPath = path.join(__dirname, "modules", "tenant")
  const tenantRouter = express.Router() // Create a dedicated router for all tenant modules

  // Improved module loader with debug information
  console.log(chalk.yellow.bold(`\n⏳ Starting module discovery in: ${tenantModulesPath}`))

  try {
    const modules = fs.readdirSync(tenantModulesPath)
    console.log(chalk.gray(`Found ${modules.length} potential modules`))

    modules.forEach((moduleName, index) => {
      try {
        const modulePath = path.join(tenantModulesPath, moduleName)
        console.log(chalk.cyan(`\n[${index + 1}/${modules.length}] Processing: ${moduleName}`))
        console.log(chalk.gray(`  Path: ${modulePath}`))

        if (!fs.statSync(modulePath).isDirectory()) {
          console.log(chalk.gray(`  SKIPPED: Not a directory`))
          return
        }

        console.log(chalk.green(`  ✓ Valid module directory`))
        const moduleIndexPath = path.join(modulePath, "index.js")

        if (!fs.existsSync(moduleIndexPath)) {
          console.log(chalk.yellow(`  WARNING: Missing index.js in ${moduleName}`))
          return
        }

        console.log(chalk.green(`  ✓ Found index.js`))
        const module = require(moduleIndexPath)

        // --- Schema Registration ---
        if (module.schemas) {
          const schemaCount = Object.keys(module.schemas).length
          console.log(chalk.blue(`  🗂️ Found ${schemaCount} schemas:`))

          for (const [name, schema] of Object.entries(module.schemas)) {
            try {
              databaseService.registerSchema(name, schema)
              console.log(chalk.green(`    ✔ Registered: ${name}`))

              // Debug schema structure
              if (process.env.DEBUG_SCHEMAS === "true") {
                console.log(chalk.gray(`      - Paths: ${Object.keys(schema.paths).join(", ")}`))
                console.log(chalk.gray(`      - Statics: ${Object.keys(schema.statics || {}).join(", ")}`))
              }
            } catch (schemaErr) {
              console.error(chalk.red(`    ❌ FAILED to register schema ${name}: ${schemaErr.message}`))
              console.error(chalk.gray(`      Error detail: ${schemaErr.stack}`))
            }
          }
        } else {
          console.log(chalk.gray(`  No schemas found in ${moduleName}`))
        }

        // --- Router Mounting ---
        if (module.router) {
          try {
            if (module.isPublic) {
              publicApiRouter.use(`/${moduleName}`, tenantResolver, module.router)
              console.log(chalk.magenta(`  🌐 Mounted PUBLIC routes at /api/v1/public/${moduleName}`))
            } else {
              tenantRouter.use(`/${moduleName}`, module.router)
              console.log(chalk.magenta(`  🔐 Mounted PRIVATE routes at /${moduleName}`))
            }

            // Debug route information
            if (process.env.DEBUG_ROUTES === "true" && module.router.stack) {
              module.router.stack.forEach((layer) => {
                if (layer.route) {
                  const methods = Object.keys(layer.route.methods).join(", ").toUpperCase()
                  console.log(chalk.gray(`      ${methods.padEnd(6)} → ${layer.route.path}`))
                }
              })
            }
          } catch (routerErr) {
            console.error(chalk.red(`  ❌ FAILED to mount routes for ${moduleName}: ${routerErr.message}`))
          }
        } else {
          console.log(chalk.gray(`  No router found in ${moduleName}`))
        }
      } catch (moduleErr) {
        console.error(chalk.red.bold(`\n🔥 CRITICAL ERROR in module ${moduleName}:`))
        console.error(chalk.red(`  ${moduleErr.message}`))
        console.error(chalk.gray(`  Stack trace: ${moduleErr.stack}`))
      }
    })

    console.log(chalk.green.bold(`\n✅ Module loading completed successfully!`))
  } catch (dirErr) {
    console.error(chalk.red.bold(`\n🚨 FATAL ERROR loading modules:`))
    console.error(chalk.red(`  ${dirErr.message}`))
    console.error(chalk.gray(`  Path: ${tenantModulesPath}`))
    console.error(chalk.gray(`  Ensure the directory exists and has proper permissions`))
    process.exit(1) // Critical failure
  }

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  // Security and Logging Middleware
  // app.use(cors()) // Enable CORS
  app.use(helmet()) // Set security headers
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev")) // Log HTTP requests in dev mode
  }

  // === Admin Routes ===
  app.use("/api/v1/admin/tenants", adminTenantRoutes)
  app.use("/api/v1/admin/modules", adminModulesRoutes)
  app.use("/api/v1/admin/permissions", adminPermissionsRoutes)
  app.use("/api/v1/admin/constants", adminConstantsRoutes)
  //app.use("/api/v1/backups", adminBackupRoutes)

  portalApiRouter.use("/auth", tenantResolver, portalAuthRoutes)
  tenantRouter.use("/backups", tenantBackupRoutes)

  app.use("/api/v1/portal", portalApiRouter)
  app.use(
    "/api/v1/portal2",
    (req, res, next) => {
      console.log("Portal2 route hit" + req.originalUrl)
    },
    portalApiRouter
  )

  // === Tenant Specific Routes ===
  // All routes below this line will have tenant context
  app.use("/api/v1/tenant", tenantResolver, licenseCheck, tenantRouter) // IMPORTANT: Resolver runs first

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
      console.log("Running daily backup job...")
      try {
        const tenants = await Tenant.find({ isActive: true })
        console.log(`Found ${tenants.length} active tenants to back up.`)
        for (const tenant of tenants) {
          try {
            await backupTenantDatabase(tenant.dbName)
          } catch (err) {
            console.error(`Failed to back up tenant ${tenant.dbName}:`, err)
          }
        }
        console.log("Daily backup job finished.")
      } catch (err) {
        console.error("Error fetching tenants for daily backup:", err)
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Colombo", // Use an appropriate timezone
    }
  )

  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log("Running nightly dunning job...")
      try {
        const tenants = await Tenant.find({ isActive: true })
        for (const tenant of tenants) {
          console.log(`Processing dunning for tenant: ${tenant.companyName}`)
          const dbConnection = await databaseService.getTenantConnection(tenant.dbName)
          const models = databaseService.getTenantModels(dbConnection)
          await dunningService.sendReminders(models)
        }
      } catch (error) {
        console.error("Error during nightly dunning job:", error)
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Colombo", // Use the appropriate timezone
    }
  )

  jobSchedulerService.initialize()
  registerHandlebarsHelpers()
  registerRepairListeners()
  console.log("✅ Application event listeners & helpers registered.")

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err)
  })

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err)
  })

  // Custom Error Handler Middleware (must be after routes)
  app.use(errorHandler)

  const PORT = process.env.PORT || 5001

  app.listen(PORT, () => {
    console.log(`Admin server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  })
} catch (e) {
  console.error("[FATAL BOOTSTRAP ERROR] The application failed to start.")
  console.error(e)
  //process.exit(1)
}
