const asyncHandler = require("../../../../middleware/asyncHandler");

// Helper function to calculate the Cartesian product of multiple arrays
const cartesian_old = (...a) =>
  a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

const cartesian = (...arrays) => {
  return arrays.reduce(
    (acc, curr) => {
      return acc.flatMap((a) => curr.map((b) => a.concat([b])));
    },
    [[]]
  );
};

// @desc    Get all product templates
// @route   GET /api/v1/tenant/inventory/products/templates
exports.getAllTemplates = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;

  console.log("req.query ------\n-----\n", req.query);
  // --- Pagination Parameters ---
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  // --- Dynamic Filter & Search Object ---
  const filter = {};

  if (req.query.search) {
    // Case-insensitive search on the baseName field
    // The 'search' string is escaped to prevent RegEx injection attacks
    const escapedSearch = req.query.search.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
    filter.baseName = { $regex: escapedSearch, $options: "i" };
  }

  if (req.query.brandId) {
    filter.brandId = req.query.brandId;
  }

  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId;
  }

  if (req.query.productType) {
    filter.type = req.query.productType;
  }

  // --- Execute Queries in Parallel for Performance ---
  const [results, total] = await Promise.all([
    ProductTemplates.find(filter)
      .populate("brandId", "name")
      .populate("categoryId", "name")
      .sort({ baseName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(), // .lean() for faster queries when you don't need Mongoose documents
    ProductTemplates.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);
  console.log("............\n............\n");
  console.log("Results:", results.length);

  res.status(200).json({
    success: true,
    count: results.length,
    pagination: {
      total,
      limit,
      page,
      pages,
    },
    data: results,
  });
});

// @desc    Get a single product template and its attribute set details
// @route   GET /api/v1/tenant/inventory/products/templates/:id
exports.getTemplateById = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;
  console.log("Fetching template with ID:", req.params.id);
  const template = await ProductTemplates.findById(req.params.id)
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
  const { ProductTemplates } = req.models;
  const templateData = req.body;
  console.log("-------------------\n---------------------\n----------------");
  console.log("Creating new product template:", templateData);

  // If the frontend sends an empty string for an optional reference, convert it to null
  // so Mongoose knows to ignore it instead of trying to cast it.
  if (templateData.attributeSetId === "") {
    templateData.attributeSetId = null;
  }
  if (templateData.brandId === "") {
    templateData.brandId = null;
  }
  const newTemplate = await ProductTemplates.create(templateData);
  console.log("New template created:", newTemplate);
  console.log("-------------------\n---------------------\n----------------");
  res.status(201).json({ success: true, data: newTemplate });
});

