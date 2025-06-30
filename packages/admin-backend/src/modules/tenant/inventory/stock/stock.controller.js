const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");
const inventoryService = require("../../../../services/inventory.service");

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
  const { page = 1, limit = 25, branchId, search: searchTerm } = req.query;
  const skip = (page - 1) * limit;

  // --- The Definitive Aggregation Pipeline (Corrected) ---

  let matchStage = {};
  if (branchId) {
    matchStage.branchId = new mongoose.Types.ObjectId(branchId);
  }
  let finalMatch = {};
  if (searchTerm)
    finalMatch = {
      $or: [
        { "variantInfo.variantName": { $regex: searchTerm, $options: "i" } },
        { "variantInfo.sku": { $regex: searchTerm, $options: "i" } },
      ],
    };

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

// @desc    Get ERP-grade stock summary, optionally filtered by branchId
// @route   GET /api/v1/tenant/inventory/stock/summary?branchId=xxxxx
// @access  Private
exports.getStockSummary = asyncHandler(async (req, res, next) => {
  const { ProductVariants, StockMovement, ProductTemplates } = req.models;
  const branchId = req.query.branchId;

  // If branchId given, convert to ObjectId, else null
  const branchObjectId = branchId
    ? new mongoose.Types.ObjectId(branchId)
    : null;

  // Step 1: Start aggregation from ProductVariants
  const summaryAgg = await ProductVariants.aggregate([
    // Lookup ProductTemplates for fallback prices
    {
      $lookup: {
        from: "producttemplates",
        localField: "templateId",
        foreignField: "_id",
        as: "template",
      },
    },
    { $unwind: { path: "$template", preserveNullAndEmptyArrays: true } },

    // Lookup StockMovement, optionally filtered by branch
    {
      $lookup: {
        from: "stockmovements",
        let: { variantId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productVariantId", "$$variantId"],
              },
              ...(branchObjectId ? { branchId: branchObjectId } : {}),
            },
          },
        ],
        as: "movements",
      },
    },

    // Calculate total stock for variant and pricing fallback
    {
      $addFields: {
        totalStock: { $sum: "$movements.quantityChange" },
        effectiveCost: {
          $cond: [
            { $ifNull: ["$costPriceInBaseCurrency", false] },
            "$costPriceInBaseCurrency",
            "$template.costPriceInBaseCurrency",
          ],
        },
        effectiveSelling: {
          $cond: [
            { $ifNull: ["$sellingPrice", false] },
            "$sellingPrice",
            "$template.sellingPrice",
          ],
        },
      },
    },

    // Flag stock status and calculate values
    {
      $addFields: {
        isInStock: { $gt: ["$totalStock", 0] },
        isOutOfStock: {
          $or: [{ $eq: ["$totalStock", 0] }, { $eq: ["$totalStock", null] }],
        },
        stockValue: { $multiply: ["$totalStock", "$effectiveCost"] },
        potentialRevenue: { $multiply: ["$totalStock", "$effectiveSelling"] },
      },
    },

    // Aggregate final KPIs
    {
      $group: {
        _id: null,
        totalStock: { $sum: { $ifNull: ["$totalStock", 0] } },
        totalVariantsInStock: { $sum: { $cond: ["$isInStock", 1, 0] } },
        totalVariantsOutOfStock: { $sum: { $cond: ["$isOutOfStock", 1, 0] } },
        totalStockValue: { $sum: { $ifNull: ["$stockValue", 0] } },
        totalPotentialRevenue: { $sum: { $ifNull: ["$potentialRevenue", 0] } },
      },
    },
  ]);

  // Step 2: Calculate totalStockOut (sales, adjustments, etc)
  const stockOutAgg = await StockMovement.aggregate([
    {
      $match: {
        ...(branchObjectId ? { branchId: branchObjectId } : {}),
        type: {
          $in: ["sale", "adjustment_out", "transfer_out", "return_out"],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalStockOut: { $sum: "$quantityChange" }, // negative numbers expected
      },
    },
  ]);

  // Step 3: Prepare response
  const summary = summaryAgg[0] || {
    totalStock: 0,
    totalVariantsInStock: 0,
    totalVariantsOutOfStock: 0,
    totalStockValue: 0,
    totalPotentialRevenue: 0,
  };
  const totalStockOut = Math.abs(stockOutAgg[0]?.totalStockOut || 0);

  res.status(200).json({
    success: true,
    data: {
      totalStock: summary.totalStock,
      totalVariantsInStock: summary.totalVariantsInStock,
      totalVariantsOutOfStock: summary.totalVariantsOutOfStock,
      totalStockValue: summary.totalStockValue,
      totalPotentialRevenue: summary.totalPotentialRevenue,
      totalStockOut,
    },
  });
});

