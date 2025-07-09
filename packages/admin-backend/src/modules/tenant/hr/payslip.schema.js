const mongoose = require("mongoose");

/**
 * Defines the final, generated payslip for an employee for a specific pay period.
 */
const deductionLineSchema = new mongoose.Schema(
  {
    ruleName: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

// --- NEW SUB-SCHEMA FOR DETAILED BENEFITS ---
const benefitLineSchema = new mongoose.Schema(
  {
    benefitName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ["deduction", "contribution"] },
  },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    payslipId: {
      // A user-friendly, sequential ID
      type: String,
      required: true,
      unique: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    payPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },

    benefits: [benefitLineSchema],
    // Earnings
    baseSalary: { type: Number, required: true },
    totalCommissions: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },

    // Deductions
    // This now stores a detailed breakdown of all applied deductions.
    deductions: [deductionLineSchema],
    totalDeductions: { type: Number, default: 0 }, // Store the sum for easy access

    // Final Calculation
    netPay: { type: Number, required: true },

    status: {
      type: String,
      enum: ["generated", "paid"],
      default: "generated",
    },
    paymentDate: { type: Date },
  },
  { timestamps: true }
);

payslipSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastPayslip = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastPayslip && lastPayslip.payslipId) {
      lastNumber = parseInt(lastPayslip.payslipId.split("-")[1]);
    }
    this.payslipId = "PS-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = payslipSchema;
