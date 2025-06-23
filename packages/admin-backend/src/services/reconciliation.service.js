const accountingService = require("./accounting.service");
const mongoose = require("mongoose");

/**
 * The ReconciliationService handles the three-way match between POs, GRNs, and Supplier Invoices.
 */
class ReconciliationService {
  /**
   * Posts a supplier invoice, reconciling it against goods receipts and the original PO.
   * This is the core of the three-way match.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - Data for the new supplier invoice.
   * @param {string} userId - The ID of the user posting the invoice.
   * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
   */
  async postSupplierInvoice(
    models,
    { supplierId, goodsReceiptNoteIds, items, ...invoiceData },
    session
  ) {
    const { SupplierInvoice, GoodsReceiptNote, PurchaseOrder, Account } =
      models;

    // 1. Fetch all related documents needed for reconciliation
    const grns = await GoodsReceiptNote.find({
      _id: { $in: goodsReceiptNoteIds },
    }).session(session);
    if (grns.length !== goodsReceiptNoteIds.length)
      throw new Error("One or more Goods Receipt Notes not found.");

    const po = await PurchaseOrder.findById(grns[0].purchaseOrderId).session(
      session
    );
    if (!po) throw new Error("Related Purchase Order not found.");

    // Fetch necessary accounts for the journal entry
    const [grniAccount, apAccount, ppvAccount] = await Promise.all([
      Account.findOne({
        isSystemAccount: true,
        subType: "Goods Received Not Invoiced",
      }).session(session),
      models.Supplier.findById(supplierId)
        .select("ledgerAccountId")
        .session(session)
        .then((s) => Account.findById(s.ledgerAccountId).session(session)),
      Account.findOne({
        isSystemAccount: true,
        subType: "Purchase Price Variance",
      }).session(session), // Assumes this account is seeded
    ]);
    if (!grniAccount || !apAccount || !ppvAccount)
      throw new Error(
        "Essential accounting ledgers (GRNI, AP, or PPV) are missing."
      );

    // 2. Validate quantities and calculate totals
    let totalBilledValueInBase = 0;
    let totalOriginalValueInBase = 0;

    for (const item of items) {
      const poItem = po.items.find(
        (p) => p.productVariantId.toString() === item.productVariantId
      );
      if (!poItem)
        throw new Error(
          `Billed item ${item.productVariantId} not found on original PO.`
        );

      const totalReceivedForThisItem = grns.reduce(
        (sum, grn) =>
          sum +
          (grn.items.find(
            (i) => i.productVariantId.toString() === item.productVariantId
          )?.quantityReceived || 0),
        0
      );

      if (item.quantityBilled > totalReceivedForThisItem) {
        throw new Error(
          `Quantity billed for ${item.description} (${item.quantityBilled}) exceeds quantity received (${totalReceivedForThisItem}).`
        );
      }

      const finalCostInBase = item.finalCostPrice * po.exchangeRateToBase;
      const originalCostInBase = poItem.costPrice * po.exchangeRateToBase;

      totalBilledValueInBase += item.quantityBilled * finalCostInBase;
      totalOriginalValueInBase += item.quantityBilled * originalCostInBase;
    }

    const purchasePriceVariance =
      totalBilledValueInBase - totalOriginalValueInBase;

    // 3. Create the final, complex journal entry
    const journalEntries = [
      // Debit the GRNI holding account to clear it for the value of goods received
      { accountId: grniAccount._id, debit: totalOriginalValueInBase },
      // Credit the supplier's AP account with the final, total invoice amount
      { accountId: apAccount._id, credit: totalBilledValueInBase },
    ];

    // If there's a price variance, add it to the journal entry
    if (Math.abs(purchasePriceVariance) > 1e-9) {
      if (purchasePriceVariance > 0) {
        // Unfavorable variance (we paid more)
        journalEntries.push({
          accountId: ppvAccount._id,
          debit: purchasePriceVariance,
        });
      } else {
        // Favorable variance (we paid less)
        journalEntries.push({
          accountId: ppvAccount._id,
          credit: -purchasePriceVariance,
        });
      }
    }

    await accountingService.createJournalEntry(
      models,
      {
        description: `Supplier Invoice #${
          invoiceData.supplierInvoiceNumber
        } from ${apAccount.name.replace("AP - ", "")}`,
        entries: journalEntries,
        currency: po.transactionCurrency,
        exchangeRateToBase: po.exchangeRateToBase,
        refs: { purchaseId: po._id },
      },
      session
    );

    // 4. Create the SupplierInvoice document
    const newInvoice = await SupplierInvoice.create(
      [
        {
          ...invoiceData,
          supplierId,
          goodsReceiptNoteIds,
          items,
          postedBy: userId,
        },
      ],
      { session }
    );

    // 5. Update the status of the related GRNs
    await GoodsReceiptNote.updateMany(
      { _id: { $in: goodsReceiptNoteIds } },
      { $set: { status: "invoiced" } },
      { session }
    );

    return newInvoice[0];
  }
}

module.exports = new ReconciliationService();
