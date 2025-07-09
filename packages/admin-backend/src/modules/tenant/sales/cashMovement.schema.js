const mongoose = require("mongoose");

/**
 * Defines a single, auditable record of cash moving in or out of a till
 * for a reason other than a direct sale or refund.
 */
const cashMovementSchema = new mongoose.Schema(
  {
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftSummary",
      required: true,
      index: true,
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      required: true,
      enum: ["paid_in", "paid_out"], // 'paid_in' for adding cash, 'paid_out' for removing
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = cashMovementSchema;
