const mongoose = require("mongoose");

// We can reuse the saleItemSchema or create a dedicated opportunityItemSchema
// For now, we'll assume it's similar enough to reuse for simplicity.
const opportunityItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * Defines an Opportunity - a qualified potential deal with a specific customer.
 */
const opportunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "Deal for 10 iPhones for XYZ Corp"
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true }, // Estimated deal value
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    stage: {
      type: String,
      required: true,
      // These stages can be made configurable in a future settings page
      enum: [
        "Prospecting",
        "Qualification",
        "Needs Analysis",
        "Proposal Sent",
        "Negotiation",
        "Closed-Won",
        "Closed-Lost",
      ],
      default: "Prospecting",
    },
    items: [opportunityItemSchema],
    lossReason: {
      type: String,
      trim: true,
    },
    probability: { type: Number, min: 0, max: 100 }, // % chance of closing
    expectedCloseDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = opportunitySchema;
