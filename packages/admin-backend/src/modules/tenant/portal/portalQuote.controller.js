const asyncHandler = require("../../../middleware/asyncHandler");
const quotationService = require("../../../services/quotation.service");

/**
 * @desc    Fetch a single repair quote for public viewing by a customer.
 * @route   GET /api/v1/public/portal/quotes/:id
 * @access  Public (but requires a valid, unguessable Quote ID)
 */
exports.getPublicQuoteByIdold = asyncHandler(async (req, res, next) => {
  const { RepairQuote } = req.models;
  const quote = await RepairQuote.findById(req.params.id).populate({
    path: "repairTicketId",
    select: "ticketNumber customerId",
    populate: { path: "customerId", select: "name" },
  });

  if (!quote || quote.status !== "pending_approval") {
    return res.status(404).json({ success: false, error: "Quotation not found, already actioned, or expired." });
  }
  res.status(200).json({ success: true, data: quote });
});

/**
 * @desc    Allow a customer to approve a repair quotation.
 * @route   POST /api/v1/public/portal/quotes/:id/approve
 * @access  Public
 */
exports.approveQuoteold = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let approvedQuote;
  try {
    await session.withTransaction(async () => {
      approvedQuote = await quotationService.approveQuote(
        req.models,
        {
          quoteId: req.params.id,
          signature: req.body.signature,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: approvedQuote });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Fetch a single repair quote for public viewing by a customer.
 * @route   GET /api/v1/public/portal/quotes/:id
 * @access  Public (but requires a valid, unguessable Quote ID and correct tenant subdomain)
 */
exports.getPublicQuoteById = asyncHandler(async (req, res, next) => {
  const { RepairQuote } = req.models;
  const quote = await RepairQuote.findById(req.params.id).populate({
    path: "repairTicketId",
    select: "ticketNumber customerId assets",
    populate: [
      { path: "customerId", select: "name" },
      { path: "assets", select: "deviceId serialNumber", populate: { path: "deviceId", select: "name" } },
    ],
  });

  if (!quote || quote.status !== "pending_approval") {
    return res.status(404).json({ success: false, error: "Quotation not found, already actioned, or expired." });
  }
  res.status(200).json({ success: true, data: quote });
});

/**
 * @desc    Allow a customer to approve a repair quotation.
 * @route   POST /api/v1/public/portal/quotes/:id/approve
 * @access  Public
 */
exports.approveQuote = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let approvedQuote;
  try {
    await session.withTransaction(async () => {
      approvedQuote = await quotationService.approveQuote(
        req.models,
        {
          quoteId: req.params.id,
          signature: req.body.signature,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: approvedQuote });
  } finally {
    session.endSession();
  }
});
