const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../../middleware/asyncHandler");
const ErrorResponse = require("../../../../utils/errorResponse");
const { ObjectId } = require("mongoose").Types;

// Helper function to calculate the Cartesian product of multiple arrays
const cartesian = (...arrays) => {
  return arrays.reduce(
    (acc, curr) => {
      return acc.flatMap((a) => curr.map((b) => a.concat([b])));
    },
    [[]]
  );
};

// Helper to generate unique SKU parts
const generateSkuPart = (value) =>
  value
    .replace(/[^A-Z0-9]/gi, "")
    .substring(0, 3)
    .toUpperCase();

// Helper function for validation
const validatePhysicalProduct = (data) => {
  if (!data.brandId) {
    throw new Error("Brand is required for physical products.");
  }
  if (!data.categoryId) {
    throw new Error("Category is required for physical products.");
  }
};

// @desc    Get all product templates
// @route   GET /api/v1/tenant/inventory/products/templates
exports.getAllTemplatesOld = asyncHandler(async (req, res, next) => {
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
    const escapedSearch = req.query.search.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
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

// @desc    Get all product templates with their variant counts (paginated)
// @route   GET /api/v1/tenant/inventory/products/templates
// @desc    Get all product templates with their variant counts (paginated, searchable, deeply populated)
// @route   GET /api/v1/tenant/inventory/products/templates

exports.getAllTemplates = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, Category } = req.models;
  const { page = 1, limit = 25, search = "", brandId, categoryId, type, isActive, deviceId } = req.query;
  const skip = (page - 1) * limit;

  const matchStage = {};

  if (search) {
    const regex = new RegExp(search.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
    matchStage.$or = [{ baseName: regex }, { skuPrefix: regex }];
  }

  if (brandId && brandId !== "__none__") matchStage.brandId = new ObjectId(brandId);
  if (deviceId && deviceId !== "__none__") matchStage.deviceId = new ObjectId(deviceId);
  if (type && type !== "__none__") matchStage.type = type;
  if (isActive !== undefined && isActive !== "" && isActive !== "__none__") matchStage.isActive = isActive === "true";

  // --- THE DEFINITIVE FIX: HIERARCHICAL CATEGORY FILTER ---
  if (categoryId) {
    // Use $graphLookup to find the selected category and all of its descendants in one step.
    const categoryWithChildren = await Category.aggregate([
      { $match: { _id: new ObjectId(categoryId) } },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent", // Correct field name
          as: "descendants",
        },
      },
    ]);

    if (categoryWithChildren.length > 0) {
      const allIds = [new ObjectId(categoryId), ...categoryWithChildren[0].descendants.map((c) => c._id)];
      matchStage.categoryId = { $in: allIds };
    } else {
      matchStage.categoryId = new ObjectId(categoryId);
    }
  }
  // --- END OF FIX ---

  // --- OPTIMIZED PAGINATION & AGGREGATION ---
  // The $facet operator runs the count and the data fetch in a single, efficient trip.
  const results = await ProductTemplates.aggregate([
    { $match: matchStage },
    {
      $facet: {
        // The metadata pipeline just gets the count, which is very fast.
        metadata: [{ $count: "total" }],
        // The data pipeline performs the expensive lookups only on the paginated slice.
        data: [
          { $sort: { baseName: 1 } },
          { $skip: skip },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: "productvariants",
              localField: "_id",
              foreignField: "templateId",
              as: "variants",
            },
          },
          { $lookup: { from: "brands", localField: "brandId", foreignField: "_id", as: "brand" } },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $lookup: {
              from: "warrantypolicies",
              localField: "defaultWarrantyPolicyId",
              foreignField: "_id",
              as: "warranty",
            },
          },
          { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$warranty", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              baseName: 1,
              images: 1,
              skuPrefix: 1,
              type: 1,
              isActive: 1,
              createdAt: 1,
              variantCount: { $size: "$variants" },
              brandName: "$brand.name",
              categoryName: "$category.name",
              // We pass the full objects for linking in the UI
              brandId: "$brand",
              categoryId: "$category",
              defaultWarrantyPolicyId: "$warranty",
            },
          },
        ],
      },
    },
  ]);

  const data = results[0].data;
  const total = results[0].metadata[0]?.total || 0;

  res.status(200).json({
    success: true,
    total,
    data,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get a single product template and its attribute set details
// @route   GET /api/v1/tenant/inventory/products/templates/:id
exports.getTemplateById = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;

  const template = await ProductTemplates.findById(req.params.id)
    .populate("brandId", "name")
    .populate("categoryId", "name")
    // --- THE FIX: DEEPLY POPULATE ALL REQUIRED DATA ---
    .populate({
      path: "attributeSetId",
      select: "name attributes",
      populate: { path: "attributes", select: "name values" },
    })
    .populate("assetAccountId", "name")
    .populate("revenueAccountId", "name")
    .populate("cogsAccountId", "name")
    .populate("taxCategoryId")
    .populate("defaultWarrantyPolicyId")
    .lean();

  if (!template) return res.status(404).json({ success: false, error: "Product Template not found" });
  res.status(200).json({ success: true, data: template });
});

