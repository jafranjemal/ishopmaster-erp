const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../../middleware/asyncHandler");
const {
  Types: { ObjectId },
} = mongoose;
// @desc    Get all product variants, with optional filtering
// @route   GET /api/v1/tenant/inventory/products/variants
exports.getAllVariants_old = asyncHandler(async (req, res, next) => {
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

// @desc    Get all product variants with optional search, templateId, and server-side pagination
// @route   GET /api/v1/tenant/inventory/products/variants?templateId=&search=&page=1&limit=20

// @desc    Get all product variants with optional search, templateId, and server-side pagination
// @route   GET /api/v1/tenant/inventory/products/variants?templateId=&search=&page=1&limit=20
//

exports.getAllVariantsOld_ = asyncHandler(async (req, res, next) => {
  const { ProductVariants, InventoryItem, Category } = req.models;

  const templateId = req.query.templateId || null;
  const search = req.query.search?.trim() || "";
  const categoryId = req.query.categoryId?.trim() || null;
  const brandId = req.query.brandId?.trim() || null;
  const templateType = req.query.templateType || null;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let matchStage = { isActive: true };
  if (templateId) matchStage.templateId = new mongoose.Types.ObjectId(templateId);
  if (search) {
    const regex = new RegExp(search, "i");
    // Check if the search term matches any serial number first
    const itemBySerial = await InventoryItem.findOne({ serialNumber: search }).lean();

    if (itemBySerial) {
      // If a serial number matches, we ignore all other search criteria
      // and target that specific variant directly.
      matchStage = {
        _id: itemBySerial.productVariantId,
        isActive: true,
      };
    } else {
      // Otherwise, search by name or SKU as before
      matchStage.$or = [{ variantName: regex }, { sku: regex }];
    }
  }

  let categoryIds = [];
  if (categoryId) {
    categoryIds = await getAllDescendantCategoryIds(Category, categoryId);
  }

  // This is the second match stage, which runs AFTER we have looked up the template.
  const postLookupMatch = {};
  if (categoryIds.length)
    postLookupMatch["templateId.categoryId"] = {
      $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  if (brandId) postLookupMatch["templateId.brandId"] = new mongoose.Types.ObjectId(brandId);
  if (templateType) postLookupMatch["templateId.type"] = templateType;

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "producttemplates",
        localField: "templateId",
        foreignField: "_id",
        as: "templateId",
      },
    },
    { $unwind: "$templateId" },
    { $match: postLookupMatch },
    {
      $lookup: {
        from: "warrantypolicies", // Use the collection name (usually plural and lowercase)
        localField: "templateId.defaultWarrantyPolicyId",
        foreignField: "_id",
        as: "templateId.defaultWarrantyPolicyId", // Replace the ID with the full document
      },
    },
    { $unwind: { path: "$templateId.defaultWarrantyPolicyId", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "productvariants",
        localField: "templateId.requiredParts.productVariantId",
        foreignField: "_id",
        as: "requiredPartsVariants",
      },
    },
    {
      $addFields: {
        "templateId.requiredParts": {
          $map: {
            input: "$templateId.requiredParts",
            as: "part",
            in: {
              $mergeObjects: [
                "$$part",
                {
                  productVariant: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$requiredPartsVariants",
                          as: "pv",
                          cond: { $eq: ["$$pv._id", "$$part.productVariantId"] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "inventorylots",
        localField: "_id",
        foreignField: "productVariantId",
        as: "lots",
      },
    },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "_id",
        foreignField: "productVariantId",
        pipeline: [{ $match: { status: "in_stock" } }],
        as: "items",
      },
    },
    {
      $addFields: {
        quantityInStock: {
          $add: [
            {
              $sum: {
                $map: {
                  input: { $ifNull: ["$lots", []] },
                  as: "lot",
                  in: { $ifNull: ["$$lot.quantityInStock", 0] },
                },
              },
            },
            { $size: { $ifNull: ["$items", []] } },
          ],
        },
        hasBatches: {
          $gt: [{ $size: { $ifNull: ["$lots", []] } }, 1],
        },
      },
    },
    {
      $project: {
        requiredPartsVariants: 0,
        lots: 0,
        items: 0,
      },
    },
  ];

  const results = await ProductVariants.aggregate([
    ...aggregationPipeline,
    {
      $facet: {
        data: [{ $sort: { variantName: 1 } }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "total" }],
      },
    },
  ]);

  const variants = results[0].data;
  const total = results[0].totalCount[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: variants,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getAllVariants = asyncHandler(async (req, res, next) => {
  const { ProductVariants, InventoryItem, Category, ProductTemplates } = req.models;

  // Parse and validate parameters
  const {
    templateId,
    search = "",
    categoryId,
    brandId,
    templateType,
    page = 1,
    limit = 20,
    variantIds,
  } = req.query;

  const parsedLimit = parseInt(limit) || 20;
  const parsedPage = parseInt(page) || 1;
  const skip = (parsedPage - 1) * parsedLimit;
  const cleanSearch = search.trim();
  const matchStage = { isActive: true };
  let serialNumberVariantId = null;

  // Handle variant IDs filter
  if (variantIds) {
    try {
      const idsArray = variantIds.split(",").map((id) => {
        if (!ObjectId.isValid(id.trim())) {
          throw new Error(`Invalid ObjectId: ${id}`);
        }
        return new ObjectId(id.trim());
      });
      matchStage._id = { $in: idsArray };
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid variant IDs format",
      });
    }
  }

  // Handle serial number search ONLY if variantIds not provided
  if (!variantIds && cleanSearch) {
    const serialItem = await InventoryItem.findOne(
      { serialNumber: cleanSearch },
      { productVariantId: 1 }
    ).lean();

    if (serialItem) {
      serialNumberVariantId = serialItem.productVariantId;
      matchStage._id = new ObjectId(serialNumberVariantId);
    } else {
      // Text search only if no serial match
      const searchRegex = new RegExp(cleanSearch, "i");
      matchStage.$or = [
        { variantName: searchRegex },
        { sku: searchRegex },
        { "templateId.name": searchRegex },
      ];
    }
  }

  // Handle template ID (only if not filtering by variantIds)
  if (templateId && !variantIds) {
    if (!ObjectId.isValid(templateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID format",
      });
    }
    matchStage.templateId = new ObjectId(templateId);
  }

  // Category hierarchy processing (skip if variantIds provided)
  let categoryIds = [];
  if (categoryId && !variantIds) {
    if (!ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }
    categoryIds = await getAllDescendantCategoryIds(Category, categoryId);
  }

  // Main aggregation pipeline
  const aggregationPipeline = [];

  // Initial match
  aggregationPipeline.push({ $match: matchStage });

  // Join with product templates
  const templatePipeline = [{ $match: { isActive: true } }];

  // Apply template-level filters only if not filtering by variantIds
  if (!variantIds) {
    if (categoryIds.length > 0) {
      templatePipeline.push({
        $match: {
          categoryId: { $in: categoryIds.map((id) => new ObjectId(id)) },
        },
      });
    }

    if (brandId) {
      if (!ObjectId.isValid(brandId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid brand ID format",
        });
      }
      templatePipeline.push({
        $match: { brandId: new ObjectId(brandId) },
      });
    }

    if (templateType) {
      templatePipeline.push({
        $match: { type: templateType },
      });
    }
  }

  aggregationPipeline.push({
    $lookup: {
      from: ProductTemplates.collection.name,
      localField: "templateId",
      foreignField: "_id",
      as: "templateId",
      pipeline: templatePipeline,
    },
  });

  // Unwind template and filter out nulls
  aggregationPipeline.push({
    $unwind: {
      path: "$templateId",
      preserveNullAndEmptyArrays: false,
    },
  });

  // Join warranty policy
  aggregationPipeline.push({
    $lookup: {
      from: "warrantypolicies",
      localField: "templateId.defaultWarrantyPolicyId",
      foreignField: "_id",
      as: "defaultWarrantyPolicyId",
    },
  });

  // Unwind warranty policy
  aggregationPipeline.push({
    $unwind: {
      path: "$defaultWarrantyPolicyId",
      preserveNullAndEmptyArrays: true,
    },
  });

  // Join required parts
  aggregationPipeline.push({
    $lookup: {
      from: ProductVariants.collection.name,
      localField: "templateId.requiredParts.productVariantId",
      foreignField: "_id",
      as: "requiredPartsVariants",
    },
  });

  // Map required parts with variants
  aggregationPipeline.push({
    $addFields: {
      "templateId.requiredParts": {
        $map: {
          input: "$templateId.requiredParts",
          as: "part",
          in: {
            $mergeObjects: [
              "$$part",
              {
                productVariant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$requiredPartsVariants",
                        as: "pv",
                        cond: { $eq: ["$$pv._id", "$$part.productVariantId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  // Inventory calculations
  aggregationPipeline.push({
    $lookup: {
      from: "inventorylots",
      localField: "_id",
      foreignField: "productVariantId",
      as: "lots",
      pipeline: [{ $match: { status: "active" } }],
    },
  });

  aggregationPipeline.push({
    $lookup: {
      from: "inventoryitems",
      localField: "_id",
      foreignField: "productVariantId",
      as: "items",
      pipeline: [{ $match: { status: "in_stock" } }],
    },
  });

  aggregationPipeline.push({
    $addFields: {
      quantityInStock: {
        $add: [{ $size: "$items" }, { $sum: "$lots.quantityInStock" }],
      },
      hasBatches: { $gt: [{ $size: "$lots" }, 1] },
    },
  });

  // Project final fields
  aggregationPipeline.push({
    $project: {
      requiredPartsVariants: 0,
      lots: 0,
      items: 0,
    },
  });

  // Sorting and pagination
  const facetStage = {
    $facet: {
      data: [
        { $sort: { "templateId.name": 1, variantName: 1 } },
        { $skip: skip },
        { $limit: parsedLimit },
      ],
      totalCount: [{ $count: "total" }],
    },
  };

  aggregationPipeline.push(facetStage);

  // Execute aggregation
  let results;
  try {
    results = await ProductVariants.aggregate(aggregationPipeline);
  } catch (error) {
    console.error("Aggregation error:", error);
    return res.status(500).json({
      success: false,
      message: "Database aggregation failed",
      error: error.message,
    });
  }

  const variants = results[0]?.data || [];
  const totalCount = results[0]?.totalCount[0]?.total || 0;

  // ERP-specific enhancements
  const enhancedVariants = variants.map((variant) => {
    const idString = variant._id.toString();
    return {
      ...variant,
      erpCode: `PV-${idString.substring(idString.length - 6)}`,
      stockStatus: getStockStatus(variant.quantityInStock),
      lastInventorySync: new Date(),
      // Add other ERP-specific fields as needed
    };
  });

  res.status(200).json({
    success: true,
    data: enhancedVariants,
    pagination: {
      total: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(totalCount / parsedLimit),
    },
  });
});

// ERP Helper Functions
function getStockStatus(quantity) {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= 5) return "low_stock";
  if (quantity <= 20) return "medium_stock";
  return "high_stock";
}

async function getAllDescendantCategoryIds(Category, parentId) {
  const results = await Category.aggregate([
    { $match: { _id: new ObjectId(parentId) } },
    {
      $graphLookup: {
        from: Category.collection.name,
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "descendants",
      },
    },
    { $unwind: "$descendants" },
    { $group: { _id: null, ids: { $push: "$descendants._id" } } },
  ]);

  return results.length > 0 ? [parentId, ...results[0].ids.map((id) => id.toString())] : [parentId];
}

// @desc    Update a single product variant
// @route   PUT /api/v1/tenant/inventory/products/variants/:id
exports.updateVariant = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  // Whitelist fields like sku, sellingPrice, costPrice
  const { sku, sellingPrice, costPrice, isActive } = req.body;
  const fieldsToUpdate = { sku, sellingPrice, costPrice, isActive };

  const updatedVariant = await ProductVariants.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  if (!updatedVariant)
    return res.status(404).json({ success: false, error: "Product Variant not found" });
  res.status(200).json({ success: true, data: updatedVariant });
});

exports.updateVariantImage = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  const { images } = req.body;
  const { id: variantId } = req.params;

  if (!images) {
    return next(new ErrorResponse("Image URL is required.", 400));
  }

  const updatedVariant = await ProductVariants.findByIdAndUpdate(
    variantId,
    { $set: { images: images } },
    { new: true, runValidators: true }
  );

  if (!updatedVariant) {
    return next(new ErrorResponse("Product Variant not found.", 404));
  }

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

  const variants = await ProductVariants.find(query)
    .limit(10)
    .populate("templateId", "type name")
    .lean();
  console.log({ variants });
  res.status(200).json({ success: true, data: variants });
});

// @desc    Perform a bulk update on multiple product variants
// @route   PATCH /api/v1/tenant/inventory/products/variants/bulk-update
// @access  Private (Requires 'inventory:product:manage' permission)
exports.bulkUpdateVariants = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  const { variants } = req.body; // Expect an array of variant objects

  if (!Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ success: false, error: "An array of variants is required." });
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
    return res.status(404).json({ success: false, error: "Product Variant not found" });
  }
  res.status(200).json({ success: true, data: variant });
});
