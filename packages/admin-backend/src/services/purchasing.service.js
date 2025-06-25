const inventoryService = require("./inventory.service");
const accountingService = require("./accounting.service");
const exchangeRateService = require("./exchangeRate.service");

/**
 * The PurchasingService handles all complex business logic related to
 * purchase orders and receiving goods, coordinating with other services.
 */
class PurchasingService {
  /**
   * Creates a new Purchase Order after fetching exchange rates and calculating totals.
   * @param {object} models - The tenant's compiled models.
   * @param {object} poData - Data for the new PO from the controller.
   * @param {string} userId - The ID of the user creating the PO.
   * @param {string} baseCurrency - The tenant's base currency code.
   */
  async createPurchaseOrder(models, poData, userId, baseCurrency) {
    const { PurchaseOrder } = models;
    const { items, transactionCurrency, ...rest } = poData;
    console.log("Creating Purchase Order with data:", poData);
    console.log("transactionCurrency:", transactionCurrency);
    // 1. Get the exchange rate for the transaction date
    const exchangeRateToBase = await exchangeRateService.getRate(models, {
      fromCurrency: transactionCurrency,
      toCurrency: baseCurrency,
      date: poData.orderDate || new Date(),
    });

    // 2. Calculate totals based on the items array
    let subTotal = 0;
    const processedItems = items.map((item) => {
      const totalCost = (item.quantityOrdered || 0) * (item.costPrice || 0);
      subTotal += totalCost;
      return { ...item, totalCost };
    });

    const totalAmount =
      subTotal + (poData.taxes || 0) + (poData.shippingCosts || 0);

    // 3. Create the Purchase Order document
    const newPO = await PurchaseOrder.create({
      ...rest,
      items: processedItems,
      subTotal,
      totalAmount,
      transactionCurrency,
      exchangeRateToBase,
      createdBy: userId,
    });

    return newPO;
  }

  /**
   * Receives goods from a PO, updating inventory and accounting records.
   * This entire method MUST be called from within a database transaction in the controller.
   */
  async receiveGoodsFromPO_old(
    models,
    { poId, receivedItems, userId },
    session
  ) {
    const { PurchaseOrder, Supplier, Account } = models;

    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new Error("Purchase Order not found.");
    if (["fully_received", "cancelled"].includes(po.status)) {
      throw new Error(`Purchase Order is already ${po.status}.`);
    }

    const supplier = await Supplier.findById(po.supplierId).session(session);
    if (!supplier || !supplier.ledgerAccountId)
      throw new Error("Supplier or their financial account not found.");

    const inventoryAssetAccount = await Account.findOne({
      isSystemAccount: true,
      name: "Inventory Asset",
    }).session(session);
    if (!inventoryAssetAccount)
      throw new Error('System account "Inventory Asset" not found.');

    let totalReceivedValueInBase = 0;

    // 1. Update Inventory for each received item
    for (const item of receivedItems) {
      const poItem = po.items.find(
        (p) => p.productVariantId.toString() === item.productVariantId
      );
      if (!poItem)
        throw new Error(`Item ${item.productVariantId} not found in this PO.`);

      const costInBaseCurrency = poItem.costPrice * po.exchangeRateToBase;
      totalReceivedValueInBase += item.quantityReceived * costInBaseCurrency;

      await inventoryService.increaseStock(
        models,
        {
          productVariantId: item.productVariantId,
          branchId: po.destinationBranchId,
          quantity: item.quantityReceived,
          costPriceInBaseCurrency: costInBaseCurrency,
          sellingPriceInBaseCurrency: item.sellingPrice, // Pass optional selling price
          overrideSellingPrice: item.overrideSellingPrice, // Pass optional override price
          serials: item.serials,
          batchNumber: po.poNumber, // Use the PO number as the batch number
          userId,
          refs: { purchaseId: po._id, supplierId: po.supplierId },
        },
        session
      );

      poItem.quantityReceived += item.quantityReceived;
    }

    // 2. Post the transaction to the accounting ledger in the base currency
    if (totalReceivedValueInBase > 0) {
      await accountingService.createJournalEntry(
        models,
        {
          description: `Received goods for PO #${po.poNumber}`,
          entries: [
            {
              accountId: inventoryAssetAccount._id,
              debit: totalReceivedValueInBase,
            },
            {
              accountId: supplier.ledgerAccountId,
              credit: totalReceivedValueInBase,
            },
          ],
          currency: po.transactionCurrency, // Log original currency for reference
          exchangeRateToBase: po.exchangeRateToBase,
          refs: { purchaseId: po._id },
        },
        session
      );
    }

    // 3. Update the overall PO status
    const allItemsReceived = po.items.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    );
    po.status = allItemsReceived ? "fully_received" : "partially_received";

