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
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // A null parent means it's a top-level category
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // A null parent means it's a top-level (root) category
      index: true,
    },
    // For consistency with my previous Miller Column response.
    linkedBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    linkedRepairTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: "RepairType" }],
  },
  { timestamps: true }
);

module.exports = categorySchema;
