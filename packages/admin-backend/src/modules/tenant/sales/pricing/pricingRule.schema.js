const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },

    // --- Conditions (who gets the discount) ---
    customerGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerGroup" }, // Future model
    productCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    // --- Action (what is the discount) ---
    discount: {
      type: { type: String, required: true, enum: ["percentage", "fixed"] },
      value: { type: Number, required: true },
    },

    // The order in which rules are applied
    priority: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = pricingRuleSchema;
