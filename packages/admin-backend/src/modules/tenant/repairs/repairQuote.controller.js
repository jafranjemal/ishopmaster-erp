const asyncHandler = require("../../../middleware/asyncHandler");
const quotationService = require("../../../services/quotation.service");

exports.generateQuote = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let quote;
  try {
    await session.withTransaction(async () => {
      quote = await quotationService.generateQuoteFromTicket(
        req.models,
        {
          ticketId: req.params.ticketId,
          userId: req.user._id,
          ...req.body,
        },
        session
      );
    });
    res.status(201).json({ success: true, data: quote });
  } finally {
    session.endSession();
  }
});

exports.approveQuote = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let quote;
  try {
    await session.withTransaction(async () => {
      quote = await quotationService.approveQuote(
        req.models,
        {
          quoteId: req.params.id,
          signature: req.body.signature,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: quote });
  } finally {
    session.endSession();
  }
});

exports.sendQuote = asyncHandler(async (req, res, next) => {
  const result = await quotationService.sendQuoteToCustomer(req.models, {
    quoteId: req.params.id,
    tenant: req.tenant, // Pass the full tenant object for subdomain URL construction
  });
  res.status(200).json({ success: true, data: result });
});

// @desc    Get all quotations for a specific repair ticket
// @route   GET /api/v1/tenant/repairs/quotes?ticketId=:ticketId
exports.getQuotesForTicket = asyncHandler(async (req, res, next) => {
  const { RepairQuote } = req.models;
  const { ticketId } = req.query;
  if (!ticketId) {
    return res.status(400).json({ success: false, error: "Repair Ticket ID is required." });
  }
  const quotes = await RepairQuote.find({ repairTicketId: ticketId }).sort({ version: -1 });
  res.status(200).json({ success: true, data: quotes });
});
