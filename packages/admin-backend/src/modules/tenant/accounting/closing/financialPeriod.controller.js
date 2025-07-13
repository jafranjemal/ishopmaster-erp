const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");
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

// @desc    Generate all 12 monthly financial periods for a given year
// @route   POST /api/v1/tenant/accounting/periods/generate-year
exports.generateYearlyPeriods = asyncHandler(async (req, res, next) => {
  const { FinancialPeriod } = req.models;
  const { year } = req.body;

  if (!year || isNaN(parseInt(year))) {
    return res.status(400).json({ success: false, error: "A valid year is required." });
  }

  // Check if periods for this year already exist to prevent duplicates
  const existingPeriod = await FinancialPeriod.findOne({ name: `January ${year}` });
  if (existingPeriod) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Financial periods for ${year} have already been generated.`,
      });
  }

  const periodsToCreate = [];
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Day 0 of next month is the last day of current month
    const monthName = startDate.toLocaleString("default", { month: "long" });

    periodsToCreate.push({
      name: `${monthName} ${year}`,
      startDate,
      endDate,
      status: "Open",
    });
  }

  const newPeriods = await FinancialPeriod.insertMany(periodsToCreate);
  res
    .status(201)
    .json({
      success: true,
      data: newPeriods,
      message: `Successfully generated 12 financial periods for ${year}.`,
    });
});
