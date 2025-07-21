const asyncHandler = require("../../../middleware/asyncHandler");

/**
 * @desc    Get the public-safe profile of the current tenant.
 * @route   GET /api/v1/public/portal/tenant-profile
 * @access  Public
 */
exports.getPublicTenantProfile = asyncHandler(async (req, res, next) => {
  // The publicTenantResolver has already found and attached the tenant object.
  // We only return a subset of the data to avoid exposing sensitive info.
  const tenantProfile = {
    companyName: req.tenant.companyName,
    settings: {
      localization: req.tenant.settings.localization,
    },
  };
  res.status(200).json({ success: true, data: tenantProfile });
});
