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
      // For display on printed POs
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
    // The cost per item AT THE TIME OF ORDER. This is critical.
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
    subTotal: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    shippingCosts: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: { type: String, trim: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// In a real system, a more robust sequential number generation would be used.
// For now, this pre-save hook provides a simple implementation.
purchaseOrderSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastPO = await this.constructor.findOne().sort("-createdAt");
    const lastNumber = lastPO ? parseInt(lastPO.poNumber.split("-")[1]) : 0;
    this.poNumber = "PO-" + String(lastNumber + 1).padStart(5, "0");
  }
  next();
});

module.exports = purchaseOrderSchema;
