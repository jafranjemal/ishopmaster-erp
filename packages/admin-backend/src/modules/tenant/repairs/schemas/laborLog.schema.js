const mongoose = require("mongoose");

/**
 * Defines a single, continuous block of labor time logged by an employee
 * against a specific repair ticket.
 */
const laborLogSchema = new mongoose.Schema(
  {
    repairTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairTicket",
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["in_progress", "paused", "completed"],
      default: "in_progress",
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// When saving, if the status is completed, calculate the duration
laborLogSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "completed" && this.startTime && this.endTime) {
    const durationMs = this.endTime.getTime() - this.startTime.getTime();
    this.durationMinutes = Math.round(durationMs / 60000);
  }
  next();
});

module.exports = laborLogSchema;
