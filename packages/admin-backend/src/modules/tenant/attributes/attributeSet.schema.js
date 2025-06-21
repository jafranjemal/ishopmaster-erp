const mongoose = require("mongoose");

/**
 * Defines a "specification sheet" or a group of attributes that apply to a
 * specific type of product, e.g., "Smartphone Specs" or "Laptop Specs".
 */
const attributeSetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attribute set name is required."],
      trim: true,
      unique: true,
    },
    // A list of all attributes that belong to this set.
    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute", // Links to documents in the 'attributes' collection.
      },
    ],
  },
  { timestamps: true }
);

module.exports = attributeSetSchema;
