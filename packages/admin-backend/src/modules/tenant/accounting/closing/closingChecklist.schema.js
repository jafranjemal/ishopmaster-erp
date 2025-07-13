const mongoose = require("mongoose");

/**
 * Defines a checklist item for the period-closing process.
 */
const checklistItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
  },
  { _id: false }
);

/**
 * Defines the full checklist for a specific financial period.
 */
const closingChecklistSchema = new mongoose.Schema(
  {
    periodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialPeriod",
      required: true,
      unique: true,
    },
    items: [checklistItemSchema],
  },
  { timestamps: true }
);

module.exports = closingChecklistSchema;
