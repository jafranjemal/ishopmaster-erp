/**
 * Recalculates the amountPaid and status of any invoice after payments/cheques are processed.
 */
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

module.exports = {
  recalculateInvoicePayments,
};
