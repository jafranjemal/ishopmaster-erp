const mongoose = require("mongoose");

/**
 * The ProductTemplates represents the abstract concept of a product family.
 * e.g., "iPhone 15 Pro", "Anker PowerCore 10000 Battery".
 * It holds all information common to all its variations.
 */
const productTemplateSchema = new mongoose.Schema(
  {
    baseName: {
      // The common name, e.g., "iPhone 15 Pro"
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },

    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // The set of attributes that defines this product's variations (e.g., "Smartphone Specs")
    attributeSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeSet",
    },
    alertQty: {
      type: Number,
      default: 5,
    },

    // Defines which other products this product is compatible with.
    // Used for accessories and spare parts.
    compatibility: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ProductTemplates" },
    ],

    // General marketing images for the product family.
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
      },
    ],
    // Financials specific to this variant, which can override template defaults.
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    // Defines the type for all variants that will be created from this template.
    type: {
      type: String,
      required: true,
      enum: ["serialized", "non-serialized", "service", "bundle"],
    },

    // Default SKU prefix for auto-generating variant SKUs
    skuPrefix: { type: String, trim: true, uppercase: true },

    // Accounting links that apply to all variants by default
    assetAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    revenueAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    cogsAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = productTemplateSchema;
