/**
 * Master list of common Payment Methods to be seeded for new tenants.
 * The `type` determines the accounting behavior.
 * The `linkedAccountName` and `holdingAccountName` are used during the seeding
 * process to find the correct, newly created account IDs for that tenant.
 */
const PAYMENT_METHODS = [
  {
    name: "Main Cash Drawer",
    type: "cash",
    linkedAccountName: "Cash In Hand", // Links to this Asset account
    holdingAccountName: null,
  },
  {
    name: "Credit/Debit Card Terminal",
    type: "card",
    linkedAccountName: "Bank Account", // Card payments deposit here
    holdingAccountName: null,
  },
  {
    name: "Main Bank Transfer",
    type: "bank_transfer",
    linkedAccountName: "Bank Account", // Bank transfers deposit here
    holdingAccountName: null,
  },
  {
    name: "Cheques Received (Inflow)",
    type: "cheque",
    linkedAccountName: "Bank Account", // The final destination when cleared
    holdingAccountName: "Cheques in Hand", // The temporary holding account
  },
  {
    name: "Cheques Issued (Outflow)",
    type: "cheque",
    linkedAccountName: "Bank Account", // The source of funds when cleared
    holdingAccountName: "Cheques Payable", // The temporary liability account
  },
  {
    name: "Loyalty Points Redemption",
    type: "loyalty_points",
    // This type doesn't directly map to a cash/bank asset account.
    // Its accounting logic is special and handled by the PaymentsService.
    // We can link it to an expense account for tracking.
    linkedAccountName: "Sales Revenue", // Placeholder, logic is handled in service
    holdingAccountName: null,
  },
];

module.exports = PAYMENT_METHODS;
