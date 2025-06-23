const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all brands for the current tenant
// @route   GET /api/v1/tenant/inventory/brands
exports.getAllBrands = asyncHandler(async (req, res, next) => {
  const { Brand } = req.models;
  const brands = await Brand.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: brands });
});

// @desc    Create a new brand
// @route   POST /api/v1/tenant/inventory/brands
exports.createBrand = asyncHandler(async (req, res, next) => {
  const { Brand } = req.models;
  const newBrand = await Brand.create(req.body);
  res.status(201).json({ success: true, data: newBrand });
});

// @desc    Update a brand
// @route   PUT /api/v1/tenant/inventory/brands/:id
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { Brand } = req.models;
  const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedBrand)
    return res.status(404).json({ success: false, error: "Brand not found" });
  res.status(200).json({ success: true, data: updatedBrand });
});

// @desc    Delete a brand
// @route   DELETE /api/v1/tenant/inventory/brands/:id
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { Brand, ProductTemplates } = req.models;

  // Data Integrity Check: Ensure brand is not in use before deleting.
  const productCount = await ProductTemplates.countDocuments({
    brandId: req.params.id,
  });
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete brand. It is currently assigned to ${productCount} product(s).`,
    });
  }

  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand)
    return res.status(404).json({ success: false, error: "Brand not found" });

  res.status(200).json({ success: true, data: {} });
});
