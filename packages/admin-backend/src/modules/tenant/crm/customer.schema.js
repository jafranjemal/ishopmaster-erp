const mongoose = require("mongoose");

// Reusable address schema for consistency
const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: addressSchema,
    creditLimit: {
      type: Number,
      default: 0,
    },
    // This critical field will link to the ChartOfAccounts model.
    ledgerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    loyaltyCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoyaltyCard", // For a future module
      default: null,
    },
    /**
     * Links this customer to a specific customer group for pricing and marketing.
     */
    customerGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerGroup",
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isSystemCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = customerSchema;
