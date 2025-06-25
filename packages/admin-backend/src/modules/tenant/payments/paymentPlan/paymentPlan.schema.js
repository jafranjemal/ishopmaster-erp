const mongoose = require("mongoose");

const paymentPlanLineSchema = new mongoose.Schema(
  {
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { _id: false }
);

const paymentPlanSchema = new mongoose.Schema(
  {
    paymentSourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    paymentSourceType: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    installments: [paymentPlanLineSchema],
  },
  { timestamps: true }
);

module.exports = paymentPlanSchema;
