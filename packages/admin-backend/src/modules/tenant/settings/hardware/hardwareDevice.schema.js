const mongoose = require("mongoose")

/**
 * Defines a single, configured physical hardware device (e.g., a printer, cash drawer)
 * linked to a specific location or workstation.
 */
const hardwareDeviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["printer", "cash_drawer", "customer_display", "scanner"],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    // Optional: for linking to a specific POS machine
    workstationId: { type: String, trim: true, index: true },

    driverType: {
      type: String,
      required: true,
      enum: ["escpos", "cups", "windows_native", "serial"],
    },
    connectionType: {
      type: String,
      required: true,
      enum: ["ip", "usb", "serial"],
    },

    // Connection-specific details
    ipAddress: { type: String }, // For IP printers
    vendorId: { type: String }, // For USB devices
    productId: { type: String }, // For USB devices

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

// Ensure a branch can only have one default device of each type
hardwareDeviceSchema.index({ branchId: 1, type: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } })

module.exports = hardwareDeviceSchema
