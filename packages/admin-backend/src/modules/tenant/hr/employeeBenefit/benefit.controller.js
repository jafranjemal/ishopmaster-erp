const asyncHandler = require("../../../../middleware/asyncHandler");

// --- BenefitType (Catalog) Controllers ---
exports.getAllBenefitTypes = asyncHandler(async (req, res, next) => {
  const { BenefitType } = req.models;
  const types = await BenefitType.find({}).populate("linkedLiabilityAccountId", "name");
  res.status(200).json({ success: true, data: types });
});
exports.createBenefitType = asyncHandler(async (req, res, next) => {
  const { BenefitType } = req.models;
  const type = await BenefitType.create(req.body);
  res.status(201).json({ success: true, data: type });
});
exports.updateBenefitType = asyncHandler(async (req, res, next) => {
  const { BenefitType } = req.models;
  const type = await BenefitType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!type) return res.status(404).json({ success: false, error: "Benefit type not found." });
  res.status(200).json({ success: true, data: type });
});
exports.deleteBenefitType = asyncHandler(async (req, res, next) => {
  const { BenefitType, EmployeeBenefit } = req.models;
  const count = await EmployeeBenefit.countDocuments({ benefitTypeId: req.params.id });
  if (count > 0)
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This benefit is assigned to ${count} employee(s).`,
    });
  const type = await BenefitType.findByIdAndDelete(req.params.id);
  if (!type) return res.status(404).json({ success: false, error: "Benefit type not found." });
  res.status(200).json({ success: true, data: {} });
});

// --- EmployeeBenefit (Assignment) Controllers ---
exports.getBenefitsForEmployee = asyncHandler(async (req, res, next) => {
  const { EmployeeBenefit } = req.models;
  const benefits = await EmployeeBenefit.find({ employeeId: req.params.employeeId }).populate(
    "benefitTypeId"
  );
  res.status(200).json({ success: true, data: benefits });
});
exports.assignBenefitToEmployee = asyncHandler(async (req, res, next) => {
  const { EmployeeBenefit } = req.models;
  const benefit = await EmployeeBenefit.create({ ...req.body, employeeId: req.params.employeeId });
  res.status(201).json({ success: true, data: benefit });
});
exports.deleteEmployeeBenefit = asyncHandler(async (req, res, next) => {
  const { EmployeeBenefit } = req.models;
  const benefit = await EmployeeBenefit.findByIdAndDelete(req.params.id);
  if (!benefit)
    return res.status(404).json({ success: false, error: "Assigned benefit not found." });
  res.status(200).json({ success: true, data: {} });
});
