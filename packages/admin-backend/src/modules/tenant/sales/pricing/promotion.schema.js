const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // --- Action (what is the discount) ---
    discount: {
      type: { type: String, required: true, enum: ["percentage", "fixed", "bogo"] }, // Buy One Get One
      value: { type: Number, required: true },
    },
    // We can add more complex conditions here later, e.g., applies to specific products
  },
  { timestamps: true }
);

module.exports = promotionSchema;
