const mongoose = require("mongoose");

/**
 * Defines a single customer interaction (an Activity).
 * Uses a polymorphic association to link to a Lead, Opportunity, or Customer.
 */
const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["call", "email", "meeting", "note"],
    },
    subject: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },

    // Polymorphic association to link this activity to its parent record
    relatedToId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    relatedToType: {
      type: String,
      required: true,
      enum: ["Lead", "Opportunity", "Customer"],
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = activitySchema;
