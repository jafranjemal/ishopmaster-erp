const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all financial periods
// @route   GET /api/v1/tenant/accounting/periods
exports.getAllPeriods = asyncHandler(async (req, res, next) => {
  const { FinancialPeriod } = req.models;
  const periods = await FinancialPeriod.find({}).sort({ startDate: -1 });
  res.status(200).json({ success: true, data: periods });
});

// @desc    Create a new financial period
// @route   POST /api/v1/tenant/accounting/periods
exports.createPeriod = asyncHandler(async (req, res, next) => {
  const { FinancialPeriod } = req.models;
  const newPeriod = await FinancialPeriod.create(req.body);
  res.status(201).json({ success: true, data: newPeriod });
});

// @desc    Update a financial period
// @route   PUT /api/v1/tenant/accounting/periods/:id
exports.updatePeriod = asyncHandler(async (req, res, next) => {
  const { FinancialPeriod } = req.models;
  const period = await FinancialPeriod.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!period)
    return res.status(404).json({ success: false, error: "Financial period not found." });
  res.status(200).json({ success: true, data: period });
});
