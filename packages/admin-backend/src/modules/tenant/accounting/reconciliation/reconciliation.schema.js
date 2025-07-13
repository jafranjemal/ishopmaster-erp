const mongoose = require("mongoose");

const reconciliationSchema = new mongoose.Schema(
  {
    statementId: { type: mongoose.Schema.Types.ObjectId, ref: "BankStatement", required: true },
    statementLineId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ledgerEntryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "LedgerEntry" }],
    reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reconciliationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = reconciliationSchema;
