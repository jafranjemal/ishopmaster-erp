const mongoose = require("mongoose");

/**
 * Defines a single line item within a Sales Invoice.
 * This is the core record for profit calculation.
 */
const saleItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    description: { type: String, required: true }, // Denormalized for historical accuracy
    quantity: { type: Number, required: true, min: 1 },

    // Pricing at the moment of sale
    unitPrice: { type: Number, required: true }, // The "sticker price" before discounts
    discount: {
      type: { type: String, enum: ["percentage", "fixed"] },
      value: { type: Number },
    },
    finalPrice: { type: Number, required: true }, // The final price for this line item after discounts

    // Costing for profitability reporting
    costPriceInBaseCurrency: { type: Number, required: true },

    // Audit trail link back to the physical stock
    inventoryLotId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryLot" },
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
  },
  { _id: false }
);

/**
 * Defines the main Sales Invoice document.
 */
const salesInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    status: {
      type: String,
      required: true,
      enum: ["draft", "completed", "partially_refunded", "fully_refunded", "cancelled"],
      default: "completed",
    },
    items: [saleItemSchema],

    // Financial Totals
    subTotal: { type: Number, required: true }, // Sum of (unitPrice * quantity)
    totalDiscount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // Final amount charged

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
