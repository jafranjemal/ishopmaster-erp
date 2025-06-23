const asyncHandler = require("../../../middleware/asyncHandler");
const purchasingService = require("../../../services/purchasing.service");

// @desc    Create a new Purchase Order
// @route   POST /api/v1/tenant/procurement/purchase-orders
exports.createPurchaseOrder = asyncHandler(async (req, res, next) => {
  const newPO = await purchasingService.createPurchaseOrder(
    req.models,
    req.body,
    req.user._id
  );
  res.status(201).json({ success: true, data: newPO });
});

// @desc    Get all Purchase Orders with pagination
// @route   GET /api/v1/tenant/procurement/purchase-orders
exports.getAllPurchaseOrders = asyncHandler(async (req, res, next) => {
  const { PurchaseOrder } = req.models;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    PurchaseOrder.find(req.query.filters) // Example for future filtering
      .populate("supplierId", "name")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PurchaseOrder.countDocuments(req.query.filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: { page, limit, totalPages: Math.ceil(total / limit) },
    data: results,
  });
});

// @desc    Get a single Purchase Order by ID with full details
// @route   GET /api/v1/tenant/procurement/purchase-orders/:id
exports.getPurchaseOrderById = asyncHandler(async (req, res, next) => {
  const { PurchaseOrder } = req.models;
  const po = await PurchaseOrder.findById(req.params.id)
    .populate("supplierId", "name phone email")
    .populate("destinationBranchId", "name")
    .populate({
      path: "items.productVariantId",
      select: "variantName sku templateId",
      populate: {
        path: "templateId",
        select: "skuPrefix sellingPrice costPrice type",
      },
    });
  if (!po)
    return res
      .status(404)
      .json({ success: false, error: "Purchase Order not found" });
  res.status(200).json({ success: true, data: po });
});

// @desc    Receive goods against a Purchase Order
// @route   POST /api/v1/tenant/procurement/purchase-orders/:id/receive
exports.receiveGoods = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  try {
    let updatedPO;
    await session.withTransaction(async () => {
      updatedPO = await purchasingService.receiveGoodsFromPO(
        req.models,
        {
          poId: req.params.id,
          receivedItems: req.body.receivedItems,
          userId: req.user._id,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: updatedPO });
  } finally {
    session.endSession();
  }
});

// NOTE: updatePurchaseOrder and cancelPurchaseOrder controllers would also be built here
// for a complete implementation, following similar patterns.
