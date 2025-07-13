const mongoose = require("mongoose");

/**
 * Defines a reusable warranty policy template.
 * e.g., "1-Year Manufacturer Warranty", "90-Day Service Warranty"
 */
const warrantyPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    durationValue: {
      type: Number,
      required: true,
    },
    durationUnit: {
      type: String,
      required: true,
      enum: ["days", "months", "years"],
    },
    // We can add fields for terms & conditions text here later
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = warrantyPolicySchema;
