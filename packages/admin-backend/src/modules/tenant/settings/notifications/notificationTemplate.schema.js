const mongoose = require("mongoose")

/**
 * Defines a configurable, templated notification for a specific business event.
 */
const notificationTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    eventName: { type: String, required: true, trim: true, index: true }, // e.g., 'repair.status_changed'

    channel: {
      type: String,
      required: true,
      enum: ["email", "sms"],
    },
    recipientType: {
      type: String,
      required: true,
      enum: ["customer", "assigned_technician", "branch_manager", "employee"],
    },

    subject: { type: String, trim: true }, // For email channel
    body: { type: String, required: true, trim: true }, // Email HTML or SMS text

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

module.exports = notificationTemplateSchema
