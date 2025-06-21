const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
    },
    subType: {
      // For more granular classification
      type: String,
      trim: true,
      default: "Uncategorized",
    },
    // The `balance` is not stored here; it will be calculated on the fly from the ledger
    // for real-time accuracy. We can add it later for caching if needed.
    isSystemAccount: { type: Boolean, default: false }, // To protect default accounts
  },
  { timestamps: true }
);

module.exports = accountSchema;
