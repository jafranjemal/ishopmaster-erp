const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    notes: { type: String, trim: true },
    // Future field for fingerprint/biometric device ID
    // deviceId: { type: String }
  },
  { timestamps: true }
);

module.exports = attendanceSchema;
