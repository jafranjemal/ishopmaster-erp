const mongoose = require("mongoose");

/**
 * Defines the summary record for a single cashier shift.
 * Tracks opening/closing cash and calculates variance.
 */
const shiftSummarySchema = new mongoose.Schema(
  {
    shiftId: {
      // A user-friendly, sequential ID
      type: String,
      required: true,
      unique: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    // The employeeId is now optional, for cases where a non-employee admin runs a session.
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed"],
      default: "open",
    },
    shift_start: {
      type: Date,
      default: Date.now,
    },
    shift_end: {
      type: Date,
    },

    // === Cash Reconciliation Fields ===
    // All values are in the tenant's base currency.

    // The starting cash amount, entered by the user.
    openingFloat: {
      type: Number,
      required: true,
    },

    // The total cash sales recorded by the system during the shift.
    calculatedCashIn: {
      type: Number,
      default: 0,
    },

    // The total cash refunds processed by the system during the shift.
    calculatedCashOut: {
      type: Number,
      default: 0,
    },

    // --- THE DEFINITIVE FIX: ADDED NEW FIELDS ---
    /**
     * The total cash added to the drawer for reasons other than sales (e.g., manager adding change).
     */
    calculatedPaidIn: {
      type: Number,
      default: 0,
    },

    /**
     * The total cash removed from the drawer for reasons other than refunds (e.g., petty cash for supplies).
     */
    calculatedPaidOut: {
      type: Number,
      default: 0,
    },
    // --- END OF FIX ---

    // The cash amount the system expects to be in the drawer at the end.
    // Calculated as: openingFloat + calculatedCashIn - calculatedCashOut
    expectedClosingFloat: {
      type: Number,
    },

    // The physical cash amount counted by the user at the end of the shift.
    closingFloat: {
      type: Number,
    },

    // The final difference between expected and actual cash.
    // Can be positive (overage) or negative (shortage).
    cashVariance: {
      type: Number,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly Shift ID.
shiftSummarySchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastShift = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastShift && lastShift.shiftId) {
      lastNumber = parseInt(lastShift.shiftId.split("-")[1]);
    }
    this.shiftId = "SHFT-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = shiftSummarySchema;
