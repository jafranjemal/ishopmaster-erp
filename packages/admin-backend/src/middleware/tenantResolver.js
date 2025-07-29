const asyncHandler = require("./asyncHandler")
const Tenant = require("../modules/admin/tenants/tenant.model")
const { getTenantConnection, getTenantModels } = require("../services/database.service")

/**
 * Middleware to identify the tenant from the request and attach
 * the tenant's DB connection and models to the request object.
 */
const tenantResolver = asyncHandler(async (req, res, next) => {
  let tenantId = req.headers["x-tenant-id"] // Or req.subdomains[0], etc.

  // 1. Check for the header (highest priority)
  const headerTenantId = req.headers["x-tenant-id"]
  if (headerTenantId) {
    tenantId = headerTenantId
  } else {
    // 2. Check for subdomain
    const hostname = req.hostname
    const parts = hostname.split(".")
    // A simple check for a subdomain (e.g., 'shop-a.localhost' or 'shop-a.ishopmaster.app')
    if (parts.length > 2 && parts[0] !== "www") {
      tenantId = parts[0]
    } else {
      // 3. Check for URL path (e.g., /api/v1/public/portal/shop-a/...)
      const pathSegments = req.path.split("/")
      // Example path: /api/v1/public/portal/shop-a/quotes/123
      const portalIndex = pathSegments.indexOf("portal")
      if (portalIndex !== -1 && pathSegments.length > portalIndex + 1) {
        tenantId = pathSegments[portalIndex + 1]
      }
    }
  }

  if (!tenantId) {
    return res.status(400).json({ success: false, error: "X-Tenant-ID header is required." })
  }

  // Find the tenant in the central admin database.
  const tenant = await Tenant.findOne({ subdomain: tenantId })

  if (!tenant) {
    return res.status(404).json({ success: false, error: "Tenant not found." })
  }

  // === LICENSE CHECK GATEKEEPER ===
  // 1. Check if the tenant account is active.
  if (!tenant.isActive) {
    return res.status(403).json({
      success: false,
      error: "This account is inactive. Please contact support.",
    })
  }

  // Get a connection to the tenant's specific database.
  const dbConnection = await getTenantConnection(tenant.dbName)

  // Attach the connection and tenant-specific models to the request object.
  req.dbConnection = dbConnection
  req.models = getTenantModels(dbConnection)
  req.tenant = tenant // Attach tenant info for potential use
  next()
})

module.exports = tenantResolver
