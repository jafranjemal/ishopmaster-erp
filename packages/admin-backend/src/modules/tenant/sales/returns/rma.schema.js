const mongoose = require("mongoose");

const rmaSchema = new mongoose.Schema(
  {
    rmaNumber: { type: String, required: true, unique: true },
    originalInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
      required: true,
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    items: [
      {
        productVariantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariants" },
        quantityReturned: { type: Number, required: true },
        reason: { type: String },
        returnPrice: { type: Number, required: true },
      },
    ],
    totalRefundAmount: { type: Number, required: true },
    resolution: {
      type: { type: String, enum: ["cash_refund", "card_refund", "store_credit"] },
      paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
      voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "RefundVoucher" },
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

rmaSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastRma = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastRma && lastRma.rmaNumber) lastNumber = parseInt(lastRma.rmaNumber.split("-")[1]);
    this.rmaNumber = "RMA-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = rmaSchema;
