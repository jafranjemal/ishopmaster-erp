const mongoose = require("mongoose");

/**
 * @desc Stores the summary record of a single, completed payroll run event.
 */
const payrollRunSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      required: true,
      unique: true,
    },
    // A user-friendly representation of the pay period, e.g., "June 2025"
    period: {
      type: String,
      required: true,
    },
    runDate: {
      type: Date,
      default: Date.now,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeCount: {
      type: Number,
      required: true,
    },
    totalPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "failed"], // For future use
      default: "completed",
    },
    // A reference to all payslips generated in this run for detailed drill-down
    payslips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payslip",
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly ID
payrollRunSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastRun = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastRun && lastRun.runId) {
      lastNumber = parseInt(lastRun.runId.split("-")[1]);
    }
    this.runId = "PR-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = payrollRunSchema;
