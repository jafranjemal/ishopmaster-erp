const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllWarrantyPolicies = asyncHandler(async (req, res, next) => {
  const { WarrantyPolicy } = req.models;
  const policies = await WarrantyPolicy.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: policies });
});

exports.createWarrantyPolicy = asyncHandler(async (req, res, next) => {
  const { WarrantyPolicy } = req.models;
  const policy = await WarrantyPolicy.create(req.body);
  res.status(201).json({ success: true, data: policy });
});

exports.updateWarrantyPolicy = asyncHandler(async (req, res, next) => {
  const { WarrantyPolicy } = req.models;
  const policy = await WarrantyPolicy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!policy) return res.status(404).json({ success: false, error: "Warranty policy not found." });
  res.status(200).json({ success: true, data: policy });
});

exports.deleteWarrantyPolicy = asyncHandler(async (req, res, next) => {
  const { WarrantyPolicy, ProductTemplates } = req.models;
  const policyId = req.params.id;
  // Integrity Check: Prevent deleting if this policy is linked to any product templates.
  const templateCount = await ProductTemplates.countDocuments({
    defaultWarrantyPolicyId: policyId,
  });
  if (templateCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This policy is the default for ${templateCount} product template(s).`,
    });
  }
  const policy = await WarrantyPolicy.findByIdAndDelete(policyId);
  if (!policy) return res.status(404).json({ success: false, error: "Warranty policy not found." });
  res.status(200).json({ success: true, data: {} });
});

exports.getWarrantyPolicyById = asyncHandler(async (req, res, next) => {
  const { WarrantyPolicy } = req.models;
  const policy = await WarrantyPolicy.findById(req.params.id);
  if (!policy) return res.status(404).json({ success: false, error: "Warranty policy not found." });
  res.status(200).json({ success: true, data: policy });
});
