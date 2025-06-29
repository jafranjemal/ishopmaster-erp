const mongoose = require("mongoose");

/**
 * Defines a single characteristic that a product can have, e.g., "Color", "Storage", "RAM".
 */
const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attribute name is required."],
      trim: true,
      unique: true, // e.g., You can only have one "Color" attribute per tenant.
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // A simple regex to ensure it's a machine-friendly key (no spaces or special chars)
      match: [
        /^[a-z0-9_]+$/,
        "Key can only contain lowercase letters, numbers, and underscores.",
      ],
      index: true,
    },
    // An optional array of predefined values for this attribute.
    // If populated, this can be used to render a dropdown in the UI.
    // If empty, it can be a free-text input.
    values: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = attributeSchema;