// @desc    Get summary KPIs for product templates
// @route   GET /api/v1/tenant/inventory/products/templates/summary
exports.getTemplatesSummary = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;

  const [templateCount, variantCount] = await Promise.all([ProductTemplates.countDocuments({}), ProductVariants.countDocuments({})]);

  res.status(200).json({
    success: true,
    data: {
      totalTemplates: templateCount,
      totalVariants: variantCount,
    },
  });
});

// @desc    Create a new product template
exports.createTemplate = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const templateData = req.body;

  // --- THE FIX: Conditional Validation Logic ---
  if (["serialized", "non-serialized"].includes(templateData.type)) {
    try {
      validatePhysicalProduct(templateData);
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
  // --- END OF FIX ---

  if (templateData.attributeSetId === "") templateData.attributeSetId = null;
  if (templateData.brandId === "") templateData.brandId = null;
  if (templateData.deviceId === "") templateData.deviceId = null;
  if (templateData.categoryId === "") templateData.categoryId = null;

  const newTemplate = await ProductTemplates.create(templateData);

  // --- THE DEFINITIVE FIX: DELEGATE TO THE MODEL'S STATIC METHOD ---
  // The controller's job is just to orchestrate.
  await ProductVariants.createDefaultVariant(newTemplate);
  // --- END OF FIX ---

  res.status(201).json({ success: true, data: newTemplate });
});

// @desc    Update a product template
exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;
  const updateData = req.body;

  // --- THE FIX: Conditional Validation Logic ---
  if (["serialized", "non-serialized"].includes(updateData.type)) {
    try {
      validatePhysicalProduct(updateData);
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
  // --- END OF FIX ---

  if (updateData.attributeSetId === "") updateData.attributeSetId = null;
  if (updateData.brandId === "") updateData.brandId = null;
  if (updateData.deviceId === "") updateData.deviceId = null;

  const updatedTemplate = await ProductTemplates.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedTemplate) return res.status(404).json({ success: false, error: "Product Template not found" });
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
  if (!template) return res.status(404).json({ success: false, error: "Product Template not found" });
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
  if (!template) return res.status(404).json({ success: false, error: "Product Template not found" });

  const attributeNames = Object.keys(selectedOptions);
  const attributeValues = Object.values(selectedOptions).filter((v) => Array.isArray(v) && v.length > 0);

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
    const skuParts = [template.skuPrefix || template.baseName.substring(0, 5).toUpperCase()];
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
  if (!req.body || typeof req.body.selections !== "object" || Array.isArray(req.body.selections)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing selections.",
    });
  }

  const selectedOptions = req.body.selections;

  // Fetch template with all required fields
  const template = await ProductTemplates.findById(templateId)
    .select("baseName skuPrefix costPrice sellingPrice assetAccountId revenueAccountId cogsAccountId")
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
  const attributeValues = Object.values(selectedOptions).filter((v) => Array.isArray(v) && v.length > 0);

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
    const skuParts = [templateObj.skuPrefix || templateObj.baseName.substring(0, 5).toUpperCase()];

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

