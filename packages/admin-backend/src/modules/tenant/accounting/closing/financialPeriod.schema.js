const mongoose = require("mongoose");

/**
 * Defines a single financial period (e.g., a month) and its status.
 */
const financialPeriodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "July 2025"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Closed", "Archived"],
      default: "Open",
    },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = financialPeriodSchema;
