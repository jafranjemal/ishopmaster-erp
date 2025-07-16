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
const budgetSchema = require("./budget/budget.schema");
const budgetRoutes = require("./budget/budget.routes");
const reportingRoutes = require("./reporting/reporting.routes");
const taxCategorySchema = require("./tax/taxCategory.schema");
const taxRuleRoutes = require("./tax/taxRule.routes");
const taxRuleSchema = require("./tax/taxRule.schema");
const taxCategoryRoutes = require("./tax/taxCategory.routes");

const mainRouter = express.Router();

mainRouter.use("/", accountingRoutes); // <-- MOUNT
mainRouter.use("/reconciliation", reconciliationRoutes); // <-- MOUNT
mainRouter.use("/closing", closingRoutes);
mainRouter.use("/periods", financialPeriodRoutes);
mainRouter.use("/budgets", budgetRoutes);
mainRouter.use("/reports", reportingRoutes);
mainRouter.use("/tax-rules", taxRuleRoutes);
mainRouter.use("/tax-categories", taxCategoryRoutes);
module.exports = {
  schemas: {
    Account: accountSchema,
    LedgerEntry: ledgerEntrySchema,
    BankStatement: bankStatementSchema,
    Reconciliation: reconciliationSchema,
    FinancialPeriod: financialPeriodSchema,
    ClosingChecklist: closingChecklistSchema,
    Budget: budgetSchema,
    TaxCategory: taxCategorySchema,
    TaxRule: taxRuleSchema,
  },
  router: mainRouter,
};
