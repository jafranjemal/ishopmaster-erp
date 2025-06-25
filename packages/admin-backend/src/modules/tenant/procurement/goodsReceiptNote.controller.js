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
