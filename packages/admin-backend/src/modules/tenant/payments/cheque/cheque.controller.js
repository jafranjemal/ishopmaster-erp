const chequeService = require("../../../../services/cheque.service");
const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all cheques with a 'pending_clearance' status
// @route   GET /api/v1/tenant/payments/cheques/pending
// @access  Private (Requires 'accounting:cheque:view' permission)
exports.getAllPendingCheques = asyncHandler(async (req, res, next) => {
  const { Cheque } = req.models;

  const pendingCheques = await Cheque.find({
    status: "pending_clearance",
  }).sort({ chequeDate: 1 }); // Show oldest first

  res.status(200).json({
    success: true,
    count: pendingCheques.length,
    data: pendingCheques,
  });
});

// @desc    Update the status of a cheque (cleared, bounced)
// @route   PATCH /api/v1/tenant/payments/cheques/:id/status
// @access  Private (Requires 'accounting:cheque:manage' permission)
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id: chequeId } = req.params;

  // The controller's main job is to manage the request, response, and the transaction.
  const session = await req.dbConnection.startSession();
  try {
    let updatedCheque;
    await session.withTransaction(async () => {
      // Delegate all the complex business logic to the service layer.
      updatedCheque = await chequeService.updateChequeStatus(req.models, {
        chequeId,
        newStatus: status,
        userId: req.user._id,
        baseCurrency: req.tenant.settings.localization.baseCurrency,
      });
    });
    res.status(200).json({ success: true, data: updatedCheque });
  } finally {
    // Always end the session, whether the transaction succeeded or failed.
    session.endSession();
  }
});
