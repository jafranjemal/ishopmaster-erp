const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllTaxRules = asyncHandler(async (req, res, next) => {
  const { TaxRule } = req.models;
  const rules = await TaxRule.find({})
    .populate("linkedAccountId", "name")
    .populate("branchId", "name")
    .populate("taxCategoryId", "name rate type isCompound linkedAccountId")
    .sort({ name: 1 });
  res.status(200).json({ success: true, data: rules });
});

exports.createTaxRule = asyncHandler(async (req, res, next) => {
  const { TaxRule } = req.models;
  const rule = await TaxRule.create(req.body);
  res.status(201).json({ success: true, data: rule });
});

exports.updateTaxRule = asyncHandler(async (req, res, next) => {
  const { TaxRule } = req.models;
  const rule = await TaxRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!rule) return res.status(404).json({ success: false, error: "Tax rule not found." });
  res.status(200).json({ success: true, data: rule });
});

exports.deleteTaxRule = asyncHandler(async (req, res, next) => {
  const { TaxRule, SalesInvoice } = req.models;
  const rule = await TaxRule.findById(req.params.id);
  if (!rule) return res.status(404).json({ success: false, error: "Tax rule not found." });

  // Integrity Check: This is a simplified check. A real system might check a dedicated tax line item table.
  const invoiceCount = await SalesInvoice.countDocuments({ "taxBreakdown.ruleName": rule.name });
  if (invoiceCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This rule has been used on ${invoiceCount} historical invoice(s). You can deactivate it instead.`,
    });
  }

  await rule.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
