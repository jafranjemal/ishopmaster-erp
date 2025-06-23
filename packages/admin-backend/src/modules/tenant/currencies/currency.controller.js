const asyncHandler = require("../../../middleware/asyncHandler");

// --- CURRENCY CONTROLLERS ---

// @desc    Get all supported currencies for the tenant
// @route   GET /api/v1/tenant/currencies/
exports.getAllCurrencies = asyncHandler(async (req, res, next) => {
  const { Currency } = req.models;
  const currencies = await Currency.find({ isActive: true }).sort({ code: 1 });
  res.status(200).json({ success: true, data: currencies });
});

// @desc    Create a new supported currency
// @route   POST /api/v1/tenant/currencies/
exports.createCurrency = asyncHandler(async (req, res, next) => {
  const { Currency } = req.models;
  const newCurrency = await Currency.create(req.body);
  res.status(201).json({ success: true, data: newCurrency });
});

// @desc    Update a currency
// @route   PUT /api/v1/tenant/currencies/:id
exports.updateCurrency = asyncHandler(async (req, res, next) => {
  const { Currency } = req.models;
  const updatedCurrency = await Currency.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedCurrency)
    return res
      .status(404)
      .json({ success: false, error: "Currency not found" });
  res.status(200).json({ success: true, data: updatedCurrency });
});

// @desc    Delete a currency
// @route   DELETE /api/v1/tenant/currencies/:id
exports.deleteCurrency = asyncHandler(async (req, res, next) => {
  const { Currency, ExchangeRate } = req.models;
  const currency = await Currency.findById(req.params.id);

  if (!currency)
    return res
      .status(404)
      .json({ success: false, error: "Currency not found" });

  // Integrity Check 1: Prevent deleting the tenant's base currency
  if (req.tenant.settings.localization.baseCurrency === currency.code) {
    return res
      .status(400)
      .json({ success: false, error: "Cannot delete the base currency." });
  }

  // Integrity Check 2: Prevent deleting if used in any exchange rate
  const rateCount = await ExchangeRate.countDocuments({
    $or: [{ fromCurrency: currency.code }, { toCurrency: currency.code }],
  });
  if (rateCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. Currency is used in ${rateCount} exchange rate entries.`,
      });
  }

  await currency.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// --- EXCHANGE RATE CONTROLLERS ---

// @desc    Get exchange rates with pagination and filtering
// @route   GET /api/v1/tenant/currencies/rates
exports.getExchangeRates = asyncHandler(async (req, res, next) => {
  const { ExchangeRate } = req.models;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const [rates, total] = await Promise.all([
    ExchangeRate.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    ExchangeRate.countDocuments(query),
  ]);

  res
    .status(200)
    .json({
      success: true,
      total,
      pagination: { currentPage: page, totalPages: Math.ceil(total / limit) },
      data: rates,
    });
});

// @desc    Create or update an exchange rate for a specific day
// @route   POST /api/v1/tenant/currencies/rates
exports.createOrUpdateExchangeRate = asyncHandler(async (req, res, next) => {
  const { ExchangeRate } = req.models;
  const { fromCurrency, toCurrency, date, rate } = req.body;

  // Normalize date to remove time component for consistent daily rates
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Use findOneAndUpdate with upsert to either create a new rate or update an existing one for that day.
  const exchangeRate = await ExchangeRate.findOneAndUpdate(
    { fromCurrency, toCurrency, date: targetDate },
    { $set: { rate } },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: exchangeRate });
});

// @desc    Delete an exchange rate entry
// @route   DELETE /api/v1/tenant/currencies/rates/:id
exports.deleteExchangeRate = asyncHandler(async (req, res, next) => {
  const { ExchangeRate } = req.models;
  const rate = await ExchangeRate.findByIdAndDelete(req.params.id);
  if (!rate)
    return res
      .status(404)
      .json({ success: false, error: "Exchange rate not found" });
  res.status(200).json({ success: true, data: {} });
});
