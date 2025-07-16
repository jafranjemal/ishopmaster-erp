const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllTaxCategories = asyncHandler(async (req, res, next) => {
  const { TaxCategory } = req.models;
  const categories = await TaxCategory.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

exports.createTaxCategory = asyncHandler(async (req, res, next) => {
  const { TaxCategory } = req.models;
  const category = await TaxCategory.create(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateTaxCategory = asyncHandler(async (req, res, next) => {
  const { TaxCategory } = req.models;
  const category = await TaxCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return res.status(404).json({ success: false, error: "Tax category not found." });
  res.status(200).json({ success: true, data: category });
});

exports.deleteTaxCategory = asyncHandler(async (req, res, next) => {
  const { TaxCategory, TaxRule } = req.models;
  const categoryId = req.params.id;

  const ruleCount = await TaxRule.countDocuments({ taxCategoryId: categoryId });
  if (ruleCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. This category is used by ${ruleCount} tax rule(s).`,
      });
  }

  const category = await TaxCategory.findByIdAndDelete(categoryId);
  if (!category) return res.status(404).json({ success: false, error: "Tax category not found." });
  res.status(200).json({ success: true, data: {} });
});
