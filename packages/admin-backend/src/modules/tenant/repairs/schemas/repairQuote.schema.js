const mongoose = require("mongoose");

const jobSheetItemSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, enum: ["part", "service", "labor"] },
    productVariantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }, // Price at the time of adding
    costPrice: { type: Number, required: true }, // Cost at the time of adding
  },
  { _id: false }
);

/**
 * Defines a formal, version-controlled quotation for a repair job.
 */
const repairQuoteSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, required: true, unique: true, index: true },
    repairTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairTicket",
      required: true,
      index: true,
    },
    version: { type: Number, required: true, default: 1 },

    lineItems: [jobSheetItemSchema], // The specific parts and labor being quoted

    totalPartsCost: { type: Number, required: true, default: 0 },
    totalPartsMarkup: { type: Number, required: true, default: 0 },
    totalLaborPrice: { type: Number, required: true, default: 0 },
    troubleshootFee: { type: Number, required: true, default: 0 },
    subTotal: { type: Number, required: true },
    totalGlobalDiscount: { type: Number, required: true, default: 0 },
    totalTax: { type: Number, required: true, default: 0 },
    taxBreakdown: [
      {
        ruleName: String,
        rate: Number,
        amount: Number,
        linkedAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      },
    ],
    grandTotal: { type: Number, required: true },

    termsAndConditions: { type: String, trim: true },
    expiryDate: { type: Date, required: true },

    status: {
      type: String,
      required: true,
      enum: ["draft", "pending_approval", "approved", "declined", "superseded"],
      default: "draft",
    },

    customerSignature: { type: String }, // Base64 data URI
    approvedAt: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = repairQuoteSchema;
