const mongoose = require("mongoose");

/**
 * Defines a specific payment method a tenant can use (e.g., "Main Cash Drawer", "Credit Card Terminal").
 * This allows for dynamic configuration of how payments are accepted and recorded.
 */
const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["cash", "card", "bank_transfer", "cheque", "loyalty_points", "custom"],
    },
    /**
     * The crucial link to the financial ledger. This is the Asset account that is
     * affected when a payment is made or received using this method (e.g., "Cash In Hand", "Main Bank Account").
     */
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    /**
     * Determines which type of customer can use this payment method.
     * 'all' -> Everyone, including Walk-in Customers
     * 'registered_customers' -> Only customers with an account
     */
    allowedFor: {
      type: String,
      enum: ["all", "registered_customers"],
      default: "all",
    },
    /**
     * For payment types that require a temporary holding account, like Cheques.
     * For a received cheque, this would link to 'Cheques in Hand'.
     * For an issued cheque, this would link to 'Cheques Payable'.
     */
    holdingAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = paymentMethodSchema;
