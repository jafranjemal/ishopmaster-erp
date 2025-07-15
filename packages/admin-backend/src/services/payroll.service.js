// const mongoose = require("mongoose");
// const accountingService = require("./accounting.service");

// /**
//  * The PayrollService handles the business logic for calculating and processing payroll.
//  */
// class PayrollService {
//   /**
//    * Runs the payroll for a specified period, generating payslips and financial entries.
//    * This version is optimized to use bulk operations and creates a summary PayrollRun document.
//    * It is designed to be called from within a `withTransaction` block in a controller.
//    * @param {object} models - The tenant's compiled models.
//    * @param {object} data - Data for the payroll run.
//    * @param {string} data.baseCurrency - The tenant's base currency.
//    */
//   async runPayrollForPeriod(models, { startDate, endDate, userId, baseCurrency }, session) {
//     const { Employee, Commission, Payslip, Account, DeductionRule, PayrollRun, EmployeeBenefit } =
//       models;

//     // 1. Fetch all active employees and deduction rules once for efficiency
//     const [employees, deductionRules] = await Promise.all([
//       Employee.find({ isActive: true }).session(session),
//       DeductionRule.find({ isActive: true }).populate("linkedAccountId").session(session),
//     ]);

//     let grandTotalGrossPay = 0;
//     let grandTotalNetPay = 0;
//     const allJournalCredits = [];
//     const payslipsToCreate = [];
//     const processedCommissionIds = [];

//     // 2. Calculate payslip for each employee
//     for (const employee of employees) {
//       const commissions = await Commission.find({
//         employeeId: employee._id,
//         status: "pending",
//         saleDate: { $gte: startDate, $lte: endDate },
//       }).session(session);
//       const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
//       const baseSalary = employee.compensation.baseSalary || 0;
//       const grossPay = baseSalary + totalCommissions;

//       let totalDeductions = 0;
//       const deductionBreakdown = [];

//       // Apply each deduction rule
//       for (const rule of deductionRules) {
//         let deductionAmount = 0;
//         if (rule.type === "percentage") {
//           deductionAmount = grossPay * (rule.value / 100);
//         } else {
//           // 'fixed'
//           deductionAmount = rule.value;
//         }

//         if (deductionAmount > 0) {
//           deductionBreakdown.push({ ruleName: rule.name, amount: deductionAmount });
//           totalDeductions += deductionAmount;

//           // Add this deduction to the list for the final journal entry
//           allJournalCredits.push({ accountId: rule.linkedAccountId._id, amount: deductionAmount });
//         }
//       }

//       // --- UPGRADE: Apply benefits ---
//       const activeBenefits = await models.EmployeeBenefit.find({
//         employeeId: employee._id,
//         startDate: { $lte: endDate },
//         $or: [{ endDate: { $gte: startDate } }, { endDate: null }],
//       }).populate("benefitTypeId");

//       activeBenefits.forEach((benefit) => {
//         if (benefit.benefitTypeId.type === "deduction") {
//           const deductionAmount = benefit.amount;
//           deductionBreakdown.push({
//             ruleName: benefit.benefitTypeId.name,
//             amount: deductionAmount,
//           });
//           totalDeductions += deductionAmount;
//         }
//         // Logic for 'contribution' would affect employer costs, not net pay.
//       });

//       const netPay = grossPay - totalDeductions;
//       if (netPay < 0) {
//         // In a real system, you might have more complex rules for this scenario
//         console.warn(`Warning: Employee ${employee.name} has a negative net pay.`);
//       }

//       grandTotalGrossPay += grossPay;
//       grandTotalNetPay += netPay;

//       if (netPay > 0) {
//         payslipsToCreate.push({
//           employeeId: employee._id,
//           payPeriod: { startDate, endDate },
//           baseSalary,
//           totalCommissions,
//           deductions: deductionBreakdown,
//           totalDeductions,
//           netPay,
//         });
//         processedCommissionIds.push(...commissions.map((c) => c._id));
//       }
//     }

