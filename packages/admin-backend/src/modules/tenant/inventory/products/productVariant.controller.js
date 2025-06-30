const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../../middleware/asyncHandler");

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

exports.getAllVariants = asyncHandler(async (req, res, next) => {
  const { ProductVariants } = req.models;
  const mongoose = require("mongoose");

  // Parse query params safely
  const templateId = req.query.templateId || null;
  const search = req.query.search?.trim() || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build match stage
  const matchStage = { isActive: true };

  if (templateId) {
    try {
      matchStage.templateId = new mongoose.Types.ObjectId(templateId);
    } catch {
      return res.status(400).json({ success: false, error: "Invalid templateId format." });
    }
  }

  if (search) {
    const regex = new RegExp(search, "i");
    matchStage.$or = [{ variantName: regex }, { sku: regex }, { barcode: regex }];
  }

  // Count total matching documents for pagination meta
  const totalCountPipeline = [{ $match: matchStage }, { $count: "total" }];
  const countResult = await ProductVariants.aggregate(totalCountPipeline);
  const total = countResult[0]?.total || 0;

  // Main aggregation with deep bundleItems population
  const variants = await ProductVariants.aggregate([
    { $match: matchStage },

    // Lookup inventory lots (non-serialized stock)
    {
      $lookup: {
        from: "inventorylots",
        localField: "_id",
        foreignField: "productVariantId",
        as: "lots",
      },
    },

    // Lookup inventory items (serialized stock)
    {
      $lookup: {
        from: "inventoryitems",
        localField: "_id",
        foreignField: "productVariantId",
        pipeline: [{ $match: { status: "in_stock" } }],
        as: "items",
      },
    },

    // Add calculated stock quantity
    {
      $addFields: {
        quantityInStock: {
          $add: [{ $sum: "$lots.quantityInStock" }, { $size: "$items" }],
        },
      },
    },

    // --- Template Lookup with deep bundleItems.productVariantId population ---
    {
      $lookup: {
        from: "producttemplates",
        localField: "templateId",
        foreignField: "_id",
        pipeline: [
          // Step 1: Lookup bundleItems.productVariantId (variants)
          {
            $lookup: {
              from: "productvariants",
              localField: "bundleItems.productVariantId",
              foreignField: "_id",
              pipeline: [
                // Step 2: For each variant, lookup its templateId with only _id and type
                {
                  $lookup: {
                    from: "producttemplates",
                    localField: "templateId",
                    foreignField: "_id",
                    pipeline: [{ $project: { _id: 1, type: 1 } }],
                    as: "templateId",
                  },
                },
                {
                  $unwind: {
                    path: "$templateId",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: "bundleItemsVariants",
            },
          },
          // Step 3: Merge bundleItems array with populated bundleItemsVariants array by index
          {
            $addFields: {
              bundleItems: {
                $map: {
                  input: { $range: [0, { $size: "$bundleItems" }] },
                  as: "idx",
                  in: {
                    $mergeObjects: [
                      { $arrayElemAt: ["$bundleItems", "$$idx"] },
                      { $arrayElemAt: ["$bundleItemsVariants", "$$idx"] },
                    ],
                  },
                },
              },
            },
          },
          { $project: { bundleItemsVariants: 0 } },
        ],
        as: "templateId",
      },
    },
    {
      $unwind: {
        path: "$templateId",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Remove intermediate arrays from response
    {
      $project: {
        lots: 0,
        items: 0,
      },
    },

    // Sort by variantName ascending
    { $sort: { variantName: 1 } },

    // Pagination
    { $skip: skip },
    { $limit: limit },
  ]);

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
