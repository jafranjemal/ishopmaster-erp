const mongoose = require("mongoose");

/**
 * Defines a type of benefit offered by the company.
 * e.g., "Premium Health Insurance", "Staff Loan Program"
 */
const benefitTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    // 'deduction' is taken from employee pay, 'contribution' is paid by company
    type: {
      type: String,
      required: true,
      enum: ["deduction", "contribution"],
      default: "deduction",
    },
    linkedExpenseAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // For company contributions
    linkedLiabilityAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // For deductions to be paid out
  },
  { timestamps: true }
);

module.exports = benefitTypeSchema;
