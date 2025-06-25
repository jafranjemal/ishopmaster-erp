const mongoose = require("mongoose");

const paymentLineSchema = new mongoose.Schema(
  {
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    referenceNumber: { type: String, trim: true }, // For Cheque No., Card TXN ID, etc.
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    paymentSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    paymentSourceType: {
      type: String,
      required: true,
      enum: ["SalesInvoice", "SupplierInvoice", "ExpenseClaim"],
    },
    paymentDate: { type: Date, required: true, default: Date.now },
    totalAmount: { type: Number, required: true },
    paymentLines: [paymentLineSchema],
    direction: { type: String, required: true, enum: ["inflow", "outflow"] },
    status: {
      type: String,
      required: true,
      enum: ["completed", "voided", "pending_clearance"],
      default: "completed",
    },
    notes: { type: String, trim: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

paymentSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastPayment = await this.constructor
      .findOne()
      .sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastPayment && lastPayment.paymentId)
      lastNumber = parseInt(lastPayment.paymentId.split("-")[1]);
    this.paymentId = "PAY-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = paymentSchema;
