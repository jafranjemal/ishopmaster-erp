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

// Intelligent pre-save hook to generate sequential IDs based on status
salesInvoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (this.status === "completed" && !this.invoiceId) {
      const lastDoc = await this.constructor
        .findOne({ invoiceId: { $ne: null } })
        .sort({ createdAt: -1 });
      const lastNumber =
        lastDoc && lastDoc.invoiceId ? parseInt(lastDoc.invoiceId.split("-")[1]) : 0;
      this.invoiceId = "INV-" + String(lastNumber + 1).padStart(7, "0");
    } else if (this.status === "quotation" && !this.quotationId) {
      const lastDoc = await this.constructor
        .findOne({ quotationId: { $ne: null } })
        .sort({ createdAt: -1 });
      const lastNumber =
        lastDoc && lastDoc.quotationId ? parseInt(lastDoc.quotationId.split("-")[1]) : 0;
      this.quotationId = "QT-" + String(lastNumber + 1).padStart(7, "0");
    } else if (["draft", "on_hold"].includes(this.status) && !this.draftId) {
      // Using a simpler, non-sequential ID for temporary drafts
      this.draftId = `DRAFT-${Date.now()}`;
    }
  }
  next();
});
module.exports = salesInvoiceSchema;