// @desc    Update a product template
// @route   PUT /api/v1/tenant/inventory/products/templates/:id
exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;
  const updateData = req.body;
  if (updateData.attributeSetId === "") {
    updateData.attributeSetId = null;
  }
  if (updateData.brandId === "") {
    updateData.brandId = null;
  }
  const updatedTemplate = await ProductTemplates.findByIdAndUpdate(
    req.params.id,
    updateData,
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
  const { ProductTemplates, ProductVariants } = req.models;
  const variantCount = await ProductVariants.countDocuments({
    templateId: req.params.id,
  });

  console.log("variantCount : ", variantCount);

  if (variantCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete template. It has ${variantCount} product variant(s) linked to it.`,
    });
  }
  const template = await ProductTemplates.findByIdAndDelete(req.params.id);
  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });
  res.status(200).json({ success: true, data: {} });
});

// @desc    Generate all product variants from a template and selected attributes
// @route   POST /api/v1/tenant/inventory/products/templates/:id/generate-variants
exports.generateVariants_old = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const templateId = req.params.id;
  console.log("-------------------\n---------------------\n----------------");
  console.log("Generating variants for template ID:", templateId);
  console.log("Selected options:", req.body);

  const selectedOptions = req.body.selections; // e.g., { "Color": ["Blue", "Black"], "Storage": ["256GB"] }

  const template = await ProductTemplates.findById(templateId);
  const costPrice = template.costPrice;
  const sellingPrice = template.sellingPrice;
  console.log("Template found:", template);
  console.log("Template found:", template.costPrice);
  console.log("costPrice:", costPrice);
  console.log("sellingPrice:", sellingPrice);
  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });

  const attributeNames = Object.keys(selectedOptions);
  const attributeValues = Object.values(selectedOptions).filter(
    (v) => Array.isArray(v) && v.length > 0
  );

  if (attributeValues.length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one attribute option must be selected.",
    });
  }

  const combinations = cartesian(...attributeValues);

  const variantsToCreate = combinations.map((combo) => {
    const attributes = {};
    const nameParts = [template.baseName];
    const skuParts = [
      template.skuPrefix || template.baseName.substring(0, 5).toUpperCase(),
    ];
    const comboArray = Array.isArray(combo) ? combo : [combo];

    comboArray.forEach((value, index) => {
      const key = attributeNames[index];
      attributes[key] = value;
      nameParts.push(value);
      skuParts.push(
        value
          .replace(/[^A-Z0-9]/gi, "")
          .substring(0, 3)
          .toUpperCase()
      );
    });

    console.log("costPrice:", template.costPrice);
    console.log("sellingPrice:", template.sellingPrice);

    return {
      templateId: template._id,
      variantName: nameParts.join(" - "),
      sku: skuParts.join("-"),
      attributes,
      costPrice: template.costPrice,
      sellingPrice: template.sellingPrice,
      assetAccountId: template.assetAccountId,
      revenueAccountId: template.revenueAccountId,
      cogsAccountId: template.cogsAccountId,
    };
  });
  console.log("-------------------\n---------------------\n----------------");
  console.log("Variants to create:", variantsToCreate);
  console.log("-------------------\n---------------------\n----------------");
  const createdVariants = await ProductVariants.insertMany(variantsToCreate, {
    ordered: true,
  });

  res.status(201).json({
    success: true,
    count: createdVariants.length,
    data: createdVariants,
  });
});

// @desc    Generate all product variants from a template and selected attributes
// @route   POST /api/v1/tenant/inventory/products/templates/:id/generate-variants
exports.generateVariants = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const templateId = req.params.id;

  // Validate input
  if (
    !req.body ||
    typeof req.body.selections !== "object" ||
    Array.isArray(req.body.selections)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing selections.",
    });
  }

  const selectedOptions = req.body.selections;

  // Fetch template with all required fields
  const template = await ProductTemplates.findById(templateId)
    .select(
      "baseName skuPrefix costPrice sellingPrice assetAccountId revenueAccountId cogsAccountId"
    )
    .exec();

  if (!template) {
    return res.status(404).json({
      success: false,
      error: "Product Template not found.",
    });
  }

  const templateObj = template.toObject();

  // Validate attribute selections
  const attributeNames = Object.keys(selectedOptions);
  const attributeValues = Object.values(selectedOptions).filter(
    (v) => Array.isArray(v) && v.length > 0
  );

  if (attributeValues.length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one attribute option must be selected.",
    });
  }

  // Generate combinations
  const combinations = cartesian(...attributeValues);
  const totalVariants = combinations.length;

  if (totalVariants > 100000) {
    // Safeguard: Prevent variant explosion
    return res.status(400).json({
      success: false,
      error: `Too many variants (${totalVariants}) would be generated. Please refine your selections.`,
    });
  }

  const variantsToCreate = combinations.map((combo) => {
    const attributes = {};
    const nameParts = [templateObj.baseName];
    const skuParts = [
      templateObj.skuPrefix ||
        templateObj.baseName.substring(0, 5).toUpperCase(),
    ];

    const comboArray = Array.isArray(combo) ? combo : [combo];

    comboArray.forEach((value, index) => {
      const key = attributeNames[index];
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
      templateId: templateObj._id,
      variantName: nameParts.join(" - "),
      sku: skuParts.join("-"),
      attributes,
      costPrice: templateObj.costPrice ?? 0,
      sellingPrice: templateObj.sellingPrice ?? 0,
      assetAccountId: templateObj.assetAccountId ?? null,
      revenueAccountId: templateObj.revenueAccountId ?? null,
      cogsAccountId: templateObj.cogsAccountId ?? null,
    };
  });

  // Insert in chunks to avoid buffer overflow
  const CHUNK_SIZE = 500;
  let createdCount = 0;
  for (let i = 0; i < variantsToCreate.length; i += CHUNK_SIZE) {
    const chunk = variantsToCreate.slice(i, i + CHUNK_SIZE);
    const result = await ProductVariants.insertMany(chunk, { ordered: true });
    createdCount += result.length;
  }

  res.status(201).json({
    success: true,
    count: createdCount,
    message: `${createdCount} variants created successfully.`,
  });
});

/**
 * @desc    Synchronize product variants based on selected attribute options.
 * This will create new variants, deactivate old ones, and reactivate existing ones.
 * @route   POST /api/v1/tenant/inventory/templates/:id/sync-variants
 * @access  Private (inventory:product:manage)
 */
exports.syncVariants = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const { id: templateId } = req.params;
  console.log("Synchronizing variants for template ID:", templateId);
  const { options: desiredOptions } = req.body; // The desired state from the UI

  // 1. Get the template and all existing variants in parallel
  const [template, existingVariants] = await Promise.all([
    ProductTemplates.findById(templateId),
    ProductVariants.find({ templateId }).lean(), // .lean() for faster, plain JS objects
  ]);

  if (!template) {
    return res
      .status(404)
      .json({ success: false, error: "Product Template not found" });
  }

  // 2. Generate all desired combinations from the user's selections
  const optionKeys = Object.keys(desiredOptions);
  const optionValues = Object.values(desiredOptions);
  const desiredCombinations =
    optionValues.length > 0 ? cartesian(...optionValues) : [];

  // Create a simple string key for each combination for efficient lookups (e.g., "Blue-Small")
  const createComboKey = (combo) =>
    (Array.isArray(combo) ? combo : [combo]).join("-");

  const desiredComboKeys = new Set(desiredCombinations.map(createComboKey));

  // Create a Map of existing variants for O(1) lookups. This is highly performant.
  const existingVariantMap = new Map(
    existingVariants.map((v) => [
      createComboKey(Object.values(v.attributes)),
      v,
    ])
  );

  // 3. Reconcile states: determine what to create, deactivate, and reactivate
  const variantsToCreate = [];
  const variantsToReactivate = [];
  const variantsToDeactivate = [];

  // Check which desired variants need to be created or reactivated
  desiredCombinations.forEach((combo) => {
    const key = createComboKey(combo);
    const existing = existingVariantMap.get(key);

    if (!existing) {
      // This variant doesn't exist, so we need to create it.
      const attributes = {};
      const nameParts = [template.baseName];
      const skuParts = [
        template.sku || template.baseName.substring(0, 5).toUpperCase(),
      ];
      const comboArray = Array.isArray(combo) ? combo : [combo];
      comboArray.forEach((value, index) => {
        const attrKey = optionKeys[index];
        attributes[attrKey] = value;
        nameParts.push(value);
        skuParts.push(
          value
            .replace(/[^A-Z0-9]/gi, "")
            .substring(0, 3)
            .toUpperCase()
        );
      });
      variantsToCreate.push({
        templateId,
        variantName: nameParts.join(" - "),
        sku: skuParts.join("-"),
        attributes,
        sellingPrice: template.sellingPrice,
      });
    } else if (!existing.isActive) {
      // It exists but is inactive, so we should reactivate it.
      variantsToReactivate.push(existing._id);
    }
  });

  // Check which existing variants need to be deactivated
  existingVariantMap.forEach((variant, key) => {
    if (variant.isActive && !desiredComboKeys.has(key)) {
      variantsToDeactivate.push(variant._id);
    }
  });

  // 4. Perform all database operations in parallel for max efficiency
  const dbOperations = [];
  if (variantsToCreate.length > 0) {
    dbOperations.push(ProductVariants.insertMany(variantsToCreate));
  }
  if (variantsToReactivate.length > 0) {
    dbOperations.push(
      ProductVariants.updateMany(
        { _id: { $in: variantsToReactivate } },
        { $set: { isActive: true } }
      )
    );
  }
  if (variantsToDeactivate.length > 0) {
    dbOperations.push(
      ProductVariants.updateMany(
        { _id: { $in: variantsToDeactivate } },
        { $set: { isActive: false } }
      )
    );
  }

  await Promise.all(dbOperations);

  // 5. Return the full, updated list of all variants for the template
  const allUpdatedVariants = await ProductVariants.find({ templateId });
  res.status(200).json({
    success: true,
    message: "Variants synchronized successfully.",
    data: allUpdatedVariants,
  });
});
