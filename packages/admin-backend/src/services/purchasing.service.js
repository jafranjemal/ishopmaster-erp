const inventoryService = require("./inventory.service");
const accountingService = require("./accounting.service");

/**
 * The PurchasingService handles all complex business logic related to
 * purchase orders and receiving goods.
 */
class PurchasingService {
  /**
   * Creates a new Purchase Order after calculating totals.
   * @param {object} models - The tenant's compiled models.
   * @param {object} poData - Data for the new PO from the controller.
   * @param {string} userId - The ID of the user creating the PO.
   */
  async createPurchaseOrder(models, poData, userId) {
    const { PurchaseOrder } = models;
    const { items, ...rest } = poData;

    let subTotal = 0;
    const processedItems = items.map((item) => {
      const totalCost = item.quantityOrdered * item.costPrice;
      subTotal += totalCost;
      return { ...item, totalCost };
    });

    const totalAmount =
      subTotal + (poData.taxes || 0) + (poData.shippingCosts || 0);

    const newPO = await PurchaseOrder.create({
      ...rest,
      items: processedItems,
      subTotal,
      totalAmount,
      createdBy: userId,
    });

    return newPO;
  }

  /**
   * Receives goods from a PO, updating inventory and accounting records.
   * This entire method MUST be called from within a database transaction in the controller.
   * @param {object} models - The tenant's compiled models.
   * @param {string} poId - The ID of the Purchase Order.
   * @param {Array<object>} receivedItems - An array of items received.
   * @param {string} userId - The ID of the user receiving the goods.
   * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
   */
  async receiveGoodsFromPO(models, { poId, receivedItems, userId }, session) {
    const { PurchaseOrder, Supplier, Account } = models;

    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new Error("Purchase Order not found.");
    if (["fully_received", "cancelled"].includes(po.status)) {
      throw new Error(`Purchase Order is already ${po.status}.`);
    }

    const supplier = await Supplier.findById(po.supplierId).session(session);
    if (!supplier) throw new Error("Supplier not found.");

    const inventoryAssetAccount = await Account.findOne({
      isSystemAccount: true,
      name: "Inventory Asset",
      subType: "Current Asset",
    }).session(session);

    if (!inventoryAssetAccount)
      throw new Error("Inventory Asset account not found.");

    let totalReceivedValue = 0;

    // 1. Update Inventory for each received item
    for (const item of receivedItems) {
      const poItem = po.items.find(
        (p) => p.productVariantId.toString() === item.productVariantId
      );
      if (!poItem)
        throw new Error(`Item ${item.productVariantId} not found in this PO.`);

      // Pass all required data to the inventory service
      await inventoryService.increaseStock(
        models,
        {
          productVariantId: item.productVariantId,
          branchId: po.destinationBranchId,
          quantity: item.quantityReceived,
          costPriceInBaseCurrency: poItem.costPrice,
          supplierId: po.supplierId,
          purchaseId: po._id,
          serials: item.serials, // Array of serial numbers for serialized items
          userId,
        },
        session
      );

      poItem.quantityReceived += item.quantityReceived;
      totalReceivedValue += item.quantityReceived * poItem.costPrice;
    }

    // 2. Post the transaction to the accounting ledger
    if (totalReceivedValue > 0) {
      await accountingService.createJournalEntry(
        models,
        {
          description: `Received goods for PO #${po.poNumber}`,
          entries: [
            { accountId: inventoryAssetAccount._id, debit: totalReceivedValue },
            { accountId: supplier.ledgerAccountId, credit: totalReceivedValue },
          ],
          currency: "LKR", // This would come from tenant settings
          exchangeRateToBase: 1,
          refs: { purchaseId: po._id },
        },
        session
      );
    }

    // 3. Update the PO status
    const allItemsReceived = po.items.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    );
    po.status = allItemsReceived ? "fully_received" : "partially_received";

    await po.save({ session });

    return po;
  }
}

module.exports = new PurchasingService();
