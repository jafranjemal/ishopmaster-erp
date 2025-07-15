const mongoose = require("mongoose");

class ConsolidationService {
  /**
   * Generates a consolidated trial balance for a given set of entities and a date range.
   * It fetches all relevant ledger entries and eliminates inter-company transactions.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - The criteria for the report.
   * @param {string[]} data.entityIds - An array of Branch IDs to include.
   * @param {Date} data.startDate - The start date of the period.
   * @param {Date} data.endDate - The end date of the period.
   * @returns {Promise<object>} An object containing the consolidated trial balance and summary.
   */
  async generateConsolidatedTrialBalance(models, { entityIds, startDate, endDate }) {
    const { LedgerEntry } = models;

    const objectIdEntityIds = entityIds.map((id) => new mongoose.Types.ObjectId(id));

    const pipeline = [
      // 1. Filter for entries within the date range and for the selected entities
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          entityId: { $in: objectIdEntityIds },
        },
      },
      // 2. Unwind the debit/credit into a single stream for easier processing
      {
        $project: {
          description: 1,
          date: 1,
          amountInBaseCurrency: 1,
          // Create a unified 'accountId' field
          accountId: { $ifNull: ["$debitAccountId", "$creditAccountId"] },
          // Create a unified 'amount' field (debits are positive, credits are negative)
          amount: {
            $subtract: [{ $ifNull: ["$debitAmount", 0] }, { $ifNull: ["$creditAmount", 0] }],
          }, // This assumes ledger schema has debit/credit amount fields
        },
      },
      // 3. Lookup the account details for each entry
      {
        $lookup: {
          from: "accounts",
          localField: "accountId",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },
      // 4. Group by account and sum the amounts, separating inter-company transactions
      {
        $group: {
          _id: "$accountId",
          accountName: { $first: "$account.name" },
          accountType: { $first: "$account.type" },
          isInterCompany: { $first: "$account.isInterCompany" },
          totalBalance: { $sum: "$amount" },
        },
      },
      // 5. Facet to separate inter-company from external for elimination check
      {
        $facet: {
          externalTransactions: [{ $match: { isInterCompany: { $ne: true } } }],
          interCompanyTransactions: [{ $match: { isInterCompany: true } }],
        },
      },
    ];

    const [result] = await LedgerEntry.aggregate(pipeline);

    const { externalTransactions, interCompanyTransactions } = result;

    // 6. Elimination Logic: The sum of all inter-company transactions should be zero.
    const interCompanyNet = interCompanyTransactions.reduce(
      (sum, entry) => sum + entry.totalBalance,
      0
    );
    if (Math.abs(interCompanyNet) > 1e-9) {
      // In a real system, you might log this as a critical warning instead of throwing an error.
      console.warn(
        `Consolidation Warning: Inter-company accounts are unbalanced by ${interCompanyNet}.`
      );
    }

    // 7. Final Trial Balance
    const trialBalance = externalTransactions.map((acc) => ({
      accountName: acc.accountName,
      accountType: acc.accountType,
      balance: parseFloat(acc.totalBalance.toFixed(2)),
    }));

    // 8. Final check to ensure the entire trial balance nets to zero
    const finalNet = trialBalance.reduce((sum, entry) => sum + entry.balance, 0);
    if (Math.abs(finalNet) > 1e-9) {
      throw new Error(
        `Consolidated Trial Balance is unbalanced by ${finalNet}. Check accounting entries.`
      );
    }

    return {
      trialBalance,
      eliminationSummary: {
        netBalance: interCompanyNet,
        transactionCount: interCompanyTransactions.length,
      },
    };
  }
}

module.exports = new ConsolidationService();