exports.syncVariantsOlds = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const { id: templateId } = req.params;
  const { options: desiredOptions } = req.body;

  console.log("🔄 Synchronizing variants for template ID:", templateId);

  // Validate input
  if (!desiredOptions || typeof desiredOptions !== "object") {
    return res.status(400).json({
      success: false,
      error: "Invalid 'options' payload. Expecting attribute values object.",
    });
  }

  // Helper: Cartesian product

  // Helper: Normalize attributes into a unique key string
  const createComboKeyFromAttrs = (attributes) =>
    Object.entries(attributes || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("-");

  // Helper: Generate safe SKU part
  const generateSkuPart = (val) =>
    val
      .replace(/[^A-Z0-9]/gi, "")
      .substring(0, 3)
      .toUpperCase();

  // Helper: Generate short unique suffix
  const generateUniqueSkuSuffix = () => Math.random().toString(36).substring(2, 6).toUpperCase(); // e.g., X9F3

  // 1. Load template and variants
  const [template, existingVariants] = await Promise.all([
    ProductTemplates.findById(templateId),
    ProductVariants.find({ templateId }).lean(),
  ]);

  if (!template) {
    return res.status(404).json({ success: false, error: "Product Template not found" });
  }

  const optionKeys = Object.keys(desiredOptions);
  const optionValues = Object.values(desiredOptions);
  const desiredCombinations = optionValues.length > 0 ? cartesian(...optionValues) : [];

  const desiredComboKeys = new Set(
    desiredCombinations.map((combo) => {
      const attrs = {};
      combo.forEach((val, idx) => (attrs[optionKeys[idx]] = val));
      return createComboKeyFromAttrs(attrs);
    })
  );

  const existingVariantMap = new Map(existingVariants.map((v) => [createComboKeyFromAttrs(v.attributes), v]));

  const usedSkus = new Set(existingVariants.map((v) => v.sku?.toUpperCase()).filter(Boolean));

  // Final variant buckets
  const variantsToCreate = [];
  const variantsToReactivate = [];
  const variantsToDeactivate = [];
  const skippedVariants = [];

  desiredCombinations.forEach((combo) => {
    const attrs = {};
    const nameParts = [template.baseName];
    const skuParts = [template?.skuPrefix || template.baseName.substring(0, 5).toUpperCase()];

    combo.forEach((val, idx) => {
      const attrKey = optionKeys[idx];
      attrs[attrKey] = val;
      nameParts.push(val);
      skuParts.push(generateSkuPart(val));
    });

    const comboKey = createComboKeyFromAttrs(attrs);
    const existing = existingVariantMap.get(comboKey);

    const finalSku = skuParts.join("-") + `-${generateUniqueSkuSuffix()}`;

    if (!existing) {
      if (!usedSkus.has(finalSku.toUpperCase())) {
        usedSkus.add(finalSku.toUpperCase());
        variantsToCreate.push({
          templateId,
          variantName: nameParts.join(" - "),
          sku: finalSku,
          attributes: attrs,
          sellingPrice: template.sellingPrice,
          costPrice: template.costPrice,
        });
      } else {
        console.warn(`⚠️ Skipping variant due to duplicate SKU: ${finalSku}`);
        skippedVariants.push(nameParts.join(" - "));
      }
    } else if (!existing.isActive) {
      variantsToReactivate.push(existing._id);
    }
  });

  // Detect deactivations
  existingVariantMap.forEach((variant, key) => {
    if (variant.isActive && !desiredComboKeys.has(key)) {
      variantsToDeactivate.push(variant._id);
    }
  });

  // Run DB operations
  const dbOperations = [];

  if (variantsToCreate.length > 0) {
    dbOperations.push(
      ProductVariants.insertMany(variantsToCreate, {
        ordered: false,
      })
    );
  }

  if (variantsToReactivate.length > 0) {
    dbOperations.push(ProductVariants.updateMany({ _id: { $in: variantsToReactivate } }, { $set: { isActive: true } }));
  }

  if (variantsToDeactivate.length > 0) {
    dbOperations.push(ProductVariants.updateMany({ _id: { $in: variantsToDeactivate } }, { $set: { isActive: false } }));
  }

  try {
    await Promise.all(dbOperations);
  } catch (err) {
    console.error("❌ DB sync error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Database sync failed: " + err.message,
    });
  }

  const allUpdatedVariants = await ProductVariants.find({ templateId });

  res.status(200).json({
    success: true,
    message: "✅ Variants synchronized successfully.",
    data: allUpdatedVariants,
    skipped: skippedVariants,
  });
});

/**
 * @desc    Synchronizes product variants based on selected attribute options.
 * This is a deterministic and robust implementation.
 * @route   POST /api/v1/tenant/inventory/templates/:id/sync-variants
 * @access  Private
 */