exports.createStockAdjustment = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await inventoryService.adjustStock(
        req.models,
        { ...req.body, userId: req.user._id },
        session
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

exports.dispatchTransferOrder = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const transfer = await StockTransfer.findById(req.params.id);
  if (!transfer || transfer.status !== "pending")
    throw new Error("Transfer not found or already in transit.");

  const session = await req.dbConnection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await inventoryService.dispatchTransfer(
        req.models,
        { transfer, userId: req.user._id },
        session
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

exports.receiveTransferOrder = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const transfer = await StockTransfer.findById(req.params.id);
  if (!transfer || transfer.status !== "in_transit")
    throw new Error("Transfer not found or not in transit.");

  try {
    let result;
    await session.withTransaction(async () => {
      result = await inventoryService.dispatchTransfer(
        req.models,
        { transfer, userId: req.user._id },
        session
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

// @desc    Get all stock transfers with pagination and filtering
// @route   GET /api/v1/tenant/inventory/stock/transfers
exports.getAllTransfers = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const { page = 1, limit = 15, status } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (status) filters.status = status;

  const [transfers, total] = await Promise.all([
    StockTransfer.find(filters)
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    StockTransfer.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    },
    data: transfers,
  });
});

// @desc    Get a single stock transfer by ID
// @route   GET /api/v1/tenant/inventory/stock/transfers/:id
exports.getTransferById = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const transfer = await StockTransfer.findById(req.params.id)
    .populate("fromBranchId", "name")
    .populate("toBranchId", "name")
    .populate("createdBy", "name")
    .populate("dispatchedBy", "name")
    .populate("receivedBy", "name")
    .populate({
      path: "items.productVariantId",
      select: "variantName sku templateId",
      populate: { path: "templateId", select: "type" },
    });

  if (!transfer)
    return res
      .status(404)
      .json({ success: false, error: "Transfer not found." });
  res.status(200).json({ success: true, data: transfer });
});

// @desc    Create a new stock transfer order
// @route   POST /api/v1/tenant/inventory/stock/transfers
exports.createTransfer = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const newTransfer = await StockTransfer.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: newTransfer });
});

// @desc    Dispatch a pending stock transfer
// @route   POST /api/v1/tenant/inventory/stock/transfers/:id/dispatch
exports.dispatchTransferOrder = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const transfer = await StockTransfer.findById(req.params.id);
  if (!transfer || transfer.status !== "pending")
    throw new Error("Transfer not found or cannot be dispatched.");

  const session = await req.dbConnection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await inventoryService.dispatchTransfer(
        req.models,
        { transfer, userId: req.user._id },
        session
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

// @desc    Receive an in-transit stock transfer
// @route   POST /api/v1/tenant/inventory/stock/transfers/:id/receive
exports.receiveTransferOrder = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const transfer = await StockTransfer.findById(req.params.id);
  if (!transfer || transfer.status !== "in_transit")
    throw new Error("Transfer not found or not currently in transit.");

  const session = await req.dbConnection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await inventoryService.receiveTransfer(
        req.models,
        { transfer, userId: req.user._id },
        session
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

// @desc    Cancel a pending stock transfer
// @route   PATCH /api/v1/tenant/inventory/stock/transfers/:id/cancel
exports.cancelTransfer = asyncHandler(async (req, res, next) => {
  const { StockTransfer } = req.models;
  const transfer = await StockTransfer.findById(req.params.id);
  if (!transfer || transfer.status !== "pending") {
    return res.status(400).json({
      success: false,
      error: "Only pending transfers can be cancelled.",
    });
  }
  transfer.status = "cancelled";
  await transfer.save();
  res.status(200).json({ success: true, data: transfer });
});

// @desc    Get total available quantity for a non-serialized variant at a branch
// @route   GET /api/v1/tenant/inventory/stock/lot-quantity?productVariantId=...&branchId=...
exports.getLotQuantityForVariant = asyncHandler(async (req, res, next) => {
  const { InventoryLot } = req.models;
  const { productVariantId, branchId } = req.query;

  if (!productVariantId || !branchId) {
    return res.status(400).json({
      success: false,
      error: "Product Variant ID and Branch ID are required.",
    });
  }

  const result = await InventoryLot.aggregate([
    {
      $match: {
        productVariantId: new mongoose.Types.ObjectId(productVariantId),
        branchId: new mongoose.Types.ObjectId(branchId),
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$quantityInStock" },
      },
    },
  ]);

  const availableQuantity = result[0]?.totalQuantity || 0;
  res.status(200).json({ success: true, data: { availableQuantity } });
});

// @desc    Get available serial numbers for a serialized variant at a branch
// @route   GET /api/v1/tenant/inventory/stock/available-serials?productVariantId=...&branchId=...
exports.getAvailableSerials = asyncHandler(async (req, res, next) => {
  const { InventoryItem } = req.models;
  const { productVariantId, branchId, page = 1, limit = 100 } = req.query;
  const skip = (page - 1) * limit;

  if (!productVariantId || !branchId) {
    return res.status(400).json({
      success: false,
      error: "Product Variant ID and Branch ID are required.",
    });
  }

  const query = {
    productVariantId: new mongoose.Types.ObjectId(productVariantId),
    branchId: new mongoose.Types.ObjectId(branchId),
    status: "in_stock",
  };

  console.log(query);
  const [serials, total] = await Promise.all([
    InventoryItem.find(query)
      .select("serialNumber")
      .sort({ serialNumber: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    InventoryItem.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    },
    data: serials,
  });
});
