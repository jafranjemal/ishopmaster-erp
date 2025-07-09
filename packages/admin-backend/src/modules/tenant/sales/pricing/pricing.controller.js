const asyncHandler = require("../../../../middleware/asyncHandler");

// --- PricingRule Controllers ---

exports.getAllPricingRules = asyncHandler(async (req, res, next) => {
  const { PricingRule } = req.models;
  const rules = await PricingRule.find({})
    .populate("customerGroupId", "name")
    .populate("productCategoryId", "name");
  res.status(200).json({ success: true, data: rules });
});

exports.createPricingRule = asyncHandler(async (req, res, next) => {
  const { PricingRule } = req.models;
  const rule = await PricingRule.create(req.body);
  res.status(201).json({ success: true, data: rule });
});

exports.updatePricingRule = asyncHandler(async (req, res, next) => {
  const { PricingRule } = req.models;
  const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!rule) return res.status(404).json({ success: false, error: "Pricing rule not found." });
  res.status(200).json({ success: true, data: rule });
});

exports.deletePricingRule = asyncHandler(async (req, res, next) => {
  const { PricingRule } = req.models;
  // In a real system, we'd check if this rule was ever applied to a SalesInvoice before deleting.
  const rule = await PricingRule.findByIdAndDelete(req.params.id);
  if (!rule) return res.status(404).json({ success: false, error: "Pricing rule not found." });
  res.status(200).json({ success: true, data: {} });
});

// --- Promotion Controllers ---

exports.getAllPromotions = asyncHandler(async (req, res, next) => {
  const { Promotion } = req.models;
  const promotions = await Promotion.find({});
  res.status(200).json({ success: true, data: promotions });
});

exports.createPromotion = asyncHandler(async (req, res, next) => {
  const { Promotion } = req.models;
  const promotion = await Promotion.create(req.body);
  res.status(201).json({ success: true, data: promotion });
});

exports.updatePromotion = asyncHandler(async (req, res, next) => {
  const { Promotion } = req.models;
  const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!promotion) return res.status(404).json({ success: false, error: "Promotion not found." });
  res.status(200).json({ success: true, data: promotion });
});

exports.deletePromotion = asyncHandler(async (req, res, next) => {
  const { Promotion } = req.models;
  // Similar to pricing rules, we would check for usage before allowing deletion.
  const promotion = await Promotion.findByIdAndDelete(req.params.id);
  if (!promotion) return res.status(404).json({ success: false, error: "Promotion not found." });
  res.status(200).json({ success: true, data: {} });
});
