const accountingRoutes = require("./accounting.routes");
const accountSchema = require("./account.schema");
const ledgerEntrySchema = require("./ledger.schema");
const reconciliationRoutes = require("./reconciliation/reconciliation.routes"); // <-- IMPORT
const express = require("express");
const bankStatementSchema = require("./reconciliation/bankStatement.schema");
const reconciliationSchema = require("./reconciliation/reconciliation.schema");
const mainRouter = express.Router();
mainRouter.use("/", accountingRoutes); // <-- MOUNT
mainRouter.use("/reconciliation", reconciliationRoutes); // <-- MOUNT

module.exports = {
  schemas: {
    Account: accountSchema,
    LedgerEntry: ledgerEntrySchema,
    BankStatement: bankStatementSchema,
    Reconciliation: reconciliationSchema,
  },
  router: mainRouter,
};
