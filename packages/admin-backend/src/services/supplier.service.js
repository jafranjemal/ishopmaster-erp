const accountingService = require("./accounting.service");

/**
 * The SupplierService handles all complex business logic related to suppliers,
 * particularly operations that require coordination with the AccountingService.
 */
class SupplierService {
  /**
   * Creates a new supplier AND their corresponding Accounts Payable sub-account
   * within a single database transaction.
   * @param {object} models - The tenant's compiled models (Supplier, Account).
   * @param {object} supplierData - The data for the new supplier (name, phone, etc.).
   * @param {mongoose.ClientSession} session - The Mongoose session for the database transaction.
   * @returns {Promise<object>} The newly created supplier document.
   */
  async createSupplierWithLedger(models, supplierData, session) {
    // 1. First, create the dedicated Accounts Payable sub-account for this supplier.
    const ledgerAccount = await accountingService.createAccount(
      models,
      {
        name: `AP - ${supplierData.name}`, // e.g., "AP - Global Parts Inc."
        type: "Liability",
        subType: "Accounts Payable",
        description: `Accounts Payable ledger for supplier: ${supplierData.name}`,
        isSystemAccount: true, // Mark as a system-generated account that shouldn't be deleted manually.
      },
      session
    );

    // 2. Prepare the supplier document, linking it to its new ledger account.
    const supplierToCreate = {
      ...supplierData,
      ledgerAccountId: ledgerAccount._id,
    };

    // 3. Create the supplier document itself within the transaction.
    const newSuppliers = await models.Supplier.create([supplierToCreate], {
      session,
    });

    // 4. Return the newly created supplier document.
    return newSuppliers[0];
  }
}

// Export a singleton instance for consistent use across the application.
module.exports = new SupplierService();
