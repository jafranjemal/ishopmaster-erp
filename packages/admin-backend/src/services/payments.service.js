const accountingService = require("./accounting.service");

/**
 * The PaymentsService is the central engine for processing all financial payments,
 * whether for sales, purchases, or other expenses. It orchestrates the creation
 * of payment records and their corresponding financial ledger entries.
 */
class PaymentsService {
  /**
   * Records a payment against a source document, handles split payments, and creates
   * the necessary accounting journal entries.
   * @param {object} models - The tenant's compiled models.
   * @param {object} paymentData - The complete data for the payment.
   * @param {string} paymentData.paymentSourceId - The ID of the document being paid (e.g., an invoice).
   * @param {string} paymentData.paymentSourceType - The model name of the source ('SupplierInvoice', 'SalesInvoice').
   * @param {Array<object>} paymentData.paymentLines - The array of payment methods and amounts.
   * @param {string} userId - The ID of the user processing the payment.
   * @param {string} baseCurrency - The tenant's base currency.
   */
  async recordPaymentOld(
    models,
    { paymentSourceId, paymentSourceType, paymentLines, ...restOfPaymentData },
    userId,
    baseCurrency
  ) {
    const { Payment, PaymentMethod, Cheque, Account, SupplierInvoice } = models; // Add other source models as needed

    // 1. Validate and fetch all payment methods being used.
    const methodIds = paymentLines.map((line) => line.paymentMethodId);
    const paymentMethods = await PaymentMethod.find({
      _id: { $in: methodIds },
    });
    if (paymentMethods.length !== methodIds.length) {
      throw new Error("One or more payment methods are invalid.");
    }
    const methodMap = new Map(paymentMethods.map((m) => [m._id.toString(), m]));

    // 2. Fetch the source document to get its details and ledger account.
    // This is a simplified polymorphic fetch. A real system might have a helper function.
    let sourceDocument;
    if (paymentSourceType === "SupplierInvoice") {
      sourceDocument = await SupplierInvoice.findById(paymentSourceId).populate(
        {
          path: "supplierId",
          select: "ledgerAccountId name",
        }
      );
    } // Add else-if for 'SalesInvoice' etc. later

    if (!sourceDocument)
      throw new Error(
        "The source document for this payment could not be found."
      );

    const sourceLedgerAccountId = sourceDocument.supplierId?.ledgerAccountId; // For AP Invoices
    if (!sourceLedgerAccountId)
      throw new Error(
        `The source document is not linked to a financial account.`
      );

    // 3. Create the main Payment document "header".
    const totalAmount = paymentLines.reduce(
      (sum, line) => sum + line.amount,
      0
    );

    // This must be wrapped in an array for Mongoose transactions
    const [newPayment] = await Payment.create([
      {
        ...restOfPaymentData,
        paymentSourceId,
        paymentSourceType,
        paymentLines,
        totalAmount,
        processedBy: userId,
        // If any line is a cheque, the overall status is pending.
        status: paymentLines.some(
          (line) =>
            methodMap.get(line.paymentMethodId.toString())?.type === "cheque"
        )
          ? "pending_clearance"
          : "completed",
      },
    ]);

    // 4. Process each payment line to create journal entries and other records.
    for (const line of paymentLines) {
      const method = methodMap.get(line.paymentMethodId.toString());
      // --- UPGRADED ACCOUNTING LOGIC ---
      let creditAccountId;
      let journalDescription = `Payment for ${paymentSourceType} #${
        sourceDocument.invoiceId || sourceDocument.poNumber
      }`;

      // CRITICAL LOGIC: Choose the correct account to credit based on payment type
      if (method.type === "cheque") {
        creditAccountId = method.holdingAccountId; // Credit "Cheques Payable" liability account
        journalDescription += ` via Cheque #${line.referenceNumber}`;

        // --- CRITICAL INTEGRATION STEP ---
        // Create the corresponding Cheque document
        await Cheque.create([
          {
            paymentId: newPayment._id,
            chequeNumber: line.referenceNumber,
            bankName: line.bankName, // Frontend must send this
            chequeDate: line.chequeDate, // Frontend must send this
          },
        ]);
      } else {
        // For Cash, Card, Bank Transfer, credit the direct asset account
        creditAccountId = method.linkedAccountId;
      }

      if (!creditAccountId)
        throw new Error(
          `Payment method "${method.name}" is not configured correctly.`
        );

      // Create the journal entry for this specific payment line.
      // All amounts are assumed to be in the tenant's base currency for now.
      await accountingService.createJournalEntry(models, {
        description: journalDescription,
        entries: [
          { accountId: sourceLedgerAccountId, debit: line.amount },
          { accountId: creditAccountId, credit: line.amount },
        ],
        currency: baseCurrency,
        exchangeRateToBase: 1, // Assume internal transfers are at a 1:1 rate with base
        refs: {
          paymentId: newPayment._id,
          [paymentSourceType.toLowerCase() + "Id"]: paymentSourceId,
        },
      });
    }

    // 5. Update the status of the source document
    sourceDocument.amountPaid = (sourceDocument.amountPaid || 0) + totalAmount;
    if (sourceDocument.amountPaid >= sourceDocument.totalAmount) {
      sourceDocument.status = "fully_paid";
    } else {
      sourceDocument.status = "partially_paid";
    }
    await sourceDocument.save();

    return newPayment;
  }

