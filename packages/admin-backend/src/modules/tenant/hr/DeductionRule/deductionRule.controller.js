// @desc    Get all deduction rules

const asyncHandler = require("../../../../middleware/asyncHandler");

// @route   GET /api/v1/tenant/hr/deduction-rules
exports.getAllDeductionRules = asyncHandler(async (req, res, next) => {
  const { DeductionRule } = req.models;
  const rules = await DeductionRule.find({}).populate("linkedAccountId", "name");
  res.status(200).json({ success: true, data: rules });
});

// @desc    Create a new deduction rule
// @route   POST /api/v1/tenant/hr/deduction-rules
exports.createDeductionRule = asyncHandler(async (req, res, next) => {
  const { DeductionRule } = req.models;
  const newRule = await DeductionRule.create(req.body);
  res.status(201).json({ success: true, data: newRule });
});

// @desc    Update a deduction rule
// @route   PUT /api/v1/tenant/hr/deduction-rules/:id
exports.updateDeductionRule = asyncHandler(async (req, res, next) => {
  const { DeductionRule } = req.models;
  const updatedRule = await DeductionRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedRule)
    return res.status(404).json({ success: false, error: "Deduction rule not found." });
  res.status(200).json({ success: true, data: updatedRule });
});

// @desc    Delete a deduction rule
// @route   DELETE /api/v1/tenant/hr/deduction-rules/:id
exports.deleteDeductionRule = asyncHandler(async (req, res, next) => {
  const { DeductionRule, Payslip } = req.models;
  const ruleId = req.params.id;
  const rule = await DeductionRule.findById(ruleId);
  if (!rule) return res.status(404).json({ success: false, error: "Deduction rule not found." });

  // Integrity Check: Prevent deletion if this rule has been used on any payslip.
  const payslipCount = await Payslip.countDocuments({ "deductions.ruleName": rule.name });
  if (payslipCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. This rule has been used on ${payslipCount} historical payslip(s). You can deactivate it instead.`,
      });
  }

  await rule.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
