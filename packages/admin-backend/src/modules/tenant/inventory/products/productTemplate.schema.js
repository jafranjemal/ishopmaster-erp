const mongoose = require("mongoose");

/**
 * The ProductTemplates represents the abstract concept of a product family.
 * e.g., "iPhone 15 Pro", "Anker PowerCore 10000 Battery".
 * It holds all information common to all its variations.
 */

// --- NEW SUB-SCHEMA FOR BUNDLE ITEMS ---
const bundleItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const productTemplateSchema = new mongoose.Schema(
  {
    baseName: {
      // The common name, e.g., "iPhone 15 Pro"
      type: String,
      required: true,
      trim: true,
      set: (value) => value?.toUpperCase(),
    },
    description: { type: String, trim: true },
    bundleItems: [bundleItemSchema],
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
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
    compatibility: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductTemplates" }],

    // General marketing images for the product family.
    images: [
      {
        url: { type: String, required: false },
        altText: { type: String },
        name: { type: String },
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

// Add a validator to ensure bundleItems only exists for bundle-type products
productTemplateSchema.pre("validate", function (next) {
  if (this.type !== "bundle" && this.bundleItems.length > 0) {
    this.bundleItems = []; // Clear bundle items if not a bundle type
  }
  if (this.type === "bundle" && this.bundleItems.length === 0) {
    // We will handle this validation more gracefully in the service/controller layer upon save
  }
  next();
});

module.exports = productTemplateSchema;
