const mongoose = require("mongoose");

/**
 * Defines a configurable rule for statutory or other deductions from an employee's salary.
 * e.g., "Employee EPF Contribution", "PAYE Tax Bracket 1"
 */
const deductionRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    value: {
      type: Number,
      required: true,
    },
    /**
     * The crucial link to the financial ledger. This is the Liability account
     * where the deducted funds are held before being paid to the government entity.
     * e.g., "EPF Payable", "PAYE Tax Payable"
     */
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = deductionRuleSchema;
