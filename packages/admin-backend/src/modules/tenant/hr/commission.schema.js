const mongoose = require("mongoose");

/**
 * Defines a single, auditable record of a commission earned by an employee from a specific sale.
 */
const commissionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    salesInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
      required: true,
      index: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    // The date of the original sale, for easier reporting
    saleDate: {
      type: Date,
      required: true,
    },
    // Status to track if this commission has been included in a payslip
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = commissionSchema;
