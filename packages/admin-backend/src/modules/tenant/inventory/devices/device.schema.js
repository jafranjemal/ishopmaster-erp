const mongoose = require("mongoose");

/**
 * Defines a specific device model, which acts as a bridge between
 * a manufacturer (Brand) and a Category.
 * e.g., "iPhone 12", "MacBook Pro 14-inch M3"
 */
const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand", // Links to our existing Brand model
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // We can add other fields like release year, image, etc. later
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure a device name is unique per manufacturer
deviceSchema.index({ name: 1, brandId: 1 }, { unique: true });

module.exports = deviceSchema;
