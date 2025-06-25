const mongoose = require("mongoose");

/**
 * Defines a single line item within a Goods Receipt Note.
 * Captures the physical reality of what was received.
 */
const grnItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    quantityReceived: {
      type: Number,
      required: true,
      min: 1,
    },
    // For serialized items, this will be an array of scanned/entered serial numbers.
    // The length of this array must match quantityReceived for serialized products.
    receivedSerials: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
  },
  { _id: false }
);

/**
 * Defines the Goods Receipt Note (GRN) document.
 * This is the official record of a physical stock receipt against a Purchase Order.
 */
const goodsReceiptNoteSchema = new mongoose.Schema(
  {
    grnNumber: {
      // A user-friendly, sequential GRN number
      type: String,
      required: true,
      unique: true,
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      index: true,
    },
    supplierId: {
      // Denormalized for easier querying
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    branchId: {
      // Denormalized for easier querying
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending_invoice", "invoiced"],
      default: "pending_invoice",
    },
    items: [grnItemSchema],
    receivedDate: {
      type: Date,
      default: Date.now,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly GRN number.
goodsReceiptNoteSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastGRN = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastGRN && lastGRN.grnNumber) {
      lastNumber = parseInt(lastGRN.grnNumber.split("-")[1]);
    }
    this.grnNumber = "GRN-" + String(lastNumber + 1).padStart(6, "0");
  }
  next();
});

module.exports = goodsReceiptNoteSchema;
