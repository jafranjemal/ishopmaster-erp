const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");
const paymentsService = require("../../../../services/payments.service");

// @desc    Get all payment transactions with filtering and pagination
// @route   GET /api/v1/tenant/payments/transactions
exports.getAllPayments = asyncHandler(async (req, res, next) => {
  const { Payment } = req.models;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  // Build the filter query dynamically
  const filters = {};
  if (req.query.direction) filters.direction = req.query.direction;
  if (req.query.paymentMethodId) {
    filters["paymentLines.paymentMethodId"] = new mongoose.Types.ObjectId(req.query.paymentMethodId);
  }
  if (req.query.startDate && req.query.endDate) {
    filters.paymentDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const [results, total] = await Promise.all([
    Payment.find(filters)
      .populate({
        path: "paymentLines.paymentMethodId",
        select: "name type",
      })
      .populate("processedBy", "name")
      // We cannot easily populate the polymorphic `paymentSourceId` here.
      // This is a tradeoff for flexibility. The frontend will display the ID.
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      count: results.length,
    },
    data: results,
  });
});

// @desc    Get a single payment transaction by its ID with all details
// @route   GET /api/v1/tenant/payments/transactions/:id
// @access  Private (Requires 'accounting:payment:view' permission)
exports.getPaymentById = asyncHandler(async (req, res, next) => {
  const { Payment } = req.models;
  const paymentId = req.params.id;

  // 1. Fetch the main payment document and populate its direct references
  const payment = await Payment.findById(paymentId)
    .populate("processedBy", "name")
    .populate({
      path: "paymentLines.paymentMethodId",
      select: "name type",
    })
    .lean(); // Use .lean() to get a plain JS object we can modify

  if (!payment) {
    return res.status(404).json({ success: false, error: "Payment not found." });
  }

  // 2. Perform the polymorphic populate for the source document
  if (payment.paymentSourceId && payment.paymentSourceType) {
    const SourceModel = req.models[payment.paymentSourceType];
    if (SourceModel) {
      const sourceDocument = await SourceModel.findById(payment.paymentSourceId)
        .select("supplierInvoiceNumber poNumber totalAmount") // Select fields you want to show
        .lean();
      // 3. Attach the source document to our main payment object
      payment.sourceDocument = sourceDocument;
    }
  }

  res.status(200).json({ success: true, data: payment });
});

/**
 * @desc    Record a new payment against a source document (e.g., SalesInvoice).
 * @route   POST /api/v1/tenant/accounting/payments
 * @access  Private (Requires 'sales:pos:access' or 'accounting:payment:create')
 */
exports.recordPayment = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let newPayment;
  console.log("payment body ", req.body);
  try {
    await session.withTransaction(async () => {
      newPayment = await paymentsService.recordPayment(
        req.models,
        req.body, // The body should contain { paymentSourceId, paymentSourceType, paymentLines, ... }
        req.user._id,
        req.tenant.settings.localization.baseCurrency,
        req.tenant,
        session
      );
    });
    res.status(201).json({ success: true, data: newPayment });
  } finally {
    session.endSession();
  }
});
