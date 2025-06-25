const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Get a paginated summary of stock levels for all variants
// @route   GET /api/v1/tenant/inventory/stock/levels
exports.getStockLevels_old = asyncHandler(async (req, res, next) => {
  const { InventoryLot, InventoryItem } = req.models;

  // This is a complex aggregation to get a unified stock view.
  // It combines quantities from non-serialized lots and serialized items.
  const stockSummary = await InventoryLot.aggregate([
    // In a real app, we would union with InventoryItem collection here.
    // For now, we'll focus on lots.
    {
      $group: {
        _id: {
          productVariantId: "$productVariantId",
          branchId: "$branchId",
        },
        quantityInStock: { $sum: "$quantityInStock" },
        totalCostValue: {
          $sum: { $multiply: ["$quantityInStock", "$costPriceInBaseCurrency"] },
        },
      },
    },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id.productVariantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id.branchId",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: "$variant" },
    { $unwind: "$branch" },
    {
      $project: {
        _id: 0,
        productVariantId: "$_id.productVariantId",
        branchId: "$_id.branchId",
        variantName: "$variant.variantName",
        sku: "$variant.sku",
        branchName: "$branch.name",
        quantityInStock: 1,
        totalCostValue: 1,
      },
    },
    // Add pagination and sorting
    { $sort: { variantName: 1, branchName: 1 } },
  ]);

  res.status(200).json({ success: true, data: stockSummary });
});

// @desc    Get a paginated summary of stock levels for all variants, grouped by branch
// @route   GET /api/v1/tenant/inventory/stock/levels
exports.getStockLevels = asyncHandler(async (req, res, next) => {
  const { InventoryItem, InventoryLot } = req.models;
  const { page = 1, limit = 25, branchId, searchTerm } = req.query;
  const skip = (page - 1) * limit;

  // --- The Definitive Aggregation Pipeline (Corrected) ---

  let matchStage = {};
  if (branchId) {
    matchStage.branchId = new mongoose.Types.ObjectId(branchId);
  }

  // This pipeline correctly calculates stock from both serialized and non-serialized items
  const aggregationPipeline = [
    // 1. Start with Serialized Items and calculate their quantities per branch
    { $match: { status: "in_stock", ...matchStage } },
    {
      $group: {
        _id: { productVariantId: "$productVariantId", branchId: "$branchId" },
        quantity: { $sum: 1 },
      },
    },
    // 2. Union with Non-Serialized Lots
    {
      $unionWith: {
        coll: "inventorylots",
        pipeline: [
          { $match: matchStage },
          {
            $group: {
              _id: {
                productVariantId: "$productVariantId",
                branchId: "$branchId",
              },
              quantity: { $sum: "$quantityInStock" },
            },
          },
        ],
      },
    },
    // 3. Re-group to get the final total stock for each variant AT EACH BRANCH
    {
      $group: {
        _id: "$_id", // The _id is already { productVariantId, branchId }
        totalStock: { $sum: "$quantity" },
      },
    },
    // 4. Lookup all necessary details
    {
      $lookup: {
        from: "productvariants",
        localField: "_id.productVariantId",
        foreignField: "_id",
        as: "variantInfo",
      },
    },
    // CRITICAL FIX: Lookup the branch name
    {
      $lookup: {
        from: "branches",
        localField: "_id.branchId",
        foreignField: "_id",
        as: "branchInfo",
      },
    },
    { $unwind: "$variantInfo" },
    { $unwind: "$branchInfo" },
    // 5. Apply the search term filter
    {
      $match: searchTerm
        ? {
            $or: [
              {
                "variantInfo.variantName": {
                  $regex: searchTerm,
                  $options: "i",
                },
              },
              { "variantInfo.sku": { $regex: searchTerm, $options: "i" } },
            ],
          }
        : {},
    },
    // 6. Project the final, clean shape for the frontend
    {
      $project: {
        _id: 0,
        productVariantId: "$_id.productVariantId",
        branchId: "$_id.branchId",
        variantName: "$variantInfo.variantName",
        sku: "$variantInfo.sku",
        branchName: "$branchInfo.name", // <-- THE MISSING FIELD
        quantityInStock: "$totalStock",
      },
    },
  ];

  // The aggregation now starts from either collection, as they will be unioned.
  const [results, totalCountResult] = await Promise.all([
    InventoryItem.aggregate([
      ...aggregationPipeline,
      { $sort: { variantName: 1, branchName: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]),
    InventoryItem.aggregate([...aggregationPipeline, { $count: "total" }]),
  ]);

  const total = totalCountResult[0]?.total || 0;

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      count: results.length,
    },
    data: results,
  });
});
// @desc    Get summary metrics for a single product variant
// @route   GET /api/v1/tenant/inventory/stock/details/:variantId
exports.getStockDetails_old = asyncHandler(async (req, res, next) => {
  // This controller would use another aggregation pipeline to get KPIs for one variant.
  // e.g., total value, total units sold (from stock movements), etc.
  res.status(200).json({
    success: true,
    data: { message: "Details endpoint for " + req.params.variantId },
  });
});

