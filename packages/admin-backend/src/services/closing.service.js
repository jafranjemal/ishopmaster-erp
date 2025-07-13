class ClosingService {
  /**
   * Runs all pre-closing validations for a given period.
   */
  async runValidations(models, { periodId }) {
    const { BankStatement } = models;
    const period = await models.FinancialPeriod.findById(periodId);
    if (!period) throw new Error("Financial period not found.");

    const validationResults = [];

    // Validation 1: Check for unreconciled bank statements in the period.
    const unreconciledStatements = await BankStatement.countDocuments({
      statementDate: { $gte: period.startDate, $lte: period.endDate },
      status: "pending",
    });
    validationResults.push({
      task: "All bank accounts reconciled",
      isCompleted: unreconciledStatements === 0,
      details: `${unreconciledStatements} unreconciled statement(s) found.`,
    });

    // Add other validations here (e.g., check for un-invoiced GRNs)

    return validationResults;
  }

  /**
   * Closes a financial period after ensuring all validations pass.
   */
  async closePeriod(models, { periodId, userId }) {
    const validations = await this.runValidations(models, { periodId });
    const allTasksCompleted = validations.every((v) => v.isCompleted);

    if (!allTasksCompleted) {
      throw new Error("Cannot close period. Not all pre-closing tasks are complete.");
    }

    const period = await models.FinancialPeriod.findById(periodId);
    period.status = "Closed";
    period.closedBy = userId;
    period.closedAt = new Date();
    await period.save();

    return period;
  }
}
module.exports = new ClosingService();
