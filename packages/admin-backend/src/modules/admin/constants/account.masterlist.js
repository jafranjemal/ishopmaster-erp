/**
 * The definitive default Chart of Accounts for a new tenant.
 * This is the single source of truth for system-created accounts,
 * structured for professional financial reporting, including a 3-way match procurement process.
 */
const DEFAULT_ACCOUNTS_LIST = [
  //======================================================================
  // ASSETS (What the Business Owns) - Codes 1000-1999
  //======================================================================
  // --- Current Assets (Liquid assets, expected to be used within one year) ---
  {
    name: "Cash In Hand",
    code: "1100",
    type: "Asset",
    subType: "Cash",
    isSystemAccount: true,
    description: "Physical cash held by the business (e.g., in a cash drawer).",
  },
  {
    name: "Bank Account",
    code: "1110",
    type: "Asset",
    subType: "Bank",
    isSystemAccount: true,
    description: "Funds held in the business's primary bank accounts.",
  },
  {
    name: "Accounts Receivable",
    code: "1200",
    type: "Asset",
    subType: "Current Asset",
    isSystemAccount: true,
    description:
      "Money owed to the business by its customers for goods or services sold on credit.",
  },
  {
    name: "Inventory Asset",
    code: "1300",
    type: "Asset",
    subType: "Current Asset",
    isSystemAccount: true,
    description: "The total value of all stock on hand, valued at its cost.",
  },
  {
    name: "Cheques in Hand",
    code: "1400",
    type: "Asset",
    subType: "Current Asset",
    isSystemAccount: true,
    description: "Tracks value of received cheques pending clearance.",
  },

  //======================================================================
  // LIABILITIES (What the Business Owes) - Codes 2000-2999
  //======================================================================
  // --- Current Liabilities (Debts due within one year) ---
  {
    name: "Accounts Payable",
    code: "2100",
    type: "Liability",
    subType: "Current Liability",
    isSystemAccount: true,
    description:
      "Money the business owes to its suppliers for approved and invoiced goods or services.",
  },
  {
    name: "Salaries Payable",
    code: "2300", // Use next available code in 2000-2999 range
    type: "Liability",
    subType: "Current Liability",
    isSystemAccount: true,
    description: "Tracks salaries owed to employees that are accrued but not yet paid.",
  },
  {
    name: "Cheques Payable",
    code: "2200",
    type: "Liability",
    subType: "Current Liability",
    isSystemAccount: true,
    description: "Tracks value of issued cheques pending clearance.",
  },

  {
    name: "Goods Received Not Invoiced (GRNI)",
    code: "2110",
    type: "Liability",
    subType: "Current Liability",
    isSystemAccount: true,
    description:
      "A temporary 'clearing' account holding the value of goods received but not yet invoiced by the supplier. Essential for 3-way matching.",
  },
  {
    name: "Sales Tax Payable",
    code: "2230",
    type: "Liability",
    subType: "Current Liability",
    isSystemAccount: true,
    description: "Taxes collected from sales that are owed to the government.",
  },

  //======================================================================
  // EQUITY (The Net Worth of the Business) - Codes 3000-3999
  //======================================================================
  {
    name: "Owner's Capital",
    code: "3100",
    type: "Equity",
    subType: "Capital",
    isSystemAccount: true,
    description: "Initial investment and subsequent capital contributions by the owner.",
  },
  {
    name: "Owner's Drawings",
    code: "3200",
    type: "Equity",
    subType: "Drawings",
    isSystemAccount: true,
    description: "Funds the owner withdraws from the business for personal use.",
  },
  {
    name: "Retained Earnings",
    code: "3900",
    type: "Equity",
    subType: "Retained Earnings",
    isSystemAccount: true,
    description:
      "The cumulative net income of the business over time, carried over from previous financial years.",
  },

  //======================================================================
  // REVENUE / INCOME (Where the Money Comes From) - Codes 4000-4999
  //======================================================================
  {
    name: "Sales Revenue",
    code: "4100",
    type: "Revenue",
    subType: "Sales",
    isSystemAccount: true,
    description:
      "Income generated from the primary business activity of selling physical products.",
  },
  {
    name: "Service Revenue",
    code: "4200",
    type: "Revenue",
    subType: "Service",
    isSystemAccount: true,
    description: "Income generated from providing repair and other services.",
  },
  {
    name: "Shipping & Handling Revenue",
    code: "4300",
    type: "Revenue",
    subType: "Other Income",
    isSystemAccount: true,
    description: "Income charged to customers for shipping and delivery fees.",
  },
  {
    name: "Sales Returns and Allowances",
    code: "4900",
    type: "Revenue",
    subType: "Contra Revenue",
    isSystemAccount: true,
    description: "A contra-revenue account to track returns from customers. Reduces total revenue.",
  },

  //======================================================================
  // EXPENSES (Where the Money Goes) - Codes 5000+
  //======================================================================
  // --- Cost of Goods Sold (Direct costs of products/services sold) ---
  {
    name: "Cost of Goods Sold",
    code: "5100",
    type: "Expense",
    subType: "COGS",
    isSystemAccount: true,
    description: "The direct cost of the inventory that was sold.",
  },
  {
    name: "Purchase Price Variance",
    code: "5200",
    type: "Expense",
    subType: "COGS",
    isSystemAccount: true,
    description:
      "Tracks the financial difference between the PO cost and the final supplier invoice cost.",
  },
  // --- Operating Expenses (The costs of running the business) ---
  {
    name: "Salaries Expense",
    code: "6100",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
    description: "Payments to all employees, including salaries, commissions, and benefits.",
  },
  {
    name: "Rent Expense",
    code: "6200",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
    description: "Rent for the shop or office space.",
  },
  {
    name: "Utilities Expense",
    code: "6300",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
    description: "Electricity, water, and internet bills for the business.",
  },
  {
    name: "Marketing & Advertising",
    code: "6400",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
    description: "Costs for promoting the business (e.g., social media ads, flyers).",
  },
  {
    name: "Bank Fees & Charges",
    code: "6500",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
    description: "Monthly fees, transaction fees, and other charges from the bank.",
  },
  {
    name: "Repairs & Maintenance",
    code: "6600",
    type: "Expense",
    subType: "Operating Expense",
    isSystemAccount: true,
    description: "Costs for maintaining shop equipment and fixtures (not for customer repairs).",
  },
];

module.exports = DEFAULT_ACCOUNTS_LIST;
