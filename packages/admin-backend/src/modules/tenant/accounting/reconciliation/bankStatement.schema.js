const mongoose = require("mongoose");

const statementLineSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["debit", "credit"] },
    balance: { type: Number },
    status: { type: String, enum: ["unmatched", "matched"], default: "unmatched" },
  },
  { _id: true }
);

const bankStatementSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    statementDate: { type: Date, required: true },
    startingBalance: { type: Number, required: true },
    endingBalance: { type: Number, required: true },
    lines: [statementLineSchema],
    status: { type: String, enum: ["pending", "reconciled"], default: "pending" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = bankStatementSchema;
