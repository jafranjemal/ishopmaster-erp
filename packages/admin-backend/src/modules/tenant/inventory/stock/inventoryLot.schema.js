const mongoose = require("mongoose");

/**
 * Represents a batch or "lot" of a specific non-serialized ProductVariants
 * at a particular branch, purchased at a specific cost.
 */
const inventoryLotSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    quantityInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // The actual historical cost for items in this specific batch, in the tenant's base currency.
    costPriceInBaseCurrency: {
      type: Number,
      required: true,
    },
    // Optional: A specific selling price for THIS BATCH ONLY, which overrides the variant's default.
    sellingPriceInBaseCurrency: {
      type: Number,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    expiryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = inventoryLotSchema;
