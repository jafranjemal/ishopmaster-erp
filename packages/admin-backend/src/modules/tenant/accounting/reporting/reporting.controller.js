const asyncHandler = require("../../../../middleware/asyncHandler");
const consolidationService = require("../../../../services/consolidation.service");

// @desc    Generate a consolidated Profit & Loss statement
// @route   POST /api/v1/tenant/accounting/reports/consolidated-pl
exports.generateConsolidatedPL = asyncHandler(async (req, res, next) => {
  const { entityIds, startDate, endDate } = req.body;

  if (!entityIds || !startDate || !endDate) {
    return res
      .status(400)
      .json({ success: false, error: "Entity IDs, start date, and end date are required." });
  }

  // 1. Get the consolidated raw data from the service
  const { trialBalance } = await consolidationService.generateConsolidatedTrialBalance(req.models, {
    entityIds,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  // 2. Format the trial balance into a P&L structure
  const revenueAccounts = trialBalance.filter((acc) => acc.accountType === "Revenue");
  const cogsAccounts = trialBalance.filter(
    (acc) => acc.accountType === "Expense" && acc.accountSubType === "COGS"
  );
  const expenseAccounts = trialBalance.filter(
    (acc) => acc.accountType === "Expense" && acc.accountSubType !== "COGS"
  );

  const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0) * -1; // Credits are negative, so we invert
  const totalCOGS = cogsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const grossProfit = totalRevenue - totalCOGS;

  const totalOperatingExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  // 3. Return the structured report
  const report = {
    period: { startDate, endDate },
    revenue: {
      total: totalRevenue,
      accounts: revenueAccounts,
    },
    costOfGoodsSold: {
      total: totalCOGS,
      accounts: cogsAccounts,
    },
    grossProfit,
    operatingExpenses: {
      total: totalOperatingExpenses,
      accounts: expenseAccounts,
    },
    netProfit,
  };

  res.status(200).json({ success: true, data: report });
});