//     // 3. Perform bulk database operations
//     if (payslipsToCreate.length === 0) {
//       return {
//         success: true,
//         message: "No payroll to process for this period.",
//         totalPayrollAmount: 0,
//         payslipsGenerated: 0,
//       };
//     }

//     // Perform bulk operations for efficiency
//     const generatedPayslips = await Payslip.insertMany(payslipsToCreate, { session });

//     if (processedCommissionIds.length > 0) {
//       await Commission.updateMany(
//         { _id: { $in: processedCommissionIds } },
//         { $set: { status: "paid" } },
//         { session }
//       );
//     }

//     // Create the summary PayrollRun document
//     const lastRun = await PayrollRun.findOne().sort({ createdAt: -1 }).session(session);
//     let lastNumber = 0;
//     if (lastRun && lastRun.runId) {
//       lastNumber = parseInt(lastRun.runId.split("-")[1]);
//     }
//     const newRunId = "PR-" + String(lastNumber + 1).padStart(7, "0");

//     await PayrollRun.create(
//       [
//         {
//           runId: newRunId,
//           period: `${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`,
//           processedBy: userId,
//           employeeCount: generatedPayslips.length,
//           totalPayout: grandTotalGrossPay,
//           payslips: generatedPayslips.map((p) => p._id),
//         },
//       ],
//       { session }
//     );

//     // 4. Post the single, compound journal entry for the entire payroll run
//     if (grandTotalGrossPay > 0) {
//       const [salariesExpenseAccount, salariesPayableAccount] = await Promise.all([
//         Account.findOne({ isSystemAccount: true, name: "Salaries Expense" }).session(session),
//         Account.findOne({ isSystemAccount: true, name: "Salaries Payable" }).session(session),
//       ]);

//       if (!salariesExpenseAccount || !salariesPayableAccount) {
//         throw new Error(
//           "Critical accounting accounts (Salaries Expense or Salaries Payable) are not configured."
//         );
//       }

//       // Add a credit for each deduction type
//       for (const deduction of allJournalCredits) {
//         journalEntries.push({ accountId: deduction.accountId, credit: deduction.amount });
//       }

//       // Build the compound journal entry
//       const journalEntries = [
//         { accountId: salariesExpenseAccount._id, debit: grandTotalGrossPay }, // One debit for the total expense
//         { accountId: salariesPayableAccount._id, credit: grandTotalNetPay }, // Credit for the net pay owed
//       ];

//       // This call now matches the definitive architecture you provided for the AccountingService.
//       await accountingService.createJournalEntry(
//         models,
//         {
//           description: `Payroll for period ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
//           entries: journalEntries,
//           currency: baseCurrency || "LKR", // This should be the tenant's base currency
//           exchangeRateToBase: 1,
//         },
//         session
//       );
//     }

//     return {
//       success: true,
//       message: `Payroll completed for ${employees.length} employees.`,
//       totalPayrollAmount: grandTotalGrossPay,
//       payslipsGenerated: generatedPayslips.length,
//     };
//   }
// }

// module.exports = new PayrollService();

const mongoose = require("mongoose");
const accountingService = require("./accounting.service");

