const accountingService = require("./accounting.service");
const mongoose = require("mongoose");

/**
 * The ReconciliationService handles the three-way match between POs, GRNs, and Supplier Invoices.
 */
class ReconciliationService {
  /**
   * Posts a supplier invoice, reconciling it against goods receipts and the original PO.
   * This method assumes it is being called from within a `withTransaction` block in the controller.
   */
  async postSupplierInvoice(
    models,
    { supplierId, goodsReceiptNoteIds, items, ...invoiceData },
    userId
  ) {
    const { SupplierInvoice, GoodsReceiptNote, PurchaseOrder, Account, Supplier } = models;

    // 1. Fetch all related documents needed for reconciliation.
    const grns = await GoodsReceiptNote.find({
      _id: { $in: goodsReceiptNoteIds },
    });
    if (grns.length !== goodsReceiptNoteIds.length) {
      throw new Error("One or more Goods Receipt Notes not found.");
    }

    const po = await PurchaseOrder.findById(grns[0].purchaseOrderId);
    if (!po) throw new Error("Related Purchase Order not found.");

    const supplier = await Supplier.findById(supplierId).select("ledgerAccountId");
    if (!supplier || !supplier.ledgerAccountId)
      throw new Error("Supplier's financial account not found.");

    const [grniAccount, apAccount, ppvAccount] = await Promise.all([
      Account.findOne({
        isSystemAccount: true,
        name: "Goods Received Not Invoiced (GRNI)",
      }),
      Account.findById(supplier.ledgerAccountId),
      Account.findOne({
        isSystemAccount: true,
        name: "Purchase Price Variance",
      }),
    ]);

    if (!grniAccount || !apAccount || !ppvAccount) {
      throw new Error("Essential accounting ledgers (GRNI, AP, or PPV) are missing.");
    }

    // --- THE DEFINITIVE FIX STARTS HERE ---

    // 2. Process items, calculate totals, and perform validation
    let totalBilledValueInBase = 0;
    let totalOriginalValueInBase = 0;

    const processedItems = items.map((item) => {
      const poItem = po.items.find((p) => p.productVariantId.toString() === item.productVariantId);
      if (!poItem) throw new Error(`Billed item ${item.description} not found on original PO.`);

      // Calculate the total cost for THIS line item
      const itemTotalCost = item.quantityBilled * item.finalCostPrice;

      // Calculate values in the tenant's base currency for the journal entry
      const finalCostInBase = item.finalCostPrice * po.exchangeRateToBase;
      const originalCostInBase = poItem.costPrice * po.exchangeRateToBase;

      totalBilledValueInBase += item.quantityBilled * finalCostInBase;
      totalOriginalValueInBase += item.quantityBilled * originalCostInBase;

      // Return the item with its calculated totalCost
      return { ...item, totalCost: itemTotalCost };
    });

    const purchasePriceVariance = totalBilledValueInBase - totalOriginalValueInBase;

    // Calculate final invoice totals
    const subTotal = processedItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalAmount = subTotal + (invoiceData.taxes || 0) + (invoiceData.shippingCosts || 0);

    // --- END OF FIX ---

    // 3. Create the final, complex journal entry
    const journalEntries = [
      { accountId: grniAccount._id, debit: totalOriginalValueInBase },
      { accountId: apAccount._id, credit: totalBilledValueInBase },
    ];

    if (Math.abs(purchasePriceVariance) > 1e-9) {
      if (purchasePriceVariance > 0) {
        journalEntries.push({
          accountId: ppvAccount._id,
          debit: purchasePriceVariance,
        });
      } else {
        journalEntries.push({
          accountId: ppvAccount._id,
          credit: -purchasePriceVariance,
        });
      }
    }

    await accountingService.createJournalEntry(models, {
      description: `Supplier Invoice #${
        invoiceData.supplierInvoiceNumber
      } from ${apAccount.name.replace("AP - ", "")}`,
      entries: journalEntries,
      currency: po.transactionCurrency,
      exchangeRateToBase: po.exchangeRateToBase,
      refs: { purchaseId: po._id },
    });

    // 4. Create the SupplierInvoice document with all calculated fields
    const newInvoices = await SupplierInvoice.create([
      {
        ...invoiceData,
        supplierId,
        goodsReceiptNoteIds,
        items: processedItems, // Use the processed items with totalCost
        subTotal,
        totalAmount,
        postedBy: userId,
      },
    ]);

    // 5. Update the status of the related GRNs
    await GoodsReceiptNote.updateMany(
      { _id: { $in: goodsReceiptNoteIds } },
      { $set: { status: "invoiced" } }
    );

    return newInvoices[0];
  }
}

module.exports = new ReconciliationService();
