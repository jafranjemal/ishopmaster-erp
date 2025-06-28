const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Get all Goods Receipt Notes with status 'pending_invoice'
// @route   GET /api/v1/tenant/procurement/grns/awaiting-invoice
// @access  Private (Requires 'accounting:payables:view' permission)
exports.getGRNsAwaitingInvoice = asyncHandler(async (req, res, next) => {
  const { GoodsReceiptNote } = req.models;

  const awaitingInvoice = await GoodsReceiptNote.find({
    status: "pending_invoice",
  })
    .populate("supplierId", "name")
    .populate("purchaseOrderId", "poNumber")
    .sort({ receivedDate: 1 }); // Show oldest first

  res.status(200).json({
    success: true,
    count: awaitingInvoice.length,
    data: awaitingInvoice,
  });
});

// @desc    Get a single Goods Receipt Note by its ID
// @route   GET /api/v1/tenant/procurement/grns/:id
// @access  Private (Requires 'procurement:po:view' permission)
exports.getGrnById = asyncHandler(async (req, res, next) => {
  const { GoodsReceiptNote } = req.models;
  const grn = await GoodsReceiptNote.findById(req.params.id)
    .populate("supplierId", "name")
    .populate("purchaseOrderId", "poNumber")
    .populate("receivedBy", "name")
    .populate({
      path: "items.productVariantId",
      select: "variantName sku",
    })
    .lean();

  if (!grn) {
    return res
      .status(404)
      .json({ success: false, error: "Goods Receipt Note not found." });
  }

  res.status(200).json({ success: true, data: grn });
});

// @desc    Get details for multiple GRNs by their IDs
// @route   POST /api/v1/tenant/procurement/grns/by-ids
exports.getGrnsByIds = asyncHandler(async (req, res, next) => {
  const { GoodsReceiptNote } = req.models;
  const { grnIds } = req.body;

  if (!Array.isArray(grnIds) || grnIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "An array of grnIds is required." });
  }

  const grns = await GoodsReceiptNote.find({ _id: { $in: grnIds } })
    .populate({
      path: "items.productVariantId",
      select: "variantName sku",
    })
    .populate("purchaseOrderId", "poNumber expectedCostPrice") // We need expected cost from PO
    .lean();

  res.status(200).json({ success: true, data: grns });
});

// @desc    Get all Goods Receipt Notes with filtering and pagination
// @route   GET /api/v1/tenant/procurement/grns
exports.getAllGRNs = asyncHandler(async (req, res, next) => {
  const { GoodsReceiptNote } = req.models;
  const {
    page = 1,
    limit = 15,
    supplierId,
    startDate,
    endDate,
    searchTerm,
  } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (supplierId) filters.supplierId = new mongoose.Types.ObjectId(supplierId);
  if (startDate && endDate) {
    filters.receivedDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  if (searchTerm) {
    filters["purchaseOrderId.poNumber"] = { $regex: searchTerm, $options: "i" };
  }

  const [grns, total] = await Promise.all([
    GoodsReceiptNote.find(filters)
      .populate("supplierId", "name")
      .populate("purchaseOrderId", "poNumber")
      .populate("receivedBy", "name")
      .sort({ receivedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    GoodsReceiptNote.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    },
    data: grns,
  });
});
