const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Find any transactional document by its user-facing number
// @route   GET /api/v1/tenant/search/documents?query=...
exports.findDocumentByNumber = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ success: false, error: "A search query is required." });
  }

  const { RepairTicket, SalesInvoice } = req.models;
  let document = null;
  let docType = null;

  // Search across multiple collections
  document = await RepairTicket.findOne({ ticketNumber: query });
  if (document) docType = "RepairTicket";

  if (!document) {
    document = await SalesInvoice.findOne({ invoiceId: query });
    if (document) docType = "SalesInvoice";
  }

  // Add searches for Sales Orders, etc. here in the future

  if (!document) {
    return res.status(404).json({ success: false, error: "No document found with that ID." });
  }

  res.status(200).json({ success: true, data: { document, type: docType } });
});
