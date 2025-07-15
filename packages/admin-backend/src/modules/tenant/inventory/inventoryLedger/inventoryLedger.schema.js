const mongoose = require("mongoose");

const inventoryLedgerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "purchase_receive",
        "sale",
        "return",
        "adjustment_in",
        "adjustment_out",
        "transfer_out",
        "transfer_in",
      ],
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
      index: true,
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },

    // Links to the specific item or lot affected
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", default: null },
    inventoryLotId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryLot", default: null },

    quantityChange: { type: Number, required: true }, // Positive for inflow, negative for outflow

    costPriceInBaseCurrency: { type: Number },

    // Polymorphic reference to the source document (the "why")
    salesInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice", default: null },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null },
    rmaId: { type: mongoose.Schema.Types.ObjectId, ref: "RMA", default: null },

    notes: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The user who triggered the action
  },
  { timestamps: true }
);

module.exports = inventoryLedgerSchema;
