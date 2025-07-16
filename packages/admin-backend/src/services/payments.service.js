const accountingService = require("./accounting.service");
const { recalculateInvoicePayments } = require("./utils/paymentUtils");

/**
 * The PaymentsService is the central engine for processing all financial payments,
 * whether for sales, purchases, or other expenses. It orchestrates the creation
 * of payment records and their corresponding financial ledger entries.
 */
class PaymentsService {
  /**
   * Records a payment against a source document, correctly handles split payments,
   * creates special records for complex types like cheques, and posts a single,
   * balanced, compound journal entry to the ledger.
   * Assumes it is being called from within a withTransaction block.
   */
  async recordPayment(
    models,
    {
      sourceDocumentObject,
      paymentSourceId,
      paymentSourceType,
      paymentLines,
      ...restOfPaymentData
    },
    userId,
    baseCurrency,
    tenant,
    session = null
  ) {
    const {
      Supplier,
      Customer,
      Payment,
      PaymentMethod,
      Cheque,
      Account,
      SupplierInvoice,
      SalesInvoice,
    } = models; // Add other source models as needed

    // 1. Validate and fetch all payment methods being used.
    const methodIds = paymentLines.map((line) => line.paymentMethodId);
    const paymentMethods = await PaymentMethod.find({ _id: { $in: methodIds } }).session(session);
    if (paymentMethods.length !== methodIds.length)
      throw new Error("One or more payment methods are invalid.");
    const methodMap = new Map(paymentMethods.map((m) => [m._id.toString(), m]));

    let sourceDocument = sourceDocumentObject; // Use the passed object if it exists

    const isOutflow = restOfPaymentData.direction === "outflow";

    if (!sourceDocument) {
      const SourceModel = paymentSourceType === "SupplierInvoice" ? SupplierInvoice : SalesInvoice;
      sourceDocument = await SourceModel.findById(paymentSourceId).session(session);
    }

    let sourceLedgerAccountId = null;

    if (paymentSourceType === "SupplierInvoice" && sourceDocument?.supplierId) {
      const supplier = await Supplier.findById(sourceDocument.supplierId)
        .select("ledgerAccountId name")
        .session(session);
      sourceLedgerAccountId = supplier?.ledgerAccountId;
    } else if (paymentSourceType === "SalesInvoice" && sourceDocument?.customerId) {
      const customer = await Customer.findById(sourceDocument.customerId)
        .select("ledgerAccountId name")
        .session(session);
      sourceLedgerAccountId = customer?.ledgerAccountId;
    }

    const paymentMethodTypes = paymentMethods.map((m) => m.type);
    // Add else-if for 'SalesInvoice' etc. later
    console.log("paymentSourceId ", paymentSourceId);
    console.log("paymentSourceType ", paymentSourceType);
    console.log("sourceLedgerAccountId ", sourceLedgerAccountId);
    console.log("sourceDocument ", sourceDocument);

    if (!sourceDocument) throw new Error("The source document could not be found.");

    console.log(paymentLines);
    // --- VALIDATION LOGIC ---
    const totalPayment = paymentLines.reduce((sum, line) => sum + parseFloat(line.amount), 0);
    const totalAmount = parseFloat(totalPayment);
    const amountDue = sourceDocument.totalAmount - (sourceDocument.amountPaid || 0);

    // Use a small epsilon for floating point comparisons to avoid precision errors
    if (totalAmount > amountDue + 1e-9) {
      throw new Error(
        `Payment amount (${totalAmount}) exceeds amount due (${amountDue.toFixed(
          2
        )}). Overpayment is not allowed.`
      );
    }
    // --- END VALIDATION ---

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

    // 2. Fetch the source document to get its details and ledger account.

    // if (paymentSourceType === "SupplierInvoice") {
    //   sourceDocument = await SupplierInvoice.findById(paymentSourceId).populate({
    //     path: "supplierId",
    //     select: "ledgerAccountId name",
    //   });
    // }
    // Add else-if for 'SalesInvoice' etc. later

    if (!sourceDocument) throw new Error("The source document could not be found.");

    if (!sourceLedgerAccountId)
      throw new Error(`The source document is not linked to a financial account.`);

    // 3. Create the main Payment document "header".

    const hasCheque = paymentLines.some(
      (line) => methodMap.get(line.paymentMethodId.toString())?.type === "cheque"
    );

    const enrichedPaymentLines = paymentLines.map((line) => {
      const method = methodMap.get(line.paymentMethodId.toString());
      return {
        ...line,
        status: method.type === "cheque" ? "pending" : "cleared",
      };
    });

    const [newPayment] = await Payment.create(
      [
        {
          ...restOfPaymentData,
          paymentSourceId,
          paymentSourceType,
          paymentLines: enrichedPaymentLines,
          totalAmount,
          processedBy: userId,
          status: hasCheque ? "pending_clearance" : "completed",
        },
      ],
      { session }
    );

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
        method.type === "cheque" ? method.holdingAccountId : method.linkedAccountId;
      if (!creditAccountId)
        throw new Error(`Payment method "${method.name}" is not configured correctly.`);

      // Add a credit line for this payment method.
      journalEntries.push({ accountId: creditAccountId, credit: parseFloat(line.amount) });

      // If it's a cheque, create the separate Cheque tracking document.
      if (method.type === "cheque") {
        await Cheque.create(
          [
            {
              paymentId: newPayment._id,
              chequeNumber: line.referenceNumber,
              bankName: line.bankName,
              chequeDate: line.chequeDate,
              status: "pending_clearance",
              direction: restOfPaymentData.direction,
            },
          ],
          { session }
        );
      }
    }

    console.log("🧾 Journal Entries Before Save:", JSON.stringify(journalEntries, null, 2));
    // 6. Post the single, balanced, compound journal entry.
    await accountingService.createJournalEntry(
      models,
      {
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
      },
      session,
      tenant
    );

    await sourceDocument.save({ session });

    await recalculateInvoicePayments(
      models,
      {
        sourceId: paymentSourceId,
        sourceType: paymentSourceType,
      },
      session
    );

    // --- END STATUS UPDATE ---
    return newPayment;
  }
}

module.exports = new PaymentsService();
