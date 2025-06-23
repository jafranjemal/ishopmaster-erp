const mongoose = require("mongoose");

/**
 * Defines an immutable record of a single movement of stock.
 * This creates a full audit trail for every item.
 */
const stockMovementSchema = new mongoose.Schema(
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

    // For serialized items, this will be the specific item's ID
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      default: null,
    },
    // For non-serialized items, this will be the lot's ID
    inventoryLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryLot",
      default: null,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "purchase_receive",
        "sale",
        "return_in",
        "return_out",
        "adjustment_in",
        "adjustment_out",
        "transfer_out",
        "transfer_in",
      ],
    },
    // Can be positive (for additions) or negative (for deductions)
    quantityChange: { type: Number, required: true },

    costPriceInBaseCurrency: { type: Number, required: true },
    notes: { type: String, trim: true },

    // The user who initiated this stock movement
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // References to the source operation for easy auditing
    relatedSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },
    relatedPurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      default: null,
    },
    relatedTransferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockTransfer",
      default: null,
    }, // for a future model
  },
  { timestamps: true }
);

module.exports = stockMovementSchema;
