const mongoose = require("mongoose");

/**
 * Defines a "template" or "batch" for generating a set of similar coupons.
 * e.g., "Welcome10 Campaign", "Summer Sale 2025"
 */
const couponBatchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "New Customer Welcome Offer"
    prefix: { type: String, required: true, trim: true, uppercase: true }, // e.g., "WELCOME10"
    discount: {
      type: { type: String, required: true, enum: ["percentage", "fixed_amount"] },
      value: { type: Number, required: true },
    },
    usageLimit: { type: Number, default: 1 }, // How many times a single coupon can be used
    validForDays: { type: Number }, // How many days the coupon is valid for after generation
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = couponBatchSchema;
