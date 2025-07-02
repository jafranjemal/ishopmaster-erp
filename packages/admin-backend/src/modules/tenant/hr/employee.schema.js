const mongoose = require("mongoose");

/**
 * Defines the core Employee record. This is the single source of truth for a staff member,
 * separate from their optional system User account.
 */
const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },

    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
      },
    },

    designation: { type: String, required: true, trim: true }, // e.g., "Senior Technician", "Cashier"
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    // The crucial link to the system user account. Optional because not all employees may have a login.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    compensation: {
      type: {
        type: String,
        required: true,
        enum: ["fixed", "commission_based", "hourly", "hybrid"],
        default: "fixed",
      },
      baseSalary: { type: Number, default: 0 },
      commissionRate: { type: Number, default: 0 }, // Percentage, e.g., 5 for 5%
      hourlyRate: { type: Number, default: 0 },
    },

    dateOfJoining: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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
