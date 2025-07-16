const mongoose = require("mongoose");

/**
 * Defines a category for tax purposes, allowing different tax rules
 * to apply to different types of products.
 * e.g., "Standard Rate", "Zero-Rated", "Luxury Goods"
 */
const taxCategorySchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = taxCategorySchema;
