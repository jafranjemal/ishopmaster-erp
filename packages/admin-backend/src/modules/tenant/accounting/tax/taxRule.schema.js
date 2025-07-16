const mongoose = require("mongoose");

/**
 * Defines a configurable tax rule for sales and procurement.
 * e.g., "VAT 15%", "NBT 2%"
 */
const taxRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    rate: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ["percentage"], default: "percentage" },
    isCompound: { type: Boolean, default: false },
    priority: { type: Number, default: 10 },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    // --- THE DEFINITIVE FIX ---
    // The rule is now correctly linked to a TaxCategory, not a ProductCategory.
    taxCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaxCategory", // This is the correct reference
      default: null,
    },
    // --- END OF FIX ---
    // productCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    linkedAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = taxRuleSchema;
