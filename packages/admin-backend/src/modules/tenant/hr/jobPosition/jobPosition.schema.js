const mongoose = require("mongoose");

/**
 * Defines a specific job title or position within a department.
 * e.g., "Senior Technician", "Head Cashier", "Store Manager"
 */
const jobPositionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    // We can add fields for salary ranges, etc., here in the future
  },
  { timestamps: true }
);

jobPositionSchema.index({ title: 1, departmentId: 1 }, { unique: true });

module.exports = jobPositionSchema;
