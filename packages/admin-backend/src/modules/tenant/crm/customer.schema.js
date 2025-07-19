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
    /**
     * The maximum amount of credit allowed for this customer.
     * A value of 0 means no credit is extended.
     */
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditTerms: { type: Number, default: 30 }, // days
    allowCredit: { type: Boolean, default: false },
    /**
     * Tracks the current stage of the dunning (payment reminder) process for this customer.
     */
    dunningStatus: {
      type: String,
      enum: ["none", "first_reminder", "second_reminder", "final_notice", "collections"],
      default: "none",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystemCreated: {
      type: Boolean,
      default: false,
    },
    isWalkingCustomer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = customerSchema;
