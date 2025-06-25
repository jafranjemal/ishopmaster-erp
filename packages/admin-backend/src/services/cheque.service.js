const accountingService = require("./accounting.service");
const mongoose = require("mongoose");

/**
 * The ChequeService handles the lifecycle of cheque payments after they have been recorded.
 */
class ChequeService {
  /**
   * Updates the status of a cheque and posts the corresponding "second-leg" accounting transaction.
   * Assumes it is being called from within a withTransaction block in the controller.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - The data for the status update.
   * @param {string} data.chequeId - The ID of the cheque to update.
   * @param {string} data.newStatus - The new status ('cleared' or 'bounced').
   * @param {string} data.userId - The ID of the user performing the action.
   * @param {string} data.baseCurrency - The tenant's base currency for financial posting.
   */
  async updateChequeStatus(
    models,
    { chequeId, newStatus, userId, baseCurrency }
  ) {
    const {
      Cheque,
      Payment,
      PaymentMethod,
      Account,
      SalesInvoice,
      SupplierInvoice,
    } = models;

    const cheque = await Cheque.findById(chequeId);
    if (!cheque) throw new Error("Cheque not found.");
    if (cheque.status !== "pending_clearance") {
      throw new Error(`Cheque is already marked as '${cheque.status}'.`);
    }

    const payment = await Payment.findById(cheque.paymentId).populate({
      path: "paymentLines",
      populate: { path: "paymentMethodId" },
    });
    if (!payment) throw new Error("Associated payment not found.");

    // Find the specific cheque payment line and its method
    const chequePaymentLine = payment.paymentLines.find(
      (line) => line.referenceNumber === cheque.chequeNumber
    );
    if (!chequePaymentLine)
      throw new Error("Cheque details not found on the original payment.");

    const paymentMethod = chequePaymentLine.paymentMethodId;
    if (!paymentMethod || !paymentMethod.holdingAccountId) {
      throw new Error(
        "Cheque payment method is not configured correctly with a holding account."
      );
    }

    const holdingAccount = await Account.findById(
      paymentMethod.holdingAccountId
    );
    const finalBankAccount = await Account.findById(
      paymentMethod.linkedAccountId
    );
    if (!holdingAccount || !finalBankAccount)
      throw new Error("Linked bank or holding account not found.");

    let journalDescription = "";
    let journalEntries = [];
    const amountInBase = payment.totalAmount; // Payment total is already in base currency

    if (newStatus === "cleared") {
      if (cheque.direction === "inflow") {
        // Cheque from customer cleared
        journalDescription = `Cleared cheque #${cheque.chequeNumber}.`;
        journalEntries = [
          { accountId: finalBankAccount._id, debit: amountInBase },
          { accountId: holdingAccount._id, credit: amountInBase },
        ];
      } else {
        // Cheque to supplier cleared
        journalDescription = `Cleared cheque #${cheque.chequeNumber} to supplier.`;
        journalEntries = [
          { accountId: holdingAccount._id, debit: amountInBase },
          { accountId: finalBankAccount._id, credit: amountInBase },
        ];
      }
    } else if (newStatus === "bounced") {
      const SourceModel =
        payment.paymentSourceType === "SalesInvoice"
          ? SalesInvoice
          : SupplierInvoice;
      // This polymorphic find requires a bit more care
      const sourceDoc = await models[payment.paymentSourceType]
        .findById(payment.paymentSourceId)
        .populate({
          path:
            payment.paymentSourceType === "SalesInvoice"
              ? "customerId"
              : "supplierId",
          select: "ledgerAccountId",
        });

      const sourceEntityLedgerAccountId =
        sourceDoc.customerId?.ledgerAccountId ||
        sourceDoc.supplierId?.ledgerAccountId;
      if (!sourceEntityLedgerAccountId)
        throw new Error(
          "Could not find the original financial account for the bounced cheque."
        );

      if (cheque.direction === "inflow") {
        // Customer cheque bounced
        journalDescription = `Bounced cheque #${cheque.chequeNumber}. Re-applying debt to customer.`;
        journalEntries = [
          { accountId: sourceEntityLedgerAccountId, debit: amountInBase }, // They owe us again
          { accountId: holdingAccount._id, credit: amountInBase },
        ];
      } else {
        // Our cheque to supplier bounced
        journalDescription = `Bounced cheque #${cheque.chequeNumber}. Re-applying liability to supplier.`;
        journalEntries = [
          { accountId: holdingAccount._id, debit: amountInBase },
          { accountId: sourceEntityLedgerAccountId, credit: amountInBase }, // We owe them again
        ];
      }
    } else {
      throw new Error(`Invalid target status '${newStatus}'.`);
    }

    // Post the second-leg journal entry using the tenant's base currency
    if (journalEntries.length > 0) {
      await accountingService.createJournalEntry(models, {
        description: journalDescription,
        entries: journalEntries,
        currency: baseCurrency,
        exchangeRateToBase: 1, // Rate is 1 because this is an internal transfer between base currency accounts
        refs: { paymentId: payment._id },
      });
    }

    // Finally, update the cheque's status
    cheque.status = newStatus;
    cheque.clearingDate = new Date();
    await cheque.save();

    return cheque;
  }
}

module.exports = new ChequeService();