exports.syncVariantsJJ = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const { id } = req.params;
  const { options: desiredSelections } = req.body;
  const templateId = new mongoose.Types.ObjectId(id);
  const template = await ProductTemplates.findById(templateId).populate({
    path: "attributeSetId",
    populate: { path: "attributes" },
  });
  if (!template) {
    return next(new ErrorResponse("Product Template not found", 404));
  }
  if (!template.attributeSetId) {
    return next(new ErrorResponse("Template does not have an Attribute Set assigned.", 400));
  }

  const existingVariants = await ProductVariants.find({ templateId }).lean();

  const createComboKey = (attributes) => {
    return (attributes || [])
      .sort((a, b) => a.attribute.toString().localeCompare(b.attribute.toString()))
      .map((attr) => `${attr.attribute}:${attr.value}`)
      .join("|");
  };

  const generateSkuPart = (val) =>
    val
      .replace(/[^A-Z0-9]/gi, "")
      .substring(0, 3)
      .toUpperCase();

  const attributeMap = new Map(template.attributeSetId.attributes.map((attr) => [attr.name, attr._id]));
  const desiredOptionKeys = Object.keys(desiredSelections);
  const desiredOptionValues = Object.values(desiredSelections).filter((arr) => Array.isArray(arr) && arr.length > 0);

  for (const key of desiredOptionKeys) {
    if (!attributeMap.has(key)) {
      return next(new ErrorResponse(`Invalid attribute "${key}" for this product's attribute set.`, 400));
    }
  }

  const desiredCombinations = desiredOptionValues.length > 0 ? cartesian(...desiredOptionValues) : [];

  const desiredVariantsMap = new Map();
  desiredCombinations.forEach((combo) => {
    if (combo.length === 0) return; // Skip empty combinations from cartesian product
    const attributes = [];
    const nameParts = [template.baseName];
    const skuParts = [template.sku];

    combo.forEach((value, idx) => {
      const attrName = desiredOptionKeys[idx];
      const attrId = attributeMap.get(attrName);
      attributes.push({ attribute: attrId, value });
      nameParts.push(value);
      skuParts.push(generateSkuPart(value));
    });

    const comboKey = createComboKey(attributes);
    const deterministicSku = skuParts.join("-");

    // --- Definitive Fix #1: Correctly map all fields to the ProductVariant schema ---
    desiredVariantsMap.set(comboKey, {
      templateId: templateId,
      variantName: nameParts.join(" - "), // Correct field is variantName
      sku: deterministicSku,
      attributes: attributes,
      sellingPrice: template.sellingPrice,
      costPriceInBaseCurrency: template.costPriceInBaseCurrency, // Correct field is costPriceInBaseCurrency
      isActive: true,
    });
  });

  const existingVariantMap = new Map(existingVariants.map((v) => [createComboKey(v.attributes), v]));
  const operations = [];

  for (const [key, desiredVariant] of desiredVariantsMap.entries()) {
    const existing = existingVariantMap.get(key);
    if (!existing) {
      operations.push({ insertOne: { document: desiredVariant } });
    } else {
      const updates = {};
      if (!existing.isActive) {
        updates.isActive = true;
      }
      if (existing.variantName !== desiredVariant.variantName) {
        updates.variantName = desiredVariant.variantName;
      }
      if (existing.sku !== desiredVariant.sku) {
        updates.sku = desiredVariant.sku;
      }
      if (Object.keys(updates).length > 0) {
        operations.push({
          updateOne: { filter: { _id: existing._id }, update: { $set: updates } },
        });
      }
    }
  }

  for (const [key, existingVariant] of existingVariantMap.entries()) {
    if (existingVariant.isActive && !desiredVariantsMap.has(key)) {
      operations.push({
        updateOne: { filter: { _id: existingVariant._id }, update: { $set: { isActive: false } } },
      });
    }
  }

  if (operations.length > 0) {
    try {
      await ProductVariants.bulkWrite(operations, { ordered: false });
    } catch (err) {
      return next(new ErrorResponse("Database sync failed: " + err.message, 500));
    }
  }

  const allUpdatedVariants = await ProductVariants.find({ templateId });
  console.log("allUpdatedVariants ", allUpdatedVariants);
  res.status(200).json({
    success: true,
    message: "Variants synchronized successfully.",
    data: allUpdatedVariants,
  });
});

