const accountingRoutes = require("./accounting.routes");
const accountSchema = require("./account.schema");
const ledgerEntrySchema = require("./ledger.schema");

module.exports = {
  schemas: {
    Account: accountSchema,
    LedgerEntry: ledgerEntrySchema,
  },
  router: accountingRoutes,
};
