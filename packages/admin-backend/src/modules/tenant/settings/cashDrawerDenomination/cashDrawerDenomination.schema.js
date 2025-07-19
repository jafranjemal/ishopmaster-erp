const mongoose = require("mongoose");

/**
 * Defines a single bill or coin denomination available in a cash drawer.
 */
const cashDrawerDenominationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g., "5000 LKR Note"
    value: { type: Number, required: true, unique: true }, // e.g., 5000
    type: { type: String, required: true, enum: ["bill", "coin"], default: "bill" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = cashDrawerDenominationSchema;
