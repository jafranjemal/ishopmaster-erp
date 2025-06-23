const mongoose = require("mongoose");

/**
 * Defines a single line item within a Purchase Order.
 */
const poItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    description: {
      // For display on printed POs, copied from variant
      type: String,
      required: true,
    },
    quantityOrdered: {
      type: Number,
      required: true,
      min: 1,
    },
    quantityReceived: {
      type: Number,
      default: 0,
    },
    // The cost per item AT THE TIME OF ORDER, in the transaction currency.
    costPrice: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Defines the main Purchase Order document.
 */
const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      // A user-friendly, sequential PO number
      type: String,
      required: true,
      unique: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    destinationBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "ordered",
        "partially_received",
        "fully_received",
        "cancelled",
      ],
      default: "draft",
    },
    items: [poItemSchema],

    // Financials
    subTotal: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    shippingCosts: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Multi-Currency Fields
    transactionCurrency: { type: String, required: true }, // e.g., 'USD'
    exchangeRateToBase: { type: Number, required: true }, // e.g., 350.25

    notes: { type: String, trim: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly PO number.
purchaseOrderSchema.pre("validate", async function (next) {
  if (this.isNew) {
    // `this.constructor` refers to the Mongoose model itself
    const lastPO = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastPO && lastPO.poNumber) {
      lastNumber = parseInt(lastPO.poNumber.split("-")[1]);
    }
    this.poNumber = "PO-" + String(lastNumber + 1).padStart(6, "0");
  }
  next();
});

module.exports = purchaseOrderSchema;