// @desc    Get summary KPI metrics for a single product variant
// @route   GET /api/v1/tenant/inventory/stock/details/:variantId
exports.getStockDetails = asyncHandler(async (req, res, next) => {
  const { InventoryLot, InventoryItem, StockMovement, ProductVariants } =
    req.models;
  const variantId = new mongoose.Types.ObjectId(req.params.variantId);

  const [variant, stockData, movementData] = await Promise.all([
    ProductVariants.findById(variantId).select("variantName sku").lean(),
    // Aggregation for current stock value from both lots and items
    InventoryLot.aggregate([
      { $match: { productVariantId: variantId } },
      {
        $group: {
          _id: null,
          totalInStock: { $sum: "$quantityInStock" },
          totalValue: {
            $sum: {
              $multiply: ["$quantityInStock", "$costPriceInBaseCurrency"],
            },
          },
        },
      },
    ]),
    // Aggregation for sales history from the audit trail
    StockMovement.aggregate([
      { $match: { productVariantId: variantId, type: "sale" } },
      {
        $group: {
          _id: null,
          unitsSold: { $sum: { $multiply: ["$quantityChange", -1] } },
          totalCostOfSales: {
            $sum: {
              $multiply: ["$quantityChange", -1, "$costPriceInBaseCurrency"],
            },
          },
        },
      },
    ]),
  ]);

  if (!variant)
    return res
      .status(404)
      .json({ success: false, error: "Product Variant not found" });

  const stockResult = stockData[0] || { totalInStock: 0, totalValue: 0 };
  const movementResult = movementData[0] || {
    unitsSold: 0,
    totalCostOfSales: 0,
  };

  // We must also count serialized items
  const serializedStockCount = await InventoryItem.countDocuments({
    productVariantId: variantId,
    status: "in_stock",
  });

  const kpis = {
    variantName: variant.variantName,
    sku: variant.sku,
    totalInStock: stockResult.totalInStock + serializedStockCount,
    totalValue: stockResult.totalValue, // Note: This doesn't include serialized item value yet
    unitsSold: movementResult.unitsSold,
    averageCost:
      movementResult.unitsSold > 0
        ? movementResult.totalCostOfSales / movementResult.unitsSold
        : 0,
  };

  res.status(200).json({ success: true, data: kpis });
});

// @desc    Get the movement history for a single product variant
// @route   GET /api/v1/tenant/inventory/stock/movements/:variantId
exports.getStockMovements = asyncHandler(async (req, res, next) => {
  const { StockMovement } = req.models;
  const { variantId } = req.params;
  const { page = 1, limit = 15, branchId } = req.query;

  const query = { productVariantId: new mongoose.Types.ObjectId(variantId) };
  if (branchId) {
    query.branchId = new mongoose.Types.ObjectId(branchId);
  }

  const [movements, total] = await Promise.all([
    StockMovement.find(query)
      .populate("userId", "name")
      .populate("branchId", "name")
      // CRITICAL: Populate the PO to get the user-friendly number for drill-down
      .populate({
        path: "relatedPurchaseId",
        select: "poNumber supplierId totalAmount",
        populate: { path: "supplierId", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    StockMovement.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      count: movements.length,
    },
    data: movements,
  });
});
