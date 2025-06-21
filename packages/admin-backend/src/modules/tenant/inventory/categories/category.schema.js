const mongoose = require("mongoose");

/**
 * Defines the schema for a product Category (e.g., Smartphones, Laptops, Accessories).
 * This supports nested categories for a hierarchical structure.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // This field allows for creating a hierarchy, e.g., "Cases" is a child of "Accessories".
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = categorySchema;
