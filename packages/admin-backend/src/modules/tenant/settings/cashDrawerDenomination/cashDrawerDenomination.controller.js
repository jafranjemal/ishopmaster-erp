const asyncHandler = require("../../../../middleware/asyncHandler");

// This controller provides full CRUD for managing denominations.
exports.getAllDenominations = asyncHandler(async (req, res, next) => {
  const { CashDrawerDenomination } = req.models;
  const denominations = await CashDrawerDenomination.find({ isActive: true }).sort({ value: -1 });
  res.status(200).json({ success: true, data: denominations });
});
exports.createDenomination = asyncHandler(async (req, res, next) => {
  const { CashDrawerDenomination } = req.models;
  const denomination = await CashDrawerDenomination.create(req.body);
  res.status(201).json({ success: true, data: denomination });
});
exports.getDenominationById = asyncHandler(async (req, res, next) => {
  const { CashDrawerDenomination } = req.models;
  const denomination = await CashDrawerDenomination.findById(req.params.id);
  if (!denomination) {
    return res.status(404).json({ success: false, error: "Denomination not found" });
  }
  res.status(200).json({ success: true, data: denomination });
});
exports.updateDenomination = asyncHandler(async (req, res, next) => {
  const { CashDrawerDenomination } = req.models;
  const denomination = await CashDrawerDenomination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!denomination) {
    return res.status(404).json({ success: false, error: "Denomination not found" });
  }
  res.status(200).json({ success: true, data: denomination });
});
exports.deleteDenomination = asyncHandler(async (req, res, next) => {
  const { CashDrawerDenomination } = req.models;
  const denomination = await CashDrawerDenomination.findByIdAndDelete(req.params.id);
  if (!denomination) {
    return res.status(404).json({ success: false, error: "Denomination not found" });
  }
  res.status(200).json({ success: true, data: {} });
});
