/**
 * Enhanced Invoice Recalculation with Session Support
 * @param {Object} models - Mongoose models
 * @param {Object} params - { sourceId, sourceType }
 * @param {ClientSession} [session] - Optional Mongoose session
 * @param {Boolean} [isRetry=false] - Internal retry flag for session conflicts
 */
async function recalculateInvoicePayments(
  models,
  { sourceId, sourceType },
  session = null,
  isRetry = false
) {
  const { Payment } = models;

  try {
    // 1. Validate Inputs
    const SourceModel = models[sourceType];
    if (!SourceModel) throw new Error(`[Recalc] Invalid sourceType: ${sourceType}`);

    // 2. Find Invoice with Session Support
    const query = SourceModel.findById(sourceId);
    if (session) query.session(session);

    const invoice = await query;
    if (!invoice) {
      console.warn(`[Recalc] Invoice not found for ${sourceType} ID: ${sourceId}`);
      return null;
    }

    // 3. Fetch Payments with Session Awareness
    const paymentQuery = Payment.find({
      paymentSourceId: sourceId,
      paymentSourceType: sourceType,
      status: { $ne: "voided" },
    }).populate("paymentLines.paymentMethodId");

    if (session) paymentQuery.session(session);
    const payments = await paymentQuery;

    // 4. Calculate Totals with Transaction Awareness
    let totalPaid = 0;
    const paymentDetails = [];

    payments.forEach((payment) => {
      payment.paymentLines.forEach((line) => {
        const method = line.paymentMethodId;
        if (!method || !method.linkedAccountId) {
          throw new Error(`Payment method ${line.paymentMethodId} is invalid/misconfigured`);
        }

        if (["cleared", "completed"].includes(line.status)) {
          totalPaid += line.amount;
          paymentDetails.push({
            paymentId: payment._id,
            method: method.name,
            amount: line.amount,
            status: "counted",
          });
        } else {
          paymentDetails.push({
            paymentId: payment._id,
            method: method.name,
            amount: line.amount,
            status: "skipped",
          });
        }

        console.log("[PaymentDebug] Processing payment lines:", {
          paymentId: payment._id,
          lines: payment.paymentLines.map((line) => ({
            amount: line.amount,
            status: line.status,
            method: line.paymentMethodId?.name,
          })),
          totalPaidSoFar: totalPaid,
        });
      });
    });

    // 5. Determine New Status
    const status =
      Math.abs(invoice.totalAmount - totalPaid) < 0.01
        ? "fully_paid"
        : totalPaid > 0
          ? "partially_paid"
          : "pending_payment";

    // 6. Update Invoice with Session Support
    invoice.amountPaid = totalPaid;

    invoice.amountPaid = totalPaid;
    const amountDue = invoice.totalAmount - totalPaid;

    // --- THE DEFINITIVE FIX: ONLY UPDATE PAYMENT STATUS ---
    if (amountDue <= 0.01) {
      invoice.paymentStatus = "paid";
    } else if (totalPaid > 0) {
      invoice.paymentStatus = "partially_paid";
    } else {
      // Check if the invoice is past its due date
      invoice.paymentStatus =
        invoice.dueDate && new Date(invoice.dueDate) < new Date() ? "overdue" : "unpaid";
    }

    //invoice.status = status;
    // Auto-promote workflow status on first payment
    if (invoice.workflowStatus === "draft" && totalPaid > 0) {
      invoice.workflowStatus = "sent";
    }
    const saveOptions = session ? { session } : {};
    await invoice.save(saveOptions);

    // 7. Return Detailed Results
    const result = {
      invoiceId: invoice._id,
      previousAmountPaid: invoice.amountPaid,
      newAmountPaid: totalPaid,
      previousStatus: invoice.status,
      newStatus: status,
      paymentDetails,
      recalculatedAt: new Date(),
    };

    console.log(`[Recalc ✅] ${sourceType} ${invoice.invoiceNumber || invoice._id}:`, {
      paid: totalPaid,
      status,
      session: session ? "with session" : "no session",
    });

    return result;
  } catch (error) {
    console.error(`[Recalc ❌] Error processing ${sourceType} ${sourceId}:`, error.message);

    // Automatic retry for session conflicts
    if (error.message.includes("Transaction") && !isRetry && session) {
      console.log("[Recalc] Retrying due to transaction conflict...");
      return recalculateInvoicePayments(models, { sourceId, sourceType }, session, true);
    }

    // For session operations, rethrow to trigger rollback
    if (session) throw error;

    return {
      error: error.message,
      sourceId,
      sourceType,
    };
  }
}

// Usage Examples:
// 1. Without session (direct commit)
// await recalculateInvoicePayments(models, { sourceId: '123', sourceType: 'Invoice' });

// 2. With session (for transaction)
// const session = await mongoose.startSession();
// session.startTransaction();
// try {
//   await recalculateInvoicePayments(models, { sourceId: '123', sourceType: 'Invoice' }, session);
//   await session.commitTransaction();
// } catch (error) {
//   await session.abortTransaction();
//   throw error;
// } finally {
//   session.endSession();
// }

module.exports = {
  recalculateInvoicePayments,
};
