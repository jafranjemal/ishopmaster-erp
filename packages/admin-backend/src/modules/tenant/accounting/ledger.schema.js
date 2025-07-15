const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, index: true }, // To group debits/credits for one transaction
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    debitAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    creditAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    /**
     * The specific business entity (e.g., Branch) this transaction belongs to.
     * Essential for multi-entity consolidation.
     */
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch", // Assuming Branch is our primary entity type
      default: null,
      index: true,
    },

    /**
     * The specific cost center (e.g., Department) this transaction is allocated to.
     * Essential for departmental P&L reporting.
     */
    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },

    /**
     * Tag for the accounting standard applied, for multi-standard reporting (e.g., IFRS vs. local GAAP).
     */
    accountingStandard: {
      type: String,
      enum: ["IFRS", "GAAP", "LOCAL"], // Example standards
      default: "LOCAL",
    },

    amount: { type: Number, required: true, min: 0 },
    originalAmount: { type: Number, required: true, min: 0 },
    originalCurrency: { type: String, required: true },
    // Optional reference to the source of the transaction
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      default: null,
    },
    refs: {
      salesInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" },
      purchaseInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierInvoice" },
      paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    },
  },
  { timestamps: true }
);

module.exports = ledgerEntrySchema;
