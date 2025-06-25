const mongoose = require("mongoose");

/**
 * Defines a detailed record for a single cheque transaction, tracking its lifecycle.
 */
const chequeSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    chequeNumber: {
      type: String,
      required: [true, "Cheque number is required."],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required."],
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    chequeDate: {
      // The date written on the cheque
      type: Date,
      required: true,
    },
    clearingDate: {
      // The date the cheque actually cleared or bounced
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending_clearance", "cleared", "bounced", "cancelled"],
      default: "pending_clearance",
    },
    direction: {
      type: String,
      required: true,
      enum: ["inflow", "outflow"], // Inflow = from customer, Outflow = to supplier
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = chequeSchema;
