const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all categories
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const categories = await Category.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

// @desc    Create a new category
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const newCategory = await Category.create(req.body);
  res.status(201).json({ success: true, data: newCategory });
});

// @desc    Update a category
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedCategory)
    return res
      .status(404)
      .json({ success: false, error: "Category not found" });
  res.status(200).json({ success: true, data: updatedCategory });
});

// @desc    Delete a category
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { Category, ProductTemplate } = req.models;
  const productCount = await ProductTemplate.countDocuments({
    categoryId: req.params.id,
  });
  if (productCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete category. It is assigned to ${productCount} product(s).`,
      });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category)
    return res
      .status(404)
      .json({ success: false, error: "Category not found" });
  res.status(200).json({ success: true, data: {} });
});
