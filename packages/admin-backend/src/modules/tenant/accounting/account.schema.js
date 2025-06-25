const mongoose = require("mongoose");

/**
 * The definitive schema for an account in the Chart of Accounts.
 * This model is the foundational element for all financial transactions and reporting.
 */
const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Account name is required."],
      trim: true,
      unique: true, // Account names must be unique within a tenant's database.
    },
    // Standard accounting code for organization and reporting.
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values.
      index: true,
    },
    // The primary financial category of the account. This is strictly controlled.
    type: {
      type: String,
      required: true,
      enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
    },
    // A more specific classification for detailed reporting.
    subType: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // The current running balance of the account.
    balance: {
      type: Number,
      default: 0,
    },
    // A flag to protect core system accounts from user deletion.
    isSystemAccount: {
      type: Boolean,
      default: false,
    },
    // A flag to allow users to deactivate unused accounts instead of deleting them.
    isActive: {
      type: Boolean,
      default: true,
    },
    // Allows for creating a hierarchical chart of accounts.
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
  },
  { timestamps: true }
);

// This ensures that for any given tenant, the combination of name and parentId is unique.
// This allows two sub-accounts to have the name "Bank", if they are under different parents.
accountSchema.index({ name: 1, parentId: 1 }, { unique: true });

module.exports = accountSchema;
