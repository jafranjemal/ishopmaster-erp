const mongoose = require("mongoose");

const repairTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    defaultPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound unique index to ensure repair type name is unique per device
repairTypeSchema.index({ name: 1, deviceId: 1 }, { unique: true });

module.exports = repairTypeSchema;
