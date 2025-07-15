const mongoose = require("mongoose");

/**
 * Defines a single budget line item for a specific account and period.
 * Allows for granular budgeting by branch or department.
 */
const budgetSchema = new mongoose.Schema(
  {
    financialPeriodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialPeriod",
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    // Optional fields for more granular budgeting
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Ensure only one budget entry exists for a unique combination of period, account, branch, and department.
budgetSchema.index(
  { financialPeriodId: 1, accountId: 1, branchId: 1, departmentId: 1 },
  { unique: true }
);

module.exports = budgetSchema;
