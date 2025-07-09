const asyncHandler = require("../../../../middleware/asyncHandler");
const salesService = require("../../../../services/sales.service");

// @desc    Create a Sales Order from an existing Quotation
// @route   POST /api/v1/tenant/sales/orders/from-quote/:quoteId
exports.createOrderFromQuote = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let newOrder;
  try {
    await session.withTransaction(async () => {
      newOrder = await salesService.convertQuoteToOrder(req.models, {
        quoteId: req.params.quoteId,
        userId: req.user._id,
      });
    });
    res.status(201).json({ success: true, data: newOrder });
  } finally {
    session.endSession();
  }
});

// @desc    Create a Sales Order from a won Opportunity
// @route   POST /api/v1/tenant/sales/orders/from-opportunity/:opportunityId
// @access  Private (Requires 'sales:order:manage' permission)
exports.createOrderFromOpportunity = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let newOrder;
  try {
    await session.withTransaction(async () => {
      newOrder = await salesService.createOrderFromOpportunity(
        req.models,
        {
          opportunityId: req.params.opportunityId,
          userId: req.user._id,
          user: req.user,
        },
        session
      );
    });
    res.status(201).json({ success: true, data: newOrder });
  } finally {
    session.endSession();
  }
});

// ... other standard CRUD controllers for Sales Orders would go here ...
