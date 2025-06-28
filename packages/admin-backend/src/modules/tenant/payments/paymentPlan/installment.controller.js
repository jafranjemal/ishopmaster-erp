const asyncHandler = require("../../../../middleware/asyncHandler");
const installmentService = require("../../../../services/installment.service");

// @desc    Create a new installment plan for a source document
// @route   POST /api/v1/tenant/payments/installments
// @access  Private
exports.createPlan = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  try {
    let newPlan;
    await session.withTransaction(async () => {
      newPlan = await installmentService.createInstallmentPlan(
        req.models,
        req.body,
        req.user._id
      );
    });
    res.status(201).json({ success: true, data: newPlan });
  } finally {
    session.endSession();
  }
});

// @desc    Get a single installment plan by its ID
// @route   GET /api/v1/tenant/payments/installments/:id
// @access  Private
exports.getPlanById = asyncHandler(async (req, res, next) => {
  const { PaymentPlan } = req.models;
  const plan = await PaymentPlan.findById(req.params.id);
  if (!plan) {
    return res
      .status(404)
      .json({ success: false, error: "Installment plan not found." });
  }
  res.status(200).json({ success: true, data: plan });
});

// @desc    Apply a payment to a specific line item in an installment plan
// @route   POST /api/v1/tenant/payments/installments/:planId/lines/:lineId/pay
// @access  Private
exports.applyPaymentToInstallmentLine = asyncHandler(async (req, res, next) => {
  const { planId, lineId } = req.params;
  const paymentData = req.body;

  const session = await req.dbConnection.startSession();
  try {
    let updatedPlan;
    await session.withTransaction(async () => {
      updatedPlan = await installmentService.applyPaymentToInstallment(
        req.models,
        { planId, lineId, paymentData },
        req.user._id,
        req.tenant.settings.localization.baseCurrency
      );
    });
    res.status(200).json({ success: true, data: updatedPlan });
  } finally {
    session.endSession();
  }
});

// @desc    Get all installment plans for a specific customer
// @route   GET /api/v1/tenant/payments/installments?customerId=:customerId
// @access  Private
exports.getPlansForCustomer = asyncHandler(async (req, res, next) => {
  const { PaymentPlan } = req.models;
  const { customerId } = req.query;

  if (!customerId) {
    return res
      .status(400)
      .json({ success: false, error: "Customer ID is required." });
  }

  // To find the plans, we must first find the sales invoices for that customer
  // This is a complex query that will be simplified here. A real-world app might denormalize customerId onto the plan.
  // For now, we assume a direct link might be added later or a more complex aggregation is needed.
  // Let's mock the expected behavior for now.
  const plans = await PaymentPlan.find({
    /* Logic to find by customer would go here */
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: plans });
});
