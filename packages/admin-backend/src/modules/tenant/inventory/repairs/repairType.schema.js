const mongoose = require("mongoose");

/**
 * Defines a standard type of repair service offered by the business.
 * e.g., "Screen Replacement", "Battery Replacement", "Water Damage Treatment"
 */
const repairTypeSchema = new mongoose.Schema(
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
    // The default price for this service, before any specific parts are added.
    defaultPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = repairTypeSchema;
