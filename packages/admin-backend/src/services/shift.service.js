const mongoose = require("mongoose");

class ShiftService {
  /**
   * Opens a new shift for a user at a specific branch.
   */
  async openShift(models, { userId, branchId, openingFloat }) {
    const { ShiftSummary } = models;
    const existingShift = await ShiftSummary.findOne({ userId, status: "open" });
    if (existingShift) {
      throw new Error("User already has an open shift. Please close it before starting a new one.");
    }
    const newShift = await ShiftSummary.create({ userId, branchId, openingFloat });
    return newShift;
  }

  /**
   * Closes an existing shift and performs cash reconciliation.
   */
  async closeShift(models, { shiftId, userId, closingFloat }) {
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
}

module.exports = new ShiftService();
