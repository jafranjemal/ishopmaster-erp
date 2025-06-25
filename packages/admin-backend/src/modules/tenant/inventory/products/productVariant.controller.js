const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all product variants, with optional filtering
// @route   GET /api/v1/tenant/inventory/products/variants
exports.getAllVariants = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;

  let query = {};
  // This allows us to get all variants for a specific template
  if (req.query.templateId) {
    query.templateId = req.query.templateId;
    query.isActive = true;
  }

  const variants = await ProductVariants.find(query);

  const sortedVariants = variants.sort((a, b) =>
    a.variantName.localeCompare(b.variantName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  res.status(200).json({ success: true, data: sortedVariants });
});

// @desc    Update a single product variant
// @route   PUT /api/v1/tenant/inventory/products/variants/:id
exports.updateVariant = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  // Whitelist fields like sku, sellingPrice, costPrice
  const { sku, sellingPrice, costPrice, isActive } = req.body;
  const fieldsToUpdate = { sku, sellingPrice, costPrice, isActive };

  const updatedVariant = await ProductVariants.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );
  if (!updatedVariant)
    return res
      .status(404)
      .json({ success: false, error: "Product Variant not found" });
  res.status(200).json({ success: true, data: updatedVariant });
});

// @desc    Search for product variants by name or SKU
// @route   GET /api/v1/tenant/inventory/products/variants/search?term=...
exports.searchVariants = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  const searchTerm = req.query.term || "";

  if (searchTerm.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Use a case-insensitive regex for searching
  const regex = new RegExp(searchTerm, "i");
  const query = {
    $or: [{ variantName: { $regex: regex } }, { sku: { $regex: regex } }],
  };

  const variants = await ProductVariants.find(query).limit(10).lean();
  res.status(200).json({ success: true, data: variants });
});

// @desc    Perform a bulk update on multiple product variants
// @route   PATCH /api/v1/tenant/inventory/products/variants/bulk-update
// @access  Private (Requires 'inventory:product:manage' permission)
exports.bulkUpdateVariants = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  const { variants } = req.body; // Expect an array of variant objects

  if (!Array.isArray(variants) || variants.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "An array of variants is required." });
  }

  // Construct the array of update operations for bulkWrite
  const operations = variants.map((variant) => {
    // Whitelist the fields that can be updated in bulk for security
    const fieldsToSet = {
      sku: variant.sku,
      sellingPrice: variant.sellingPrice,
      costPrice: variant.costPrice,
    };

    // Remove any undefined fields so we don't accidentally overwrite with null
    Object.keys(fieldsToSet).forEach((key) => {
      if (fieldsToSet[key] === undefined) {
        delete fieldsToSet[key];
      }
    });

    return {
      updateOne: {
        filter: { _id: variant._id }, // Find the document by its unique ID
        update: { $set: fieldsToSet }, // Set the new values
      },
    };
  });

  // Execute all update operations in a single database command
  const result = await ProductVariants.bulkWrite(operations);

  res.status(200).json({
    success: true,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

// @desc    Get a single product variant by its ID
// @route   GET /api/v1/tenant/inventory/products/variants/:id
exports.getVariantById = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  const variant = await ProductVariants.findById(req.params.id).lean();

  if (!variant) {
    return res
      .status(404)
      .json({ success: false, error: "Product Variant not found" });
  }
  res.status(200).json({ success: true, data: variant });
});