  /**
   * Records a payment against a source document, correctly handles split payments,
   * creates special records for complex types like cheques, and posts a single,
   * balanced, compound journal entry to the ledger.
   * Assumes it is being called from within a withTransaction block.
   */
  async recordPayment(
    models,
    { paymentSourceId, paymentSourceType, paymentLines, ...restOfPaymentData },
    userId,
    baseCurrency
  ) {
    const { Payment, PaymentMethod, Cheque, Account, SupplierInvoice } = models; // Add other source models as needed

    // 1. Fetch the source document to get its details and ledger account.
    let sourceDocument;
    if (paymentSourceType === "SupplierInvoice") {
      sourceDocument = await SupplierInvoice.findById(paymentSourceId).populate(
        {
          path: "supplierId",
          select: "ledgerAccountId name",
        }
      );
    }
    // Add else-if for 'SalesInvoice' etc. later

    if (!sourceDocument)
      throw new Error("The source document could not be found.");

    // --- VALIDATION LOGIC ---
    const totalAmount = paymentLines.reduce(
      (sum, line) => sum + line.amount,
      0
    );
    const amountDue =
      sourceDocument.totalAmount - (sourceDocument.amountPaid || 0);

    // Use a small epsilon for floating point comparisons to avoid precision errors
    if (totalAmount > amountDue + 1e-9) {
      throw new Error(
        `Payment amount (${totalAmount}) exceeds amount due (${amountDue.toFixed(
          2
        )}). Overpayment is not allowed.`
      );
    }
    // --- END VALIDATION ---

    // 1. Validate and fetch all payment methods being used.
    const methodIds = paymentLines.map((line) => line.paymentMethodId);
    const paymentMethods = await PaymentMethod.find({
      _id: { $in: methodIds },
    });

    const uniqueMethodIds = new Set(methodIds);

    if (uniqueMethodIds.size !== methodIds.length) {
      throw new Error(
        "Invalid split payment: Duplicate payment methods detected. Please use each method only once."
      );
    }

    if (paymentMethods.length !== methodIds.length) {
      throw new Error(
        "Validation failed: One or more payment method IDs are invalid or unrecognized."
      );
    }
    const methodMap = new Map(paymentMethods.map((m) => [m._id.toString(), m]));

    // 2. Fetch the source document to get its details and ledger account.

    if (paymentSourceType === "SupplierInvoice") {
      sourceDocument = await SupplierInvoice.findById(paymentSourceId).populate(
        {
          path: "supplierId",
          select: "ledgerAccountId name",
        }
      );
    } // Add else-if for 'SalesInvoice' etc. later

    if (!sourceDocument)
      throw new Error("The source document could not be found.");

    const sourceLedgerAccountId = sourceDocument.supplierId?.ledgerAccountId; // For AP Invoices
    if (!sourceLedgerAccountId)
      throw new Error(
        `The source document is not linked to a financial account.`
      );

    // 3. Create the main Payment document "header".

    const hasCheque = paymentLines.some(
      (line) =>
        methodMap.get(line.paymentMethodId.toString())?.type === "cheque"
    );

    const [newPayment] = await Payment.create([
      {
        ...restOfPaymentData,
        paymentSourceId,
        paymentSourceType,
        paymentLines,
        totalAmount,
        processedBy: userId,
        status: hasCheque ? "pending_clearance" : "completed",
      },
    ]);

    // --- THE DEFINITIVE FIX: BUILD A COMPOUND JOURNAL ENTRY ---

    // 4. Prepare the journal entry. Start with the single debit.
    const journalEntries = [
      // Debit the source account (e.g., Accounts Payable) for the total amount.
      { accountId: sourceLedgerAccountId, debit: totalAmount },
    ];

    // 5. Loop through each payment line to build the credits.
    for (const line of paymentLines) {
      const method = methodMap.get(line.paymentMethodId.toString());

      // Determine which account to credit (the holding account for cheques, or the direct asset account for others)
      const creditAccountId =
        method.type === "cheque"
          ? method.holdingAccountId
          : method.linkedAccountId;
      if (!creditAccountId)
        throw new Error(
          `Payment method "${method.name}" is not configured correctly.`
        );

      // Add a credit line for this payment method.
      journalEntries.push({ accountId: creditAccountId, credit: line.amount });

      // If it's a cheque, create the separate Cheque tracking document.
      if (method.type === "cheque") {
        await Cheque.create([
          {
            paymentId: newPayment._id,
            chequeNumber: line.referenceNumber,
            bankName: line.bankName,
            chequeDate: line.chequeDate,
            status: "pending_clearance",
            direction: restOfPaymentData.direction,
          },
        ]);
      }
    }

    // 6. Post the single, balanced, compound journal entry.
    await accountingService.createJournalEntry(models, {
      description: `Payment for ${paymentSourceType} #${
        sourceDocument.invoiceId || sourceDocument.poNumber
      }`,
      entries: journalEntries,
      currency: baseCurrency,
      exchangeRateToBase: 1, // Assumes payment is in base currency for simplicity
      refs: {
        paymentId: newPayment._id,
        [`${paymentSourceType.toLowerCase()}Id`]: paymentSourceId,
      },
    });
    // --- END OF FIX ---

    // --- STATUS UPDATE LOGIC ---
    // 7. Update the status of the source document
    sourceDocument.amountPaid = (sourceDocument.amountPaid || 0) + totalAmount;
    // Check if fully paid, allowing for tiny floating point discrepancies
    if (
      Math.abs(sourceDocument.totalAmount - sourceDocument.amountPaid) < 0.01
    ) {
      sourceDocument.status = "fully_paid";
    } else {
      sourceDocument.status = "partially_paid";
    }
    await sourceDocument.save();
    // --- END STATUS UPDATE ---
    return newPayment;
  }
}

module.exports = new PaymentsService();