class PayrollService {
  async runPayrollForPeriod(models, { startDate, endDate, userId, baseCurrency }, session, tenant) {
    const { Employee, Commission, Payslip, Account, DeductionRule, EmployeeBenefit, PayrollRun } =
      models;

    const [employees, deductionRules] = await Promise.all([
      Employee.find({ isActive: true }).session(session),
      DeductionRule.find({ isActive: true }).populate("linkedAccountId").session(session),
    ]);

    if (employees.length === 0) throw new Error("No active employees found to run payroll for.");

    let grandTotalGrossPay = 0;
    let grandTotalNetPay = 0;
    const journalCreditEntries = new Map();
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
      const grossPay = baseSalary + totalCommissions;

      let totalDeductions = 0;
      const deductionBreakdown = [];
      const benefitsBreakdown = [];

      // Apply statutory deduction rules
      for (const rule of deductionRules) {
        let deductionAmount =
          rule.type === "percentage" ? grossPay * (rule.value / 100) : rule.value;
        if (deductionAmount > 0) {
          deductionBreakdown.push({ ruleName: rule.name, amount: deductionAmount });
          totalDeductions += deductionAmount;
          const accountId = rule.linkedAccountId._id.toString();
          journalCreditEntries.set(
            accountId,
            (journalCreditEntries.get(accountId) || 0) + deductionAmount
          );
        }
      }

      // Apply assigned benefit deductions
      const activeBenefits = await EmployeeBenefit.find({
        employeeId: employee._id,
        startDate: { $lte: endDate },
        $or: [{ endDate: { $gte: startDate } }, { endDate: null }],
      })
        .populate("benefitTypeId")
        .session(session);
      for (const benefit of activeBenefits) {
        if (benefit.benefitTypeId.type === "deduction") {
          const deductionAmount = benefit.amount;
          benefitsBreakdown.push({
            benefitName: benefit.benefitTypeId.name,
            amount: deductionAmount,
            type: "deduction",
          });
          totalDeductions += deductionAmount;
          const accountId = benefit.benefitTypeId.linkedLiabilityAccountId.toString();
          journalCreditEntries.set(
            accountId,
            (journalCreditEntries.get(accountId) || 0) + deductionAmount
          );
        }
      }

      const netPay = grossPay - totalDeductions;
      grandTotalGrossPay += grossPay;
      grandTotalNetPay += netPay;

      if (netPay > 0) {
        payslipsToCreate.push({
          employeeId: employee._id,
          payPeriod: { startDate, endDate },
          baseSalary,
          totalCommissions,
          deductions: deductionBreakdown,
          benefits: benefitsBreakdown,
          totalDeductions,
          netPay,
        });
        processedCommissionIds.push(...commissions.map((c) => c._id));
      }
    }

    if (payslipsToCreate.length > 0) {
      const generatedPayslips = await Payslip.insertMany(payslipsToCreate, { session });
      if (processedCommissionIds.length > 0) {
        await Commission.updateMany(
          { _id: { $in: processedCommissionIds } },
          { $set: { status: "paid" } },
          { session }
        );
      }
      const lastRun = await PayrollRun.findOne().sort({ createdAt: -1 }).session(session);
      const newRunId =
        "PR-" + String((parseInt(lastRun?.runId.split("-")[1]) || 0) + 1).padStart(7, "0");
      await PayrollRun.create(
        [
          {
            runId: newRunId,
            period: `${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`,
            processedBy: userId,
            employeeCount: generatedPayslips.length,
            totalPayout: grandTotalNetPay,
            payslips: generatedPayslips.map((p) => p._id),
          },
        ],
        { session }
      );
    }

    if (grandTotalGrossPay > 0) {
      const [salariesExpenseAccount, salariesPayableAccount] = await Promise.all([
        Account.findOne({ isSystemAccount: true, name: "Salaries Expense" }).session(session),
        Account.findOne({ isSystemAccount: true, name: "Salaries Payable" }).session(session),
      ]);
      if (!salariesExpenseAccount || !salariesPayableAccount)
        throw new Error("Critical payroll accounting accounts are not configured.");

      const journalEntries = [
        { accountId: salariesExpenseAccount._id, debit: grandTotalGrossPay },
        { accountId: salariesPayableAccount._id, credit: grandTotalNetPay },
      ];
      for (const [accountId, amount] of journalCreditEntries.entries()) {
        journalEntries.push({ accountId: new mongoose.Types.ObjectId(accountId), credit: amount });
      }

      await accountingService.createJournalEntry(
        models,
        {
          description: `Payroll for period: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
          entries: journalEntries,
          currency: baseCurrency,
          exchangeRateToBase: 1,
        },
        session,
        tenant
      );
    }

    return {
      success: true,
      message: `Payroll completed for ${employees.length} employees.`,
      totalPayrollAmount: grandTotalNetPay,
    };
  }
}

module.exports = new PayrollService();
