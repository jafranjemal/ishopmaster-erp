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
