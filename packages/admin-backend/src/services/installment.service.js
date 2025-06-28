const paymentsService = require("./payments.service");
const mongoose = require("mongoose");

/**
 * The InstallmentService handles the business logic for creating and managing
 * payment plans and applying payments to individual installments.
 */
class InstallmentService {
  /**
   * Creates a new installment plan with a calculated schedule.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - Data for the new payment plan.
   * @param {string} data.paymentSourceId - The ID of the source document (e.g., SalesInvoice).
   * @param {string} data.paymentSourceType - The model name of the source.
   * @param {number} data.totalAmount - The total amount for the plan.
   * @param {number} data.numberOfInstallments - The number of payments in the plan.
   * @param {Date} data.startDate - The date of the first installment.
   * @param {string} data.frequency - e.g., 'monthly'.
   * @param {string} userId - The ID of the user creating the plan.
   */
  async createInstallmentPlan(
    models,
    {
      paymentSourceId,
      paymentSourceType,
      totalAmount,
      numberOfInstallments,
      startDate,
      frequency,
    },
    userId
  ) {
    const { PaymentPlan } = models;

    if (numberOfInstallments <= 0) {
      throw new Error("Number of installments must be greater than zero.");
    }

    const installmentAmount =
      Math.floor((totalAmount / numberOfInstallments) * 100) / 100;
    const remainder = totalAmount - installmentAmount * numberOfInstallments;

    const installments = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numberOfInstallments; i++) {
      let amount = installmentAmount;
      if (i === numberOfInstallments - 1) {
        amount += remainder; // Add remainder to the last installment
      }

      installments.push({
        dueDate: new Date(currentDate),
        amountDue: parseFloat(amount.toFixed(2)),
        status: "pending",
      });

      // For now, we only support monthly frequency
      if (frequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    const [newPlan] = await PaymentPlan.create([
      {
        paymentSourceId,
        paymentSourceType,
        totalAmount,
        installments,
        createdBy: userId,
      },
    ]);

    return newPlan;
  }

  /**
   * Applies a payment to a specific installment line within a plan.
   * This will be fully implemented when building the POS/Sales payment UI.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - Data for the payment.
   * @param {string} data.planId - The ID of the PaymentPlan.
   * @param {string} data.lineId - The ID of the specific installment line being paid.
   * @param {object} data.paymentData - The data for the universal Payment record.
   * @param {string} userId - The ID of the user processing the payment.
   * @param {string} baseCurrency - The tenant's base currency.
   */
  async applyPaymentToInstallment(
    models,
    { planId, lineId, paymentData },
    userId,
    baseCurrency
  ) {
    console.log(`Applying payment to Plan: ${planId}, Line: ${lineId}`);
    // 1. Find PaymentPlan by planId.
    // 2. Find the specific installment line by lineId within the plan's installments array.
    // 3. Validate: Check if line status is 'pending' and if payment amount matches amountDue.
    // 4. Call `paymentsService.recordPayment(...)`, passing the main SalesInvoice as the source.
    // 5. Get the returned `_id` of the new Payment document.
    // 6. Update the installment line: set status to 'paid' and link the `paymentId`.
    // 7. Check if all installments are now 'paid'. If so, update the parent PaymentPlan status to 'completed'.
    // 8. Save the PaymentPlan document.
    return {
      success: true,
      message: "This feature will be implemented in a future chapter.",
    };
  }
}

module.exports = new InstallmentService();
