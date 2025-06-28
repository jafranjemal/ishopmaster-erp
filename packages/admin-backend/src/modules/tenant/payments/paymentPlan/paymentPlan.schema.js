const mongoose = require("mongoose");

/**
 * Defines a single installment within a larger payment plan.
 */
const paymentPlanLineSchema = new mongoose.Schema(
  {
    dueDate: {
      type: Date,
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    // When an installment is paid, we link it to the universal Payment document
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { _id: true }
); // Use _id: true to give each installment a unique ID

/**
 * Defines the main Payment Plan document. This is the master agreement
 * for an installment-based payment schedule.
 */
const paymentPlanSchema = new mongoose.Schema(
  {
    planId: {
      // A user-friendly, sequential ID
      type: String,
      required: true,
      unique: true,
    },
    // The Polymorphic Association - linking this plan to its source document.
    paymentSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    paymentSourceType: {
      type: String,
      required: true,
      enum: ["SalesInvoice"], // Initially for sales, but can be extended
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    // The schedule of individual payments to be made.
    installments: [paymentPlanLineSchema],

    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "defaulted", "cancelled"],
      default: "active",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly ID.
paymentPlanSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastPlan = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastPlan && lastPlan.planId) {
      lastNumber = parseInt(lastPlan.planId.split("-")[1]);
    }
    this.planId = "PLAN-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = paymentPlanSchema;
