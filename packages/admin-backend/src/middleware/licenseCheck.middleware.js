const asyncHandler = require("./asyncHandler");

/**
 * Middleware to check if the tenant's license is active and not expired.
 * This runs after the tenantResolver and before any protected routes.
 */
const licenseCheck = asyncHandler(async (req, res, next) => {
  // The tenant object is attached by the preceding tenantResolver middleware.
  if (!req.tenant) {
    return res.status(404).json({ success: false, error: "Tenant not identified." });
  }

  // Check if the tenant account itself is active.
  if (!req.tenant.isActive) {
    return res.status(403).json({
      success: false,
      error: "ACCOUNT_DISABLED",
      message: "This account has been disabled.",
    });
  }

  // Check the license expiry date.
  const licenseExpiryDate = new Date(req.tenant.licenseExpiry);
  const now = new Date();

  if (licenseExpiryDate < now) {
    return res.status(403).json({
      success: false,
      error: "LICENSE_EXPIRED",
      message:
        "Your license has expired. Please renew your subscription to continue using the service.",
    });
  }

  // If all checks pass, proceed to the next middleware in the chain (e.g., auth check).
  next();
});

module.exports = licenseCheck;
