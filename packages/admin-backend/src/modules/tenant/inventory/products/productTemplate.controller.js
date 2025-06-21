const asyncHandler = require("../../../../middleware/asyncHandler");

// Helper function to calculate the Cartesian product of multiple arrays
const cartesian = (...a) =>
  a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

// @desc    Get all product templates
// @route   GET /api/v1/tenant/inventory/products/templates
exports.getAllTemplates = asyncHandler(async (req, res, next) => {
  const { ProductTemplate } = req.models;
  const templates = await ProductTemplate.find({})
    .populate("brandId", "name")
    .populate("categoryId", "name")
    .sort({ baseName: 1 });
  res.status(200).json({ success: true, data: templates });
});

// @desc    Get a single product template and its attribute set details
// @route   GET /api/v1/tenant/inventory/products/templates/:id
exports.getTemplateById = asyncHandler(async (req, res, next) => {
  const { ProductTemplate } = req.models;
  const template = await ProductTemplate.findById(req.params.id)
    .populate("brandId", "name")
    .populate("categoryId", "name")
    .populate({
      path: "attributeSetId",
      select: "name attributes",
      populate: { path: "attributes", select: "name values key" }, // Populate attributes within the set
    })
    .lean();

  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });
  res.status(200).json({ success: true, data: template });
});

// @desc    Create a new product template
// @route   POST /api/v1/tenant/inventory/products/templates
exports.createTemplate = asyncHandler(async (req, res, next) => {
  const { ProductTemplate } = req.models;
  const newTemplate = await ProductTemplate.create(req.body);
  res.status(201).json({ success: true, data: newTemplate });
});

// @desc    Update a product template
// @route   PUT /api/v1/tenant/inventory/products/templates/:id
exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const { ProductTemplate } = req.models;
  const updatedTemplate = await ProductTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedTemplate)
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });
  res.status(200).json({ success: true, data: updatedTemplate });
});

// @desc    Delete a product template
// @route   DELETE /api/v1/tenant/inventory/products/templates/:id
exports.deleteTemplate = asyncHandler(async (req, res, next) => {
  const { ProductTemplate, ProductVariant } = req.models;
  const variantCount = await ProductVariant.countDocuments({
    templateId: req.params.id,
  });
  if (variantCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete template. It has ${variantCount} product variant(s) linked to it.`,
      });
  }
  const template = await ProductTemplate.findByIdAndDelete(req.params.id);
  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });
  res.status(200).json({ success: true, data: {} });
});

// @desc    Generate all product variants from a template and selected attributes
// @route   POST /api/v1/tenant/inventory/products/templates/:id/generate-variants
exports.generateVariants = asyncHandler(async (req, res, next) => {
  const { ProductTemplate, ProductVariant } = req.models;
  const templateId = req.params.id;
  const selectedOptions = req.body.options; // e.g., { "Color": ["Blue", "Black"], "Storage": ["256GB"] }

  const template = await ProductTemplate.findById(templateId);
  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });

  const optionKeys = Object.keys(selectedOptions);
  const optionValues = Object.values(selectedOptions);

  if (optionValues.length === 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: "At least one attribute option must be selected.",
      });
  }

  const combinations = cartesian(...optionValues);

  const variantsToCreate = combinations.map((combo) => {
    const attributes = {};
    const nameParts = [template.baseName];
    const skuParts = [
      template.sku || template.baseName.substring(0, 5).toUpperCase(),
    ];

    // Ensure combo is an array for consistent processing
    const comboArray = Array.isArray(combo) ? combo : [combo];

    comboArray.forEach((value, index) => {
      const key = optionKeys[index];
      attributes[key] = value;
      nameParts.push(value);
      skuParts.push(
        value
          .replace(/[^A-Z0-9]/gi, "")
          .substring(0, 3)
          .toUpperCase()
      );
    });

    return {
      templateId: template._id,
      variantName: nameParts.join(" - "),
      sku: skuParts.join("-"),
      attributes: attributes,
      costPrice: template.costPrice,
      sellingPrice: template.sellingPrice,
      assetAccountId: template.assetAccountId,
      revenueAccountId: template.revenueAccountId,
      cogsAccountId: template.cogsAccountId,
    };
  });

  // Use insertMany for efficient bulk creation
  const createdVariants = await ProductVariant.insertMany(variantsToCreate);

  res
    .status(201)
    .json({
      success: true,
      count: createdVariants.length,
      data: createdVariants,
    });
});
