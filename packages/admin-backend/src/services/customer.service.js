const accountingService = require("./accounting.service");

/**
 * The CustomerService handles all complex business logic related to customers,
 * particularly operations that require coordination with other services like Accounting.
 */
class CustomerService {
  /**
   * Creates a new customer AND their corresponding Accounts Receivable sub-account
   * within a single database transaction. This ensures financial integrity from the start.
   * @param {object} models - The tenant's compiled models (Customer, Account).
   * @param {object} customerData - The data for the new customer (name, phone, email, etc.).
   * @param {mongoose.ClientSession} session - The Mongoose session for the database transaction.
   * @returns {Promise<object>} The newly created customer document.
   */
  async createCustomerWithLedger(models, customerData, session) {
    // 1. First, create the dedicated Accounts Receivable sub-account for this customer.
    // This call is delegated to the AccountingService, following our architecture rules.
    const ledgerAccount = await accountingService.createAccount(
      models,
      {
        name: `AR - ${customerData.name}`, // e.g., "AR - John Doe"
        type: "Asset",
        subType: "Accounts Receivable",
        description: `Accounts Receivable ledger for customer: ${customerData.name}`,
        isSystemAccount: true, // Mark this as a system-generated account
      },
      session
    );

    // 2. Prepare the customer document, embedding the ID of the ledger account we just created.
    const customerToCreate = {
      ...customerData,
      ledgerAccountId: ledgerAccount._id,
    };

    // 3. Create the customer document itself. Using create with a single-item array
    // is the required syntax when passing a session.
    const newCustomers = await models.Customer.create([customerToCreate], {
      session,
    });

    // 4. Return the newly created customer document.
    return newCustomers[0];
  }

  // In the future, other complex methods like `calculateCustomerLifetimeValue` could go here.
}

// Export a singleton instance to be used across the application.
module.exports = new CustomerService();
