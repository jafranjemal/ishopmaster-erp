const inventoryService = require("../../../services/inventory.service");
const accountingService = require("../../../services/accounting.service");

/**
 * The SalesService handles all business logic for sales, invoices,
 * payments, and refunds. It coordinates with other services.
 */
class SalesService {
  /**
   * Finalizes a sale transaction.
   * @param {object} saleData - The details of the sale.
   */
  async finalizeSale(saleData) {
    // Step 1: Create the sale and payment records in the database.
    console.log("Creating sale record...");
    // const sale = await Sale.create(...);

    // Step 2: Call the InventoryService to update stock.
    // The SalesService does not know HOW stock is updated, it just calls the service.
    for (const item of saleData.items) {
      await inventoryService.decreaseStock(
        item.productId,
        item.quantity,
        saleData.branchId
      );
    }

    // Step 3: Call the AccountingService to record the financial transaction.
    // await accountingService.recordSale(sale);

    console.log("Sale finalized successfully.");
    return { success: true };
  }
}

module.exports = new SalesService();