exports.syncVariants = asyncHandler(async (req, res, next) => {
  const { ProductTemplates, ProductVariants } = req.models;
  const { id } = req.params;
  const { options: desiredSelections } = req.body;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid product template ID format", 400));
  }

  const templateId = new mongoose.Types.ObjectId(id);

  const template = await ProductTemplates.findById(templateId).populate({
    path: "attributeSetId",
    populate: {
      path: "attributes",
      select: "name key values", // Only retrieve necessary fields
    },
  });

  if (!template) {
    return next(new ErrorResponse("Product Template not found", 404));
  }

  if (!template.attributeSetId) {
    return next(new ErrorResponse("Template does not have an Attribute Set assigned", 400));
  }

  const existingVariants = await ProductVariants.find({ templateId }).lean();

  // Create consistent combo key for attribute sets
  const createComboKey = (attributes) => {
    if (!attributes) return "";

    const entries = Object.entries(attributes)
      .map(([key, value]) => [key.toLowerCase(), value]) // Normalize keys
      .sort((a, b) => a[0].localeCompare(b[0])); // Sort alphabetically

    return entries.map(([key, val]) => `${key}:${val}`).join("|");
  };

  // Generate SKU fragment
  const generateSkuPart = (val) =>
    (val || "")
      .replace(/[^A-Z0-9]/gi, "")
      .substring(0, 3)
      .toUpperCase();

  // Create mapping: attribute name -> attribute key
  const attributeKeyMap = new Map(
    template.attributeSetId.attributes.map((attr) => [
      attr.name,
      { key: attr.key, values: new Set(attr.values.map((v) => v.toLowerCase())) },
    ])
  );

  const desiredOptionKeys = Object.keys(desiredSelections);

  // Validate attributes and values
  for (const attrName of desiredOptionKeys) {
    if (!attributeKeyMap.has(attrName)) {
      return next(new ErrorResponse(`Invalid attribute "${attrName}" for this product`, 400));
    }

    const validValues = attributeKeyMap.get(attrName).values;
    for (const value of desiredSelections[attrName]) {
      if (!validValues.has(value.toLowerCase())) {
        return next(new ErrorResponse(`Invalid value "${value}" for attribute "${attrName}"`, 400));
      }
    }
  }

  // Cartesian product generator
  const cartesian = (...arrays) => arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);

  const desiredCombinations = cartesian(...desiredOptionKeys.map((key) => desiredSelections[key]));

  const desiredVariantsMap = new Map();
  const baseSku = template.skuPrefix || template.sku || "BASE";

  desiredCombinations.forEach((combo) => {
    if (combo.length === 0) return;

    const attributes = {};
    const nameParts = [template.baseName];
    const skuParts = [baseSku];

    combo.forEach((value, idx) => {
      const attrName = desiredOptionKeys[idx];
      const attrKey = attributeKeyMap.get(attrName).key;

      attributes[attrKey] = value;
      nameParts.push(value);
      skuParts.push(generateSkuPart(value));
    });

    const comboKey = createComboKey(attributes);
    const deterministicSku = skuParts.join("-");

    desiredVariantsMap.set(comboKey, {
      templateId,
      variantName: nameParts.join(" - "),
      sku: deterministicSku,
      attributes,
      sellingPrice: template.sellingPrice,
      costPrice: template.costPrice,
      isActive: true,
    });
  });

  const existingVariantMap = new Map(existingVariants.map((v) => [createComboKey(v.attributes), v]));

  const operations = [];
  const now = new Date();

  // Process creates/updates
  for (const [key, desiredVariant] of desiredVariantsMap) {
    const existing = existingVariantMap.get(key);

    if (!existing) {
      operations.push({
        insertOne: {
          document: {
            ...desiredVariant,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    } else {
      const updates = {};
      let needsUpdate = false;

      if (existing.variantName !== desiredVariant.variantName) {
        updates.variantName = desiredVariant.variantName;
        needsUpdate = true;
      }

      if (existing.sku !== desiredVariant.sku) {
        updates.sku = desiredVariant.sku;
        needsUpdate = true;
      }

      if (!existing.isActive) {
        updates.isActive = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.updatedAt = now;
        operations.push({
          updateOne: {
            filter: { _id: existing._id },
            update: { $set: updates },
          },
        });
      }
    }
  }

  // Deactivate missing variants
  for (const [key, existingVariant] of existingVariantMap) {
    if (existingVariant.isActive && !desiredVariantsMap.has(key)) {
      operations.push({
        updateOne: {
          filter: { _id: existingVariant._id },
          update: {
            $set: {
              isActive: false,
              updatedAt: now,
            },
          },
        },
      });
    }
  }

  // Execute database operations
  if (operations.length > 0) {
    try {
      await ProductVariants.bulkWrite(operations, { ordered: false });
    } catch (err) {
      return next(new ErrorResponse(`Database sync failed: ${err.message}`, 500));
    }
  }

  // Retrieve updated variants
  const allUpdatedVariants = await ProductVariants.find({ templateId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: `Synchronized ${desiredVariantsMap.size} variants`,
    changes: operations.length,
    data: allUpdatedVariants,
  });
});
