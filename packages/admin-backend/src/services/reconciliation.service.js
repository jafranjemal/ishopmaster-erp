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
      const poItem = po.items.find((p) => p.ProductVariantId.toString() === item.ProductVariantId);
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

  /**
   * Parses a raw CSV buffer and creates a BankStatement document.
   */
  /**
   * Parses a raw CSV from a URL and creates a BankStatement document.
   */
  async processStatementUpload(models, { fileUrl, accountId, statementDate }, userId) {
    const { BankStatement } = models;

    if (!fileUrl) {
      throw new Error("File URL is required to process statement.");
    }

    // 1. Fetch the file content from the secure URL
    const response = await axios.get(fileUrl, { responseType: "stream" });
    const csvData = await new Promise((resolve, reject) => {
      let data = "";
      response.data.on("data", (chunk) => (data += chunk));
      response.data.on("end", () => resolve(data));
      response.data.on("error", (err) => reject(err));
    });

    // 2. Parse the downloaded CSV data
    const parsed = papaparse.parse(csvData, { header: true, skipEmptyLines: true });
    if (parsed.errors.length > 0) {
      console.error("CSV Parsing Errors:", parsed.errors);
      throw new Error("Failed to parse the uploaded CSV file.");
    }

    const lines = parsed.data.map((row) => ({
      date: new Date(row.Date),
      description: row.Description,
      amount: parseFloat(row.Amount),
      type: parseFloat(row.Amount) < 0 ? "debit" : "credit",
    }));

    // 3. Create the BankStatement document
    const newStatement = await BankStatement.create({
      accountId,
      statementDate,
      lines,
      startingBalance: 0, // These would be entered by the user in a more advanced UI
      endingBalance: 0,
      uploadedBy: userId,
    });
    return newStatement;
  }
  /**
   * Finds potential matches in the Ledger for lines in a BankStatement.
   */
  async suggestMatches(models, { statementId }) {
    const { BankStatement, LedgerEntry } = models;
    const statement = await BankStatement.findById(statementId);
    if (!statement) throw new Error("Bank statement not found.");

    const suggestions = [];
    for (const line of statement.lines.filter((l) => l.status === "unmatched")) {
      // Matching algorithm: Find ledger entries with the same amount within a 5-day window.
      const fiveDaysBefore = new Date(line.date.getTime() - 5 * 24 * 60 * 60 * 1000);
      const fiveDaysAfter = new Date(line.date.getTime() + 5 * 24 * 60 * 60 * 1000);

      const potentialMatches = await LedgerEntry.find({
        accountId: statement.accountId,
        amountInBaseCurrency: Math.abs(line.amount),
        date: { $gte: fiveDaysBefore, $lte: fiveDaysAfter },
      }).lean();

      if (potentialMatches.length > 0) {
        suggestions.push({ statementLineId: line._id, potentialMatches });
      }
    }
    return suggestions;
  }

  async confirmMatch(models, { statementId, statementLineId, ledgerEntryIds }, userId) {
    const { Reconciliation, BankStatement } = models;
    // In a real system, you'd also update the status of the ledger entries.
    await BankStatement.updateOne(
      { _id: statementId, "lines._id": statementLineId },
      { $set: { "lines.$.status": "matched" } }
    );
    const newReconciliation = await Reconciliation.create({
      statementId,
      statementLineId,
      ledgerEntryIds,
      reconciledBy: userId,
    });
    return newReconciliation;
  }
}

module.exports = new ReconciliationService();
