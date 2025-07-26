const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["issue", "redeem"] },
    amount: { type: Number, required: true },
    salesInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" }, // Where it was redeemed
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

/**
 * Defines a Credit Note (Store Credit) issued to a customer.
 */
const creditNoteSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    initialAmount: { type: Number, required: true },
    currentBalance: { type: Number, required: true },

    status: {
      type: String,
      required: true,
      enum: ["active", "fully_redeemed", "expired"],
      default: "active",
    },

    expiryDate: { type: Date },
    originalRmaId: { type: mongoose.Schema.Types.ObjectId, ref: "RMA" },

    transactions: [transactionSchema],
  },
  { timestamps: true }
)

module.exports = creditNoteSchema
