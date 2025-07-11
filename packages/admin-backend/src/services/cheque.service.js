const accountingService = require("./accounting.service");
const mongoose = require("mongoose");

/**
 * Utility: Recalculate amountPaid and payment status for an invoice (Sales, Supplier, or Expense)
 * Uses `paymentLines[].status` instead of querying Cheques
 */
async function recalculateInvoicePayments(models, { sourceId, sourceType }) {
  const { Payment } = models;

  const SourceModel = models[sourceType];
  if (!SourceModel) throw new Error(`[Recalc] Invalid sourceType: ${sourceType}`);

  const invoice = await SourceModel.findById(sourceId);
  if (!invoice) {
    console.warn(`[Recalc] Invoice not found for ${sourceType} ID: ${sourceId}`);
    return;
  }

  const payments = await Payment.find({
    paymentSourceId: sourceId,
    paymentSourceType: sourceType,
    status: { $ne: "voided" },
  }).populate("paymentLines.paymentMethodId");

  let totalPaid = 0;

  for (const payment of payments) {
    for (const line of payment.paymentLines) {
      const method = line.paymentMethodId;
      if (!method) continue;

      if (line.status === "cleared") {
        totalPaid += line.amount;
        console.log(`[Recalc] ✅ Cleared ${method.name} +${line.amount}`);
      } else {
        console.log(`[Recalc] ⛔ Skipped ${method.name} (status=${line.status})`);
      }
    }
  }

  invoice.amountPaid = totalPaid;

  if (Math.abs(invoice.totalAmount - totalPaid) < 0.01) {
    invoice.status = "fully_paid";
  } else if (totalPaid > 0) {
    invoice.status = "partially_paid";
  } else {
    invoice.status = "pending_payment";
  }

  await invoice.save();

  console.log(
    `[Recalc ✅] ${sourceType} ${invoice.invoiceId || invoice._id}: Paid = ${totalPaid}, Status = ${invoice.status}`
  );
}

async function updatePaymentStatusAfterChequeBounce(models, paymentId) {
  const { Payment, Cheque, PaymentMethod } = models;

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  const cheques = await Cheque.find({ paymentId });
  const allChequeStatuses = cheques.map((chq) => chq.status);

  const hasPending = allChequeStatuses.includes("pending_clearance");
  const hasBounced = allChequeStatuses.includes("bounced");
  const allCleared = allChequeStatuses.every((s) => s === "cleared");

  // Count how many payment lines are cheque
  const chequeMethodIds = cheques.map((chq) => chq.paymentMethodId?.toString()).filter(Boolean);
  const totalChequeLines = payment.paymentLines.filter((l) =>
    chequeMethodIds.includes(l.paymentMethodId.toString())
  ).length;

  const totalLines = payment.paymentLines.length;

  //   Determine payment status
  if (hasPending) {
    payment.status = "pending_clearance";
  } else if (hasBounced && totalChequeLines === totalLines) {
    // All lines are cheque, all bounced
    payment.status = "voided";
  } else if (hasBounced && totalChequeLines < totalLines) {
    // Mixed payment (cash + cheque) and some cheques bounced
    payment.status = "partially_cleared";
  } else if (allCleared) {
    payment.status = "completed";
  }

  //   Update notes safely
  const bounceNotes = cheques
    .filter((chq) => chq.status === "bounced")
    .map((chq) => {
      const date = chq.clearingDate
        ? new Date(chq.clearingDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      return `• Cheque #${chq.chequeNumber} bounced on ${date}`;
    })
    .join("\n");

  if (bounceNotes) {
    const existingNote = payment.notes?.trim() || "";
    const combinedNotes = existingNote ? `${existingNote}\n${bounceNotes}` : bounceNotes;
    payment.notes = combinedNotes;
  }

  payment.paymentLines.forEach((line) => {
    if (line.referenceNumber === cheques.chequeNumber) {
      line.status = "bounced";
    }
  });

  await payment.save();
}
/**
 * Handles cheque lifecycle status updates and accounting.
 */
class ChequeService {
  async updateChequeStatus(models, { chequeId, newStatus, userId, baseCurrency }) {
    const { Cheque, Payment, PaymentMethod, Account, SalesInvoice, SupplierInvoice } = models;

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

    const chequePaymentLine = payment.paymentLines.find(
      (line) => line.referenceNumber === cheque.chequeNumber
    );
    if (!chequePaymentLine) throw new Error("Cheque line not found on payment.");

    const paymentMethod = chequePaymentLine.paymentMethodId;
    const holdingAccount = await Account.findById(paymentMethod.holdingAccountId);
    const finalBankAccount = await Account.findById(paymentMethod.linkedAccountId);

    if (!holdingAccount || !finalBankAccount) {
      throw new Error("Linked bank or holding account not configured properly.");
    }

    const amountInBase = chequePaymentLine.amount || payment.totalAmount;
    let journalDescription = "";
    let journalEntries = [];

    console.log(
      `[Cheque] Processing cheque #${cheque.chequeNumber}, Direction: ${cheque.direction}, New Status: ${newStatus}`
    );

    if (newStatus === "cleared") {
      journalDescription = `Cleared cheque #${cheque.chequeNumber}`;

      journalEntries =
        cheque.direction === "inflow"
          ? [
              { accountId: finalBankAccount._id, debit: amountInBase },
              { accountId: holdingAccount._id, credit: amountInBase },
            ]
          : [
              { accountId: holdingAccount._id, debit: amountInBase },
              { accountId: finalBankAccount._id, credit: amountInBase },
            ];
    } else if (newStatus === "bounced") {
      const SourceModel = models[payment.paymentSourceType];
      const sourceDoc = await SourceModel.findById(payment.paymentSourceId).populate({
        path: payment.paymentSourceType === "SalesInvoice" ? "customerId" : "supplierId",
        select: "ledgerAccountId name",
      });

      const ledgerAccountId =
        sourceDoc.customerId?.ledgerAccountId || sourceDoc.supplierId?.ledgerAccountId;

      if (!ledgerAccountId) {
        throw new Error("Entity ledger account not found for bounced cheque reversal.");
      }

      journalDescription = `Bounced cheque #${cheque.chequeNumber}`;

      journalEntries =
        cheque.direction === "inflow"
          ? [
              { accountId: ledgerAccountId, debit: amountInBase },
              { accountId: holdingAccount._id, credit: amountInBase },
            ]
          : [
              { accountId: holdingAccount._id, debit: amountInBase },
              { accountId: ledgerAccountId, credit: amountInBase },
            ];
    } else {
      throw new Error(`Invalid cheque status: ${newStatus}`);
    }

    // 1. Post journal entry
    await accountingService.createJournalEntry(models, {
      description: journalDescription,
      entries: journalEntries,
      currency: baseCurrency,
      exchangeRateToBase: 1,
      refs: { paymentId: payment._id },
    });

    // 2. Update cheque document
    cheque.status = newStatus;
    cheque.clearingDate = new Date();
    await cheque.save();

    if (newStatus === "bounced" || newStatus === "cleared") {
      await updatePaymentStatusAfterChequeBounce(models, payment._id);
    }

    // 3. Recalculate and update the invoice status
    await recalculateInvoicePayments(models, {
      sourceId: payment.paymentSourceId,
      sourceType: payment.paymentSourceType,
    });

    console.log(`[Cheque] Status updated to ${newStatus} and invoice recalculated.`);

    return cheque;
  }
}

module.exports = new ChequeService();
