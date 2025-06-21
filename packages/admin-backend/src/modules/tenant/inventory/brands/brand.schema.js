const mongoose = require("mongoose");

/**
 * Defines the schema for a Brand (e.g., Apple, Samsung, Anker).
 * This allows products to be categorized and filtered by their manufacturer.
 */
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required."],
      unique: true, // Each brand name must be unique within a tenant's database.
      trim: true,
    },
    // In a future version, we could add a logo URL or description here.
    // For now, a simple name is sufficient.
  },
  { timestamps: true }
);

module.exports = brandSchema;
