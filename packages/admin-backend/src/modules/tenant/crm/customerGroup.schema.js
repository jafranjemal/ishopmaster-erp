const mongoose = require("mongoose");

/**
 * Defines a group or segment for customers, which can be used for
 * targeted pricing, marketing, and reporting.
 * e.g., "VIP Clients", "Wholesale Partners"
 */
const customerGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required."],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    defaultDiscount: {
      type: Number,
      default: 0,
    },
    // We can add fields for default discounts here in the future
  },
  { timestamps: true }
);

module.exports = customerGroupSchema;
