const mongoose = require("mongoose");

/**
 * The ProductVariants represents a specific, sellable, stockable item.
 * e.g., "iPhone 15 Pro, 256GB, Natural Titanium". This is the item with a price and SKU.
 */
const productVariantSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductTemplates",
      required: true,
      index: true,
    },
    // For service-type products, these fields link them to specific models and repairs.
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },
    repairTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairType",
      default: null,
    },

    // The full, generated name for display purposes, e.g., "iPhone 15 Pro - 256GB - Blue"
    variantName: { type: String, required: true },

    // The unique Stock Keeping Unit for this specific variant.
    sku: { type: String, required: true, unique: true, sparse: true },

    // Financials specific to this variant, which can override template defaults.
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },

    // A map of the specific attribute values that define this variant.
    // e.g., { "Color": "Natural Titanium", "Storage": "256GB" }
    attributes: {
      type: Map,
      of: String,
    },
    alertQty: {
      type: Number,
      default: 5,
    },

    // Variant-specific images that override the template's images.
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = productVariantSchema;
