const mongoose = require("mongoose");

/**
 * Defines a single line item within a Sales Invoice.
 */
const saleItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discount: {
      type: { type: String, enum: ["percentage", "fixed"] },
      value: { type: Number },
    },
    finalPrice: { type: Number, required: true },
    costPriceInBaseCurrency: { type: Number, required: true },
    inventoryLotId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryLot" },
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
  },
  { _id: false }
);

/**
 * Defines the main Sales Invoice document, now upgraded for advanced workflows.
 */
const salesInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    // --- UPGRADED STATUS ENUM ---
    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "on_hold",
        "quotation",
        "completed",
        "partially_refunded",
        "fully_refunded",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    // --- NEW FIELDS FOR ADVANCED WORKFLOWS ---
    type: {
      type: String,
      required: true,
      enum: ["direct_sale", "quotation_sale"],
      default: "direct_sale",
    },
    expiryDate: {
      // Primarily for quotations
      type: Date,
    },
    holdReason: {
      // For putting sales on hold
      type: String,
      trim: true,
    },
    // --- END OF NEW FIELDS ---

    items: [saleItemSchema],

    // Financial Totals
    subTotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Link to payments
    amountPaid: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["unpaid", "partially_paid", "paid"], default: "unpaid" },

    notes: { type: String, trim: true },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly Invoice Number.
salesInvoiceSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastInvoice = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1]);
    }
    this.invoiceNumber = "INV-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = salesInvoiceSchema;
