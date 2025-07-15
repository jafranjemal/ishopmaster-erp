const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const refundVoucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: () => `CREDIT-${uuidv4().split("-")[0].toUpperCase()}`,
    },
    initialAmount: { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    issuedOnRmaId: { type: mongoose.Schema.Types.ObjectId, ref: "RMA" },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = refundVoucherSchema;
