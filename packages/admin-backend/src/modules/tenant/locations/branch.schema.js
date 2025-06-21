const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true, default: "123 Main St" }, // Default street
    city: { type: String, trim: true, default: "Colombo" }, // Default city
    state: { type: String, trim: true, default: "Western" }, // Default state
    postalCode: { type: String, trim: true, default: "00000" }, // Default postal code
    country: { type: String, trim: true, default: "Sri Lanka" },
  },
  { _id: false }
);

const receiptInfoSchema = new mongoose.Schema(
  {
    header: { type: String, trim: true },
    footer: { type: String, trim: true },
    showContact: { type: Boolean, default: true },
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required."],
      trim: true,
      unique: true,
    },
    address: addressSchema,
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isPrimary: {
      type: Boolean,
      default: false, // Only one branch can be the primary/main branch
    },
    linkedWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse", // Creates a link to a Warehouse document
      default: null,
    },
    receiptInfo: receiptInfoSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add a pre-save hook to ensure only one primary branch exists.
branchSchema.pre("save", async function (next) {
  if (this.isPrimary && this.isModified("isPrimary")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isPrimary: true },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = branchSchema;
