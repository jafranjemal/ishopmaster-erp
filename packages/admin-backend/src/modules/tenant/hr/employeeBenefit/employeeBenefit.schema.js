const mongoose = require("mongoose");

/**
 * Links a specific employee to a specific benefit type, creating an active benefit record.
 */
const employeeBenefitSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    benefitTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "BenefitType", required: true },
    // The specific amount for this employee (e.g., their monthly insurance premium)
    amount: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // For benefits that have an end date, like a loan
  },
  { timestamps: true }
);

module.exports = employeeBenefitSchema;
