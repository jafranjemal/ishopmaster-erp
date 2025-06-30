const asyncHandler = require("../../../middleware/asyncHandler");
const salesService = require("../../../services/sales.service");

// @desc    Create a new sale (finalize a POS transaction)
// @route   POST /api/v1/tenant/sales/
exports.createSale = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  try {
    let newSaleInvoice;
    await session.withTransaction(async () => {
      newSaleInvoice = await salesService.finalizeSale(
        req.models,
        {
          cartData: req.body.cart,
          paymentData: req.body.payment,
          customerId: req.body.customerId,
          branchId: req.user.assignedBranchId,
          userId: req.user._id,
        },
        req.tenant.settings.localization.baseCurrency
      );
    });
    res.status(201).json({ success: true, data: newSaleInvoice });
  } finally {
    session.endSession();
  }
});

// @desc    Save a sale as a draft
// @route   POST /api/v1/tenant/sales/drafts
exports.createDraft = asyncHandler(async (req, res, next) => {
  const draft = await salesService.createQuoteOrDraft(req.models, {
    ...req.body,
    status: "draft",
    userId: req.user._id,
    branchId: req.user.assignedBranchId,
  });
  res.status(201).json({ success: true, data: draft });
});

// @desc    Save a sale as a quotation
// @route   POST /api/v1/tenant/sales/quotations
exports.createQuotation = asyncHandler(async (req, res, next) => {
  const quote = await salesService.createQuoteOrDraft(req.models, {
    ...req.body,
    status: "quotation",
    userId: req.user._id,
    branchId: req.user.assignedBranchId,
  });
  res.status(201).json({ success: true, data: quote });
});

// @desc    Get all sales currently on hold for the user's branch
// @route   GET /api/v1/tenant/sales/held
exports.getHeldSales = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models;
  const heldSales = await SalesInvoice.find({
    branchId: req.user.assignedBranchId,
    status: "on_hold",
  }).populate("customerId", "name");
  res.status(200).json({ success: true, data: heldSales });
});

// @desc    Update a sale's status (e.g., to 'on_hold' or back to 'draft')
// @route   PATCH /api/v1/tenant/sales/:id/status
exports.updateSaleStatus = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models;
  const { status, holdReason } = req.body;
  const sale = await SalesInvoice.findById(req.params.id);

  if (!sale) return res.status(404).json({ success: false, error: "Sale not found." });

  // Add business logic validation here, e.g., only a 'draft' can be put 'on_hold'

  sale.status = status;
  if (holdReason) sale.holdReason = holdReason;

  await sale.save();
  res.status(200).json({ success: true, data: sale });
});
