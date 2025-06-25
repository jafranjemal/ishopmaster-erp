const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all payment methods for the tenant
// @route   GET /api/v1/tenant/payments/methods
exports.getAllPaymentMethods = asyncHandler(async (req, res, next) => {
  const { PaymentMethod } = req.models;
  const methods = await PaymentMethod.find({})
    .populate("linkedAccountId", "name type")
    .populate("holdingAccountId", "name type")
    .sort({ name: 1 });
  res.status(200).json({ success: true, data: methods });
});

// @desc    Create a new payment method
// @route   POST /api/v1/tenant/payments/methods
exports.createPaymentMethod = asyncHandler(async (req, res, next) => {
  const { PaymentMethod } = req.models;
  const newMethod = await PaymentMethod.create(req.body);
  res.status(201).json({ success: true, data: newMethod });
});

// @desc    Update a payment method
// @route   PUT /api/v1/tenant/payments/methods/:id
exports.updatePaymentMethod = asyncHandler(async (req, res, next) => {
  const { PaymentMethod } = req.models;
  const updatedMethod = await PaymentMethod.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedMethod)
    return res
      .status(404)
      .json({ success: false, error: "Payment method not found." });
  res.status(200).json({ success: true, data: updatedMethod });
});

// @desc    Delete a payment method
// @route   DELETE /api/v1/tenant/payments/methods/:id
exports.deletePaymentMethod = asyncHandler(async (req, res, next) => {
  const { PaymentMethod, Payment } = req.models;
  const methodId = req.params.id;

  // Data Integrity Check: Prevent deletion if the method has been used in any payment.
  const paymentCount = await Payment.countDocuments({
    "paymentLines.paymentMethodId": methodId,
  });
  if (paymentCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This method is used in ${paymentCount} payment(s).`,
    });
  }

  const method = await PaymentMethod.findByIdAndDelete(methodId);
  if (!method)
    return res
      .status(404)
      .json({ success: false, error: "Payment method not found." });

  res.status(200).json({ success: true, data: {} });
});
