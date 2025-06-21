const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: "Sri Lanka" },
  },
  { _id: false }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Warehouse name is required."],
      trim: true,
      unique: true,
    },
    address: addressSchema,
    isPrimary: {
      type: Boolean,
      default: false, // Only one warehouse should be primary
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add a pre-save hook to ensure only one primary warehouse exists.
warehouseSchema.pre("save", async function (next) {
  if (this.isPrimary && this.isModified("isPrimary")) {
    // `this.constructor` refers to the Mongoose model
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isPrimary: true },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = warehouseSchema;
