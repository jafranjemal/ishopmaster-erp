const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["percentage", "fixed"] },
    value: { type: Number, required: true },
    reason: { type: String, trim: true },
  },
  { _id: false }
);

const chargeSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

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
    lineDiscount: { type: discountSchema, default: null },
    finalPrice: { type: Number, required: true },
    // This is required only on a 'completed' invoice, not a draft.
    // The validation is handled in the SalesService before finalization.
    costPriceInBaseCurrency: { type: Number },

    // --- NEW TRACEABILITY FIELDS ---
    // These fields create a permanent, human-readable audit trail on the invoice itself.
    serialNumber: {
      type: String,
      default: null,
      index: true, // Indexed for quick lookups of sales by serial number
    },
    batchNumber: {
      type: String,
      default: null,
      index: true,
    },
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
    // invoiceId: { type: String, required: true, unique: true },
    invoiceId: { type: String, unique: true, sparse: true },
    quotationId: { type: String, unique: true, sparse: true },
    draftId: { type: String, unique: true, sparse: true },

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

    globalDiscount: { type: discountSchema, default: null },
    additionalCharges: [chargeSchema],

    // Financial Totals
    subTotal: { type: Number, required: true },
    totalLineDiscount: { type: Number, default: 0 },
    totalGlobalDiscount: { type: Number, default: 0 },
    totalCharges: { type: Number, default: 0 },
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
  // Only generate IDs for new documents to prevent changes on update.
  if (this.isNew) {
    // A helper function to generate the next sequential ID for a given prefix.
    const generateNextId = async (prefix, fieldName) => {
      const lastDoc = await this.constructor
        .findOne({ [fieldName]: { $ne: null } })
        .sort({ createdAt: -1 });
      const lastNumber =
        lastDoc && lastDoc[fieldName] ? parseInt(lastDoc[fieldName].split("-")[1]) : 0;
      return `${prefix}-${String(lastNumber + 1).padStart(7, "0")}`;
    };

    // Generate the correct ID based on the document's status.
    if (this.status === "completed" && !this.invoiceId) {
      this.invoiceId = await generateNextId("INV", "invoiceId");
    } else if (this.status === "quotation" && !this.quotationId) {
      this.quotationId = await generateNextId("QT", "quotationId");
    } else if (["draft", "on_hold"].includes(this.status) && !this.draftId) {
      this.draftId = `DRAFT-${Date.now()}`;
    }
  }
  next();
});
module.exports = salesInvoiceSchema;
