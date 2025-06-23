const mongoose = require("mongoose");

/**
 * Defines a currency that the tenant's business operates with.
 * e.g., { code: 'USD', name: 'US Dollar', symbol: '$' }
 */
const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Currency code is required (e.g., USD, LKR)."],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    name: {
      type: String,
      required: [true, "Currency name is required."],
      trim: true,
    },
    symbol: {
      type: String,
      required: [true, "Currency symbol is required."],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = currencySchema;
