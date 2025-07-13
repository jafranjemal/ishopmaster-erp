const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    conditions: {
      appliesTo: {
        type: String,
        required: true,
        enum: ["all_products", "specific_categories", "specific_products"],
        default: "all_products",
      },
      items: [
        {
          type: mongoose.Schema.Types.ObjectId,
          // This ref can be dynamic in a more advanced system, but for now we'll handle it in the service
        },
      ],
    },

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
