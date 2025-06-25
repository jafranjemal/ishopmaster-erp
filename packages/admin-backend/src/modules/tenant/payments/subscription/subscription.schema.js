const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    frequency: { type: String, required: true, enum: ["monthly", "yearly"] },
    status: {
      type: String,
      required: true,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    nextBillingDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = subscriptionSchema;
