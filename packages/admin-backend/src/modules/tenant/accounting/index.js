const express = require("express");
const accountingRoutes = require("./accounting.routes");
const accountSchema = require("./account.schema");
const ledgerEntrySchema = require("./ledger.schema");
const reconciliationRoutes = require("./reconciliation/reconciliation.routes"); // <-- IMPORT
const bankStatementSchema = require("./reconciliation/bankStatement.schema");
const reconciliationSchema = require("./reconciliation/reconciliation.schema");
const closingRoutes = require("./closing/closing.routes");
const financialPeriodSchema = require("./closing/financialPeriod.schema");
const closingChecklistSchema = require("./closing/closingChecklist.schema");
const financialPeriodRoutes = require("./closing/financialPeriod.routes");
const mainRouter = express.Router();

mainRouter.use("/", accountingRoutes); // <-- MOUNT
mainRouter.use("/reconciliation", reconciliationRoutes); // <-- MOUNT
mainRouter.use("/closing", closingRoutes);
mainRouter.use("/periods", financialPeriodRoutes);
module.exports = {
  schemas: {
    Account: accountSchema,
    LedgerEntry: ledgerEntrySchema,
    BankStatement: bankStatementSchema,
    Reconciliation: reconciliationSchema,
    FinancialPeriod: financialPeriodSchema,
    ClosingChecklist: closingChecklistSchema,
  },
  router: mainRouter,
};
