const mongoose = require("mongoose");

/**
 * Defines the master record for an Employee.
 * This is separate from the User model, which handles system access.
 * An Employee is a person who works for the company, while a User is an account that can log in.
 */
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    // Link to the User model if this employee has system access
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true, // Allows multiple null values but unique for non-null
    },

    // Organizational Details
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    jobPositionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosition",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // Contact Information
    contactInfo: {
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },

    // Compensation Details
    compensation: {
      type: {
        type: String,
        enum: ["fixed", "hourly", "hybrid", "commission_based"],
        default: "fixed",
      },
      salary: { type: Number, default: 0 }, // monthly or fixed salary
      hourlyRate: { type: Number, default: 0 }, // employee hourly pay
      overtimeRate: { type: Number, default: 0 }, // optional overtime pay
      commissionRate: { type: Number, default: 0 }, // for commission-based pay
      billRate: { type: Number, default: 0 }, // hourly billing rate to clients
      currency: { type: String, default: "LKR" }, // optional currency code
    },
    // Hardware & Access
    accessCardId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a sequential, user-friendly Employee ID.
employeeSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastEmployee = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastEmployee && lastEmployee.employeeId) {
      lastNumber = parseInt(lastEmployee.employeeId.split("-")[1]);
    }
    this.employeeId = "EMP-" + String(lastNumber + 1).padStart(5, "0");
  }
  next();
});

module.exports = employeeSchema;
