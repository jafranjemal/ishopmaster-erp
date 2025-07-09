const mongoose = require("mongoose");

class ShiftService {
  /**
   * Opens a new shift for a user at a specific branch.
   */
  async openShift(models, { userId, employeeId, branchId, openingFloat }) {
    const { ShiftSummary } = models;
    const existingShift = await ShiftSummary.findOne({ userId, status: "open" });
    if (existingShift) {
      throw new Error("User already has an open shift. Please close it before starting a new one.");
    }
    const newShift = await ShiftSummary.create({ userId, employeeId, branchId, openingFloat });
    return newShift;
  }

  /**
   * Closes an existing shift and performs cash reconciliation.
   */
  async closeShiftOld(models, { shiftId, userId, closingFloat }) {
    const { ShiftSummary, Payment } = models;
    const shift = await ShiftSummary.findById(shiftId);
    if (!shift || shift.status !== "open" || shift.userId.toString() !== userId) {
      throw new Error("Active shift not found for this user or it is already closed.");
    }

    // Find all cash payments for this user/branch during the shift's timeframe
    const payments = await Payment.aggregate([
      {
        $match: {
          processedBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: shift.shift_start },
          "paymentLines.paymentMethodId": { $exists: true }, // Ensure lines exist
        },
      },
      { $unwind: "$paymentLines" },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentLines.paymentMethodId",
          foreignField: "_id",
          as: "method",
        },
      },
      { $unwind: "$method" },
      { $match: { "method.type": "cash" } },
      {
        $group: {
          _id: "$direction",
          total: { $sum: "$paymentLines.amount" },
        },
      },
    ]);

    const cashIn = payments.find((p) => p._id === "inflow")?.total || 0;
    const cashOut = payments.find((p) => p._id === "outflow")?.total || 0;

    const expectedClosingFloat = shift.openingFloat + cashIn - cashOut;
    const cashVariance = closingFloat - expectedClosingFloat;

    // Update the shift summary record
    shift.shift_end = new Date();
    shift.status = "closed";
    shift.calculatedCashIn = cashIn;
    shift.calculatedCashOut = cashOut;
    shift.expectedClosingFloat = expectedClosingFloat;
    shift.closingFloat = closingFloat;
    shift.cashVariance = cashVariance;

    await shift.save();
    return shift;
  }

  /**
   * Closes an existing shift and performs a full, professional cash reconciliation.
   */
  async closeShift(models, { shiftId, userId, closingFloat }) {
    const { ShiftSummary, Payment, CashMovement } = models;
    const shift = await ShiftSummary.findOne({ _id: shiftId, userId, status: "open" });
    if (!shift) throw new Error("Active shift not found for this user.");

    // 1. Calculate cash from sales and refunds
    const paymentTotals = await models.Payment.aggregate([
      {
        $match: {
          processedBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: shift.shift_start },
        },
      },
      { $unwind: "$paymentLines" },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentLines.paymentMethodId",
          foreignField: "_id",
          as: "method",
        },
      },
      { $unwind: "$method" },
      { $match: { "method.type": "cash" } },
      { $group: { _id: "$direction", total: { $sum: "$paymentLines.amount" } } },
    ]);
    const cashInFromSales = paymentTotals.find((p) => p._id === "inflow")?.total || 0;
    const cashOutForRefunds = paymentTotals.find((p) => p._id === "outflow")?.total || 0;

    // 2. Calculate cash from Paid In / Paid Out
    const cashMovements = await CashMovement.aggregate([
      { $match: { shiftId: shift._id } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const totalPaidIn = cashMovements.find((m) => m._id === "paid_in")?.total || 0;
    const totalPaidOut = cashMovements.find((m) => m._id === "paid_out")?.total || 0;

    // 3. Perform the definitive calculation
    const expectedClosingFloat =
      shift.openingFloat + cashInFromSales + totalPaidIn - (cashOutForRefunds + totalPaidOut);
    const cashVariance = closingFloat - expectedClosingFloat;

    // 4. Update the shift summary record with all details
    shift.shift_end = new Date();
    shift.status = "closed";
    shift.calculatedCashIn = cashInFromSales;
    shift.calculatedCashOut = cashOutForRefunds;
    shift.calculatedPaidIn = totalPaidIn;
    shift.calculatedPaidOut = totalPaidOut;
    shift.expectedClosingFloat = expectedClosingFloat;
    shift.closingFloat = closingFloat;
    shift.cashVariance = cashVariance;

    await shift.save();
    return shift;
  }
}

module.exports = new ShiftService();
