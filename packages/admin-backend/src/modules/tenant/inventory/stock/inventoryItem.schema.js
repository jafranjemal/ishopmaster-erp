const mongoose = require("mongoose");

/**
 * Represents a single, unique, serialized item in inventory.
 * e.g., a specific phone with a unique IMEI.
 */
const inventoryItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true, // Every serialized item must have a unique serial number across the entire tenant DB.
      trim: true,
      uppercase: true,
      sparse: true, // Allows multiple documents to have a null value, but enforces uniqueness for non-null values.
    },
    status: {
      type: String,
      required: true,
      enum: ["in_stock", "sold", "damaged", "in_transit", "returned"],
      default: "in_stock",
    },
    // The exact historical cost of this specific unit.
    costPriceInBaseCurrency: {
      type: Number,
      required: true,
    },
    // Optional: A specific price tag for this individual item, overriding the variant's default.
    overrideSellingPrice: {
      type: Number,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = inventoryItemSchema;
