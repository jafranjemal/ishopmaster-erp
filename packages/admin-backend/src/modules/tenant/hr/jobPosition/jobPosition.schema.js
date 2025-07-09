const mongoose = require("mongoose");

/**
 * Defines a department within the company's organizational structure.
 * e.g., "Sales", "Service & Repairs", "Administration"
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = departmentSchema;
