const asyncHandler = require("../../../middleware/asyncHandler");
const reconciliationService = require("../../../services/reconciliation.service");

// @desc    Post a new Supplier Invoice and trigger reconciliation
// @route   POST /api/v1/tenant/procurement/invoices
// @access  Private (Requires 'accounting:payables:manage' permission)
exports.createAndPostInvoice = asyncHandler(async (req, res, next) => {
  // The controller's main job is to manage the request, response, and the transaction.
  const session = await req.dbConnection.startSession();
  try {
    let newInvoice;
    await session.withTransaction(async () => {
      // Delegate all the complex business logic to the service layer.
      newInvoice = await reconciliationService.postSupplierInvoice(
        req.models,
        { ...req.body }, // Pass the entire body from the frontend form
        req.user._id,
        session
      );
    });
    res.status(201).json({ success: true, data: newInvoice });
  } finally {
    // Always end the session, whether the transaction succeeded or failed.
    session.endSession();
  }
});

// @desc    Get all Supplier Invoices with pagination
// @route   GET /api/v1/tenant/procurement/invoices
// @access  Private (Requires 'accounting:payables:view' permission)
exports.getAllInvoices = asyncHandler(async (req, res, next) => {
  const { SupplierInvoice } = req.models;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    SupplierInvoice.find(req.query.filters || {})
      .populate("supplierId", "name")
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SupplierInvoice.countDocuments(req.query.filters || {}),
  ]);

  res
    .status(200)
    .json({
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

// @desc    Get a single Supplier Invoice by ID
// @route   GET /api/v1/tenant/procurement/invoices/:id
// @access  Private (Requires 'accounting:payables:view' permission)
exports.getInvoiceById = asyncHandler(async (req, res, next) => {
  const { SupplierInvoice } = req.models;
  const invoice = await SupplierInvoice.findById(req.params.id)
    .populate("supplierId", "name")
    .populate("goodsReceiptNoteIds", "grnNumber receivedDate");

  if (!invoice)
    return res
      .status(404)
      .json({ success: false, error: "Supplier Invoice not found" });
  res.status(200).json({ success: true, data: invoice });
});
