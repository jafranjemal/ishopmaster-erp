const mongoose = require("mongoose");

/**
 * Defines a single, unique, redeemable discount coupon.
 */
const couponSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "CouponBatch", required: true },
    code: { type: String, required: true, unique: true, index: true },
    discount: {
      // Denormalized from batch for historical accuracy
      type: { type: String, required: true, enum: ["percentage", "fixed_amount"] },
      value: { type: Number, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "locked", "redeemed", "expired"],
      default: "active",
    },
    expiryDate: { type: Date },
    timesUsed: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 1 },
    redeemedAt: { type: Date },
    redeemedOnInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" },
  },
  { timestamps: true }
);

module.exports = couponSchema;
