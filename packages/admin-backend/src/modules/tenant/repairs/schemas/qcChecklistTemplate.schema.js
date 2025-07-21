const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: true, trim: true },
    // In the future, we could add 'expectedResult' (e.g., 'Pass', 'N/A')
  },
  { _id: false }
);

/**
 * Defines a reusable template for a Quality Control checklist.
 */
const qcChecklistTemplateSchema = new mongoose.Schema(
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
    // In the future, this could be linked to a specific Device or Repair Type
    // for automatic assignment.
    items: [checklistItemSchema],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = qcChecklistTemplateSchema;
