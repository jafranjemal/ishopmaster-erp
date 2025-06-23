const asyncHandler = require("../../../middleware/asyncHandler");
const Tenant = require("../../admin/tenants/tenant.model");

// @desc    Get the profile of the currently authenticated tenant
// @route   GET /api/v1/tenant/profile
// @access  Private (Tenant users)
exports.getMyProfile_old = asyncHandler(async (req, res, next) => {
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

// @desc    Get the profile of the currently authenticated tenant
// @route   GET /api/v1/tenant/profile
// @access  Private (Tenant users)
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  // 1. Get the SECURE tenant ID from the resolver. We do not trust the data on req.tenant, only its ID.
  const tenantId = req.tenant._id;

  // 2. Perform a FRESH database query to get the latest version of the document.
  // We use .lean() for a small performance boost as we are only reading the data.
  const freshTenant = await Tenant.findById(tenantId).lean();

  if (!freshTenant) {
    return res
      .status(404)
      .json({ success: false, error: "Tenant profile could not be found." });
  }

  // 3. We explicitly destructure the fields to create a clean profile object,
  //    ensuring no sensitive or unnecessary data is ever sent to the frontend.
  const {
    _id,
    companyName,
    subdomain,
    licenseExpiry,
    isActive,
    settings,
    enabledModules,
    companyProfile, // Include the new companyProfile object
  } = freshTenant;

  const profile = {
    _id,
    companyName,
    subdomain,
    licenseExpiry,
    isActive,
    settings,
    enabledModules,
    companyProfile,
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
  // We get the tenant ID securely from the req.tenant object attached by the resolver.
  // This ensures a user can ONLY ever update their own tenant's settings.
  const tenantId = req.tenant._id;

  // Whitelist the specific fields from the request body.
  const { baseCurrency, supportedCurrencies, defaultLanguage, timezone } =
    req.body;

  // Use MongoDB's dot notation to perform a targeted update on the nested object.
  // This is a professional pattern that prevents overwriting other settings.
  const fieldsToUpdate = {
    "settings.localization.baseCurrency": baseCurrency,
    "settings.localization.supportedCurrencies": supportedCurrencies,
    "settings.localization.defaultLanguage": defaultLanguage,
    "settings.localization.timezone": timezone,
  };

  // Remove any undefined fields so we don't accidentally erase data.
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
  });

  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.tenant._id,
    { $set: fieldsToUpdate },
    { new: true, runValidators: true }
  ).lean(); // Use lean for a plain JS object

  if (!updatedTenant) {
    return res
      .status(404)
      .json({ success: false, error: "Tenant profile not found." });
  }

  const {
    _id,
    companyName,
    subdomain,
    licenseExpiry,
    isActive,
    settings,
    enabledModules,
  } = updatedTenant;
  const profile = {
    _id,
    companyName,
    subdomain,
    licenseExpiry,
    isActive,
    settings,
    enabledModules,
  };

  res.status(200).json({ success: true, data: profile });

  // Note: We return the updated profile without sensitive fields like password.
});
