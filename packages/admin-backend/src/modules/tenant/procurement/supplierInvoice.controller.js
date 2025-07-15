const asyncHandler = require("../../../middleware/asyncHandler");
const paymentsService = require("../../../services/payments.service");
const reconciliationService = require("../../../services/reconciliation.service");

// @desc    Post a new Supplier Invoice and trigger reconciliation
// @route   POST /api/v1/tenant/procurement/invoices
// @access  Private (Requires 'accounting:payables:manage' permission)
exports.createAndPostInvoice = asyncHandler(async (req, res, next) => {
  // The controller's main job is to manage the request, response, and the transaction.
  const session = await req.dbConnection.startSession();
  try {
    console.log("\n\n################ ######################");
    console.log("note Ids ", req.body);

    let newInvoice;
    await session.withTransaction(async () => {
      // Delegate all the complex business logic to the service layer.
      newInvoice = await reconciliationService.postSupplierInvoice(
        req.models,
        { ...req.body }, // Pass the entire body from the frontend form
        req.user._id,
        req.tenant
      );
    });
    res.status(201).json({ success: true, data: newInvoice });
  } finally {
    // Always end the session, whether the transaction succeeded or failed.
    session.endSession();
  }
});

// @desc    Record a payment against a specific Supplier Invoice
// @route   POST /api/v1/tenant/procurement/invoices/:id/payments
// @access  Private (Requires 'accounting:payables:manage' permission)
exports.recordPaymentForInvoice = asyncHandler(async (req, res, next) => {
  const { id: invoiceId } = req.params;
  const { user, dbConnection } = req;
  const paymentDetails = req.body;

  // The controller is responsible for managing the database session/transaction.
  const session = await dbConnection.startSession();
  try {
    let createdPayment;
    await session.withTransaction(async () => {
      // It delegates the complex business logic to the universal PaymentsService.
      createdPayment = await paymentsService.recordPayment(
        req.models,
        {
          // Pass the specific details for this workflow
          paymentSourceId: invoiceId,
          paymentSourceType: "SupplierInvoice",
          direction: "outflow", // Paying a supplier is an outflow of cash
          ...paymentDetails, // Includes paymentLines array, date, notes, etc.
        },
        user._id, // The user performing the action
        req.tenant.settings.localization.baseCurrency // Pass the tenant's base currency
      );
    });

    res.status(201).json({ success: true, data: createdPayment });
  } finally {
    // Always ensure the session is closed to prevent connection leaks.
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

// @desc    Get a single Supplier Invoice by ID
// @route   GET /api/v1/tenant/procurement/invoices/:id
// @access  Private (Requires 'accounting:payables:view' permission)
exports.getInvoiceByIdOld = asyncHandler(async (req, res, next) => {
  const { SupplierInvoice } = req.models;
  const invoice = await SupplierInvoice.findById(req.params.id)
    .populate("supplierId", "name")
    .populate("goodsReceiptNoteIds", "grnNumber receivedDate");

  if (!invoice)
    return res.status(404).json({ success: false, error: "Supplier Invoice not found" });
  res.status(200).json({ success: true, data: invoice });
});

// @desc    Get a single Supplier Invoice by ID, including its payment history
// @route   GET /api/v1/tenant/procurement/invoices/:id
// @access  Private (Requires 'accounting:payables:view' permission)
exports.getInvoiceById = asyncHandler(async (req, res, next) => {
  const { SupplierInvoice, Payment } = req.models;
  const invoiceId = req.params.id;

  // 1. Fetch the main invoice document. Use .lean() for performance and to allow modification.
  const invoice = await SupplierInvoice.findById(invoiceId)
    .populate("supplierId", "name")
    .populate("goodsReceiptNoteIds", "grnNumber receivedDate")
    .lean();

  if (!invoice) {
    return res.status(404).json({ success: false, error: "Supplier Invoice not found" });
  }

  // 2. Fetch all related payment documents for this specific invoice.
  const payments = await Payment.find({
    paymentSourceId: invoiceId,
    paymentSourceType: "SupplierInvoice",
  })
    .populate({
      path: "paymentLines.paymentMethodId",
      select: "name type",
    })
    .sort({ paymentDate: -1 });

  // 3. Attach the payment history to the invoice object before responding.
  invoice.payments = payments;
  if (payments && !invoice.amountPaid) {
    invoice.amountPaid = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }
  res.status(200).json({ success: true, data: invoice });
});
