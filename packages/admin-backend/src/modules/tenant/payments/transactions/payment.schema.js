// src/models/payment.schema.js
const mongoose = require("mongoose");

const paymentLineSchema = new mongoose.Schema(
  {
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      set: (v) => parseFloat(v.toFixed(2)), // Ensures 2 decimal places
    },
    referenceNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    chequeDate: { type: Date },
    status: {
      type: String,
      enum: ["cleared", "bounced", "pending_clearance", "pending", "completed"],
      default: "cleared",
    },
  },
  { _id: false, timestamps: true }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      },
    },
    paymentSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    paymentSourceType: {
      type: String,
      required: true,
      enum: ["SalesInvoice", "SupplierInvoice", "ExpenseClaim"],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      set: (v) => parseFloat(v.toFixed(2)),
    },
    paymentLines: [paymentLineSchema],
    direction: {
      type: String,
      required: true,
      enum: ["inflow", "outflow"],
    },
    status: {
      type: String,
      enum: ["completed", "pending", "voided", "pending_clearance", "partially_cleared", "cleared"],
      default: "completed",
    },
    notes: { type: String, trim: true },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clearanceDate: Date, // For cheques
    riskScore: { type: Number, default: 0 }, // Fraud detection
    parentPaymentId: mongoose.ObjectId, // For split payments
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for payment methods
paymentSchema.virtual("methods", {
  ref: "PaymentMethod",
  localField: "paymentLines.paymentMethodId",
  foreignField: "_id",
});

// Add instance method to get payment method details
paymentSchema.methods.getMethodDetails = async function () {
  await this.populate("methods");
  return this.methods;
};

paymentSchema.pre("save", function (next) {
  const validTransitions = {
    pending_clearance: ["completed", "voided"],
    partially_cleared: ["completed", "voided"],
    completed: ["voided"], // Can only void after completion
  };

  if (this.isModified("status") && !validTransitions[this._originalStatus]?.includes(this.status)) {
    throw new Error(`Invalid status change from ${this._originalStatus} to ${this.status}`);
  }
  next();
});

// Auto-set status based on payment lines
paymentSchema.pre("save", function (next) {
  if (this.isModified("paymentLines")) {
    if (this.paymentLines.some((line) => line.status === "pending")) {
      this.status = "pending_clearance";
    } else if (this.paymentLines.some((line) => line.status === "bounced")) {
      this.status = "partially_cleared";
    } else {
      this.status = "completed";
    }
  }
  next();
});

module.exports = paymentSchema;
