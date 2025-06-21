const asyncHandler = require("../../../middleware/asyncHandler");
const Tenant = require("../../admin/tenants/tenant.model");

// @desc    Get the profile of the currently authenticated tenant
// @route   GET /api/v1/tenant/profile
// @access  Private (Tenant users)
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  // The `tenantResolver` middleware has already done the work of finding
  // and validating the tenant. We just need to return it.
  // We explicitly exclude sensitive or large fields we don't need on the frontend.
  const {
    _id,
    companyName,
    subdomain,
    licenseExpiry,
    isActive,
    settings,
    enabledModules,
  } = req.tenant;

  const profile = {
    _id,
    companyName,
    subdomain,
    licenseExpiry,
    isActive,
    settings,
    enabledModules,
  };

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// @desc    Update the profile of the currently authenticated tenant
// @route   PUT /api/v1/tenant/profile
// @access  Private (Tenant users with permission)
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  // Whitelist of fields a tenant is allowed to change.
  const fieldsToUpdate = {
    companyName: req.body.companyName,
    companyProfile: req.body.companyProfile,
  };

  // Find the tenant record in the Admin DB using the ID from the resolver.
  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.tenant._id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  if (!updatedTenant) {
    return res
      .status(404)
      .json({ success: false, error: "Tenant profile not found." });
  }

  res.status(200).json({ success: true, data: updatedTenant });
});

// @desc    Update the localization settings of the currently authenticated tenant
// @route   PUT /api/v1/tenant/profile/localization
// @access  Private (Tenant users with 'settings:access' permission)
exports.updateLocalizationSettings = asyncHandler(async (req, res, next) => {
  const { baseCurrency, supportedCurrencies, defaultLanguage, timezone } =
    req.body;

  // Whitelist of fields a tenant is allowed to change.
  const fieldsToUpdate = {
    "settings.localization.baseCurrency": baseCurrency,
    "settings.localization.supportedCurrencies": supportedCurrencies,
    "settings.localization.defaultLanguage": defaultLanguage,
    "settings.localization.timezone": timezone,
  };

  // Remove any undefined fields so we don't overwrite with null
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
  });

  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.tenant._id,
    { $set: fieldsToUpdate },
    { new: true, runValidators: true }
  );

  if (!updatedTenant) {
    return res
      .status(404)
      .json({ success: false, error: "Tenant profile not found." });
  }

  res
    .status(200)
    .json({ success: true, data: updatedTenant.settings.localization });
});
