/**
 * The default Chart of Accounts for a new tenant.
 * This is the single source of truth for system-created accounts.
 */
const DEFAULT_ACCOUNTS_LIST = [
  // Assets
  {
    name: "Cash In Hand",
    type: "Asset",
    subType: "Cash",
    isSystemAccount: true,
  },
  {
    name: "Bank Account",
    type: "Asset",
    subType: "Bank",
    isSystemAccount: true,
  },
  {
    name: "Accounts Receivable",
    type: "Asset",
    subType: "Current Asset",
    isSystemAccount: true,
  },
  {
    name: "Inventory Asset",
    type: "Asset",
    subType: "Current Asset",
    isSystemAccount: true,
  },

  // Liabilities
  {
    name: "Accounts Payable",
    type: "Liability",
    subType: "Current Liability",
    isSystemAccount: true,
  },

  // Revenue
  {
    name: "Sales Revenue",
    type: "Revenue",
    subType: "Sales",
    isSystemAccount: true,
  },
  {
    name: "Service Revenue",
    type: "Revenue",
    subType: "Service",
    isSystemAccount: true,
  },

  // Expenses
  {
    name: "Cost of Goods Sold",
    type: "Expense",
    subType: "COGS",
    isSystemAccount: true,
  },
  {
    name: "Salaries Expense",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
  },

  // Equity
  {
    name: "Owner's Equity",
    type: "Equity",
    subType: "Capital",
    isSystemAccount: true,
  },
];

module.exports = DEFAULT_ACCOUNTS_LIST;