    await po.save({ session });
    return po;
  }

  /**
   * Receives goods from a PO, creating a GRN, updating inventory, and posting to a holding account.
   * This entire method MUST be called from within a database transaction in the controller.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - The data for the goods receipt.
   * @param {string} data.poId - The ID of the Purchase Order.
   * @param {Array<object>} data.receivedItems - An array of items received, including quantities and serials.
   * @param {string} data.userId - The ID of the user receiving the goods.
   * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
   */
  async receiveGoodsFromPO(
    models,
    { poId, receivedItems, userId, notes },
    session
  ) {
    const { PurchaseOrder, Supplier, Account, GoodsReceiptNote } = models;

    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new Error("Purchase Order not found.");
    if (["fully_received", "cancelled"].includes(po.status)) {
      throw new Error(`Purchase Order is already ${po.status}.`);
    }

    // Fetch required system accounts for the journal entry
    const [grniAccount, inventoryAssetAccount] = await Promise.all([
      Account.findOne({
        isSystemAccount: true,
        code: "2110", // Assuming this is the code for GRNI
        name: "Goods Received Not Invoiced (GRNI)",
        subType: "Current Liability",
      }).session(session),
      Account.findOne({
        isSystemAccount: true,
        name: "Inventory Asset",
      }).session(session),
    ]);
    if (!grniAccount || !inventoryAssetAccount)
      throw new Error(
        "Essential accounting ledgers (GRNI or Inventory Asset) are missing."
      );

    // 1. Create the Goods Receipt Note (GRN) document
    const grn = (
      await GoodsReceiptNote.create(
        [
          {
            purchaseOrderId: po._id,
            supplierId: po.supplierId,
            branchId: po.destinationBranchId,
            receivedBy: userId,
            notes,
            items: receivedItems.map((item) => ({
              productVariantId: item.productVariantId,
              quantityReceived: item.quantityReceived,
              receivedSerials: item.serials || [],
            })),
          },
        ],
        { session }
      )
    )[0];

    let totalReceivedValueInBase = 0;

    // 2. Update Inventory for each received item
    for (const item of receivedItems) {
      const poItem = po.items.find(
        (p) => p.productVariantId.toString() === item.productVariantId
      );
      if (!poItem)
        throw new Error(`Item ${item.productVariantId} not found in this PO.`);

      const costInBaseCurrency = poItem.costPrice * po.exchangeRateToBase;
      totalReceivedValueInBase += item.quantityReceived * costInBaseCurrency;

      await inventoryService.increaseStock(
        models,
        {
          productVariantId: item.productVariantId,
          branchId: po.destinationBranchId,
          quantity: item.quantityReceived,
          costPriceInBaseCurrency: costInBaseCurrency,
          sellingPriceInBaseCurrency: item.sellingPrice,
          overrideSellingPrice: item.overrideSellingPrice,
          serials: item.serials,
          batchNumber: po.poNumber,
          userId,
          refs: {
            relatedPurchaseId: po._id,
            purchaseId: po._id,
            supplierId: po.supplierId,
          },
        },
        session
      );

      poItem.quantityReceived += item.quantityReceived;
    }

    // 3. Post the transaction to the accounting ledger (valuing assets and creating a temporary liability)
    if (totalReceivedValueInBase > 0) {
      await accountingService.createJournalEntry(
        models,
        {
          description: `Goods received for PO #${po.poNumber} (GRN: ${grn.grnNumber})`,
          entries: [
            {
              accountId: inventoryAssetAccount._id,
              debit: totalReceivedValueInBase,
            },
            { accountId: grniAccount._id, credit: totalReceivedValueInBase },
          ],
          currency: po.transactionCurrency,
          exchangeRateToBase: po.exchangeRateToBase,
          refs: { purchaseId: po._id },
        },
        session
      );
    }

    // 4. Update the overall PO status
    const allItemsReceived = po.items.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    );
    po.status = allItemsReceived ? "fully_received" : "partially_received";

    await po.save({ session });
    return po;
  }
}

module.exports = new PurchasingService();
