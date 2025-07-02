const mongoose = require("mongoose");
const accountingService = require("./accounting.service");

/**
 * The PayrollService handles the business logic for calculating and processing payroll.
 */
class PayrollService {
  /**
   * Runs the payroll for a specified period, generating payslips and financial entries.
   * This version is optimized to use bulk operations and creates a summary PayrollRun document.
   * It is designed to be called from within a `withTransaction` block in a controller.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - Data for the payroll run.
   * @param {string} data.baseCurrency - The tenant's base currency.
   */
  async runPayrollForPeriod(models, { startDate, endDate, userId, baseCurrency }, session) {
    const { Employee, Commission, Payslip, Account, PayrollRun } = models;

    const employees = await Employee.find({ isActive: true }).session(session);
    if (employees.length === 0) {
      throw new Error("No active employees found to run payroll for.");
    }

    let grandTotalPayroll = 0;
    const payslipsToCreate = [];
    const processedCommissionIds = [];

    for (const employee of employees) {
      const commissions = await Commission.find({
        employeeId: employee._id,
        status: "pending",
        saleDate: { $gte: startDate, $lte: endDate },
      }).session(session);

      const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
      const baseSalary = employee.compensation.baseSalary || 0;
      const netPay = baseSalary + totalCommissions;

      grandTotalPayroll += netPay;

      if (netPay > 0) {
        payslipsToCreate.push({
          employeeId: employee._id,
          payPeriod: { startDate, endDate },
          baseSalary,
          totalCommissions,
          netPay,
        });
        processedCommissionIds.push(...commissions.map((c) => c._id));
      }
    }

    if (payslipsToCreate.length === 0) {
      return {
        success: true,
        message: "No payroll to process for this period.",
        totalPayrollAmount: 0,
        payslipsGenerated: 0,
      };
    }

    // Perform bulk operations for efficiency
    const generatedPayslips = await Payslip.insertMany(payslipsToCreate, { session });

    if (processedCommissionIds.length > 0) {
      await Commission.updateMany(
        { _id: { $in: processedCommissionIds } },
        { $set: { status: "paid" } },
        { session }
      );
    }

    // Create the summary PayrollRun document
    const lastRun = await PayrollRun.findOne().sort({ createdAt: -1 }).session(session);
    let lastNumber = 0;
    if (lastRun && lastRun.runId) {
      lastNumber = parseInt(lastRun.runId.split("-")[1]);
    }
    const newRunId = "PR-" + String(lastNumber + 1).padStart(7, "0");

    await PayrollRun.create(
      [
        {
          runId: newRunId,
          period: `${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`,
          processedBy: userId,
          employeeCount: generatedPayslips.length,
          totalPayout: grandTotalPayroll,
          payslips: generatedPayslips.map((p) => p._id),
        },
      ],
      { session }
    );

    // Post the final, balanced journal entry to the accounting service
    if (grandTotalPayroll > 0) {
      const [salariesExpenseAccount, salariesPayableAccount] = await Promise.all([
        Account.findOne({ isSystemAccount: true, name: "Salaries Expense" }).session(session),
        Account.findOne({ isSystemAccount: true, name: "Salaries Payable" }).session(session),
      ]);

      if (!salariesExpenseAccount || !salariesPayableAccount) {
        throw new Error(
          "Critical accounting accounts (Salaries Expense or Salaries Payable) are not configured."
        );
      }

      // This call now matches the definitive architecture you provided for the AccountingService.
      await accountingService.createJournalEntry(
        models,
        {
          description: `Payroll for period: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
          entries: [
            { accountId: salariesExpenseAccount._id, debit: grandTotalPayroll },
            { accountId: salariesPayableAccount._id, credit: grandTotalPayroll },
          ],
          currency: baseCurrency,
          exchangeRateToBase: 1, // Payroll is always processed in the base currency
        },
        session // Explicitly pass the session
      );
    }

    return {
      success: true,
      message: `Payroll completed for ${employees.length} employees.`,
      totalPayrollAmount: grandTotalPayroll,
      payslipsGenerated: generatedPayslips.length,
    };
  }
}

module.exports = new PayrollService();
