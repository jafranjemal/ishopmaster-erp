const mongoose = require("mongoose")

const returnedItemSchema = new mongoose.Schema(
  {
    productVariantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    // Price at the time of original sale, for accurate financial reversal
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
)

/**
 * Defines a Return Merchandise Authorization (RMA) document.
 * This is the master record for a customer return.
 */
const rmaSchema = new mongoose.Schema(
  {
    rmaNumber: { type: String, required: true, unique: true, index: true },
    originalSalesInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice", required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    items: [returnedItemSchema],

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },

    totalRefundAmount: { type: Number, required: true },

    // How the refund was processed
    refundMethod: {
      type: String,
      enum: ["cash", "card", "credit_note", "original_payment_method"],
    },
    refundPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    creditNoteId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditNote" },

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

rmaSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastRma = await this.constructor.findOne().sort({ createdAt: -1 })
    let lastNumber = 0
    if (lastRma && lastRma.rmaNumber) {
      lastNumber = parseInt(lastRma.rmaNumber.split("-")[1])
    }
    this.rmaNumber = "RMA-" + String(lastNumber + 1).padStart(6, "0")
  }
  next()
})

module.exports = rmaSchema
