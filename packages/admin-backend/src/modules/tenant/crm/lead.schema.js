const mongoose = require("mongoose");

/**
 * Defines a Lead - an unqualified prospect at the top of the sales funnel.
 */
const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: { type: String, trim: true }, // e.g., 'Website', 'Referral', 'Walk-in'
    status: {
      type: String,
      required: true,
      enum: ["new", "contacted", "qualified", "unqualified"],
      default: "new",
    },
    notes: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = leadSchema;
