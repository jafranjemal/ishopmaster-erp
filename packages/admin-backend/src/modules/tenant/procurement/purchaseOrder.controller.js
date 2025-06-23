const asyncHandler = require("../../../middleware/asyncHandler");
const purchasingService = require("../../../services/purchasing.service");

// @desc    Create a new Purchase Order
// @route   POST /api/v1/tenant/procurement/purchase-orders
exports.createPurchaseOrder = asyncHandler(async (req, res, next) => {
  const baseCurrency = req.tenant.settings.localization.baseCurrency;
  const newPO = await purchasingService.createPurchaseOrder(
    req.models,
    req.body,
    req.user._id,
    baseCurrency
  );
  res.status(201).json({ success: true, data: newPO });
});

// @desc    Get all Purchase Orders with pagination
// @route   GET /api/v1/tenant/procurement/purchase-orders
exports.getAllPurchaseOrders = asyncHandler(async (req, res, next) => {
  const { PurchaseOrder } = req.models;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.searchTerm)
    filters.poNumber = { $regex: req.query.searchTerm, $options: "i" };

  const [results, total] = await Promise.all([
    PurchaseOrder.find(filters)
      .populate("supplierId", "name")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PurchaseOrder.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
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
        select: "type",
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

exports.receiveGoods_old = asyncHandler(async (req, res, next) => {
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
    res.status(200).json({
      message: "Goods received and stock updated successfully.",
      success: true,
      data: updatedPO,
    });
  } finally {
    session.endSession();
  }
});

exports.receiveGoodsForPO_old = asyncHandler(async (req, res, next) => {
  // The controller's primary role is to handle the HTTP layer and manage the transaction.
  const { poId } = req.params;
  const { receivedItems } = req.body;
  const userId = req.user._id; // Assumes `protect` middleware attaches the user

  const tenantDbConnection = req.dbConnection;
  const models = req.models;
  const session = await tenantDbConnection.startSession();

  try {
    session.startTransaction();

    // Delegate all complex business logic to the PurchasingService.
    // The service will handle inventory updates and accounting entries.
    const updatedPO = await purchasingService.receiveGoodsFromPO(
      models,
      { poId, receivedItems, userId },
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Goods received and stock updated successfully.",
      data: updatedPO,
    });
  } catch (error) {
    // If any part of the service logic fails, the transaction is aborted.
    await session.abortTransaction();
    session.endSession();

    // Pass the error to our global error handler
    next(error);
  }
});

// @desc    Receive goods against a Purchase Order
// @route   POST /api/v1/tenant/procurement/purchase-orders/:id/receive
// @access  Private (Requires 'procurement:po:receive' permission)
exports.receiveGoods = asyncHandler(async (req, res, next) => {
  // The controller's main job is to manage the request, response, and the transaction.
  const session = await req.dbConnection.startSession();
  try {
    let updatedPO;
    // Start a transaction.
    await session.withTransaction(async () => {
      // Delegate all the complex business logic to the service layer.
      updatedPO = await purchasingService.receiveGoodsFromPO(
        req.models,
        {
          poId: req.params.id,
          receivedItems: req.body.receivedItems,
          notes: req.body.notes,
          userId: req.user._id,
        },
        session
      );
    });
    // If the transaction was successful, respond to the client.
    res.status(200).json({ success: true, data: updatedPO });
  } finally {
    // Always end the session, whether the transaction succeeded or failed.
    session.endSession();
  }
});

// @desc    Get all POs that have received goods but are not yet invoiced
// @route   GET /api/v1/tenant/procurement/purchase-orders/awaiting-invoice
// @access  Private (Requires 'accounting:payables:view' permission)
exports.getPOsAwaitingInvoice = asyncHandler(async (req, res, next) => {
  const { PurchaseOrder, SupplierInvoice } = req.models;

  // 1. Find all PO IDs that have already been used in a Supplier Invoice.
  const invoicedPOs = await SupplierInvoice.find({}).distinct(
    "purchaseOrderId"
  );

  // 2. Find all POs that are received but whose ID is NOT IN the list of invoiced POs.
  const awaitingInvoice = await PurchaseOrder.find({
    status: { $in: ["partially_received", "fully_received"] },
    _id: { $nin: invoicedPOs },
  })
    .populate("supplierId", "name")
    .sort({ orderDate: 1 }); // Sort oldest first

  res.status(200).json({ success: true, data: awaitingInvoice });
});
