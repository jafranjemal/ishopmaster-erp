const mongoose = require("mongoose");

const transferItemSchema = new mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    // --- THE DEFINITIVE FIX ---
    // This array will hold the specific serial numbers for serialized items.
    serials: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const stockTransferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true },
    fromBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    toBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in_transit", "completed", "cancelled"],
      default: "pending",
    },
    items: [transferItemSchema],
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dispatchDate: { type: Date },
    receivedDate: { type: Date },
  },
  { timestamps: true }
);

stockTransferSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastTransfer = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastTransfer && lastTransfer.transferId) {
      lastNumber = parseInt(lastTransfer.transferId.split("-")[1]);
    }
    this.transferId = "TRN-" + String(lastNumber + 1).padStart(6, "0");
  }
  next();
});

module.exports = stockTransferSchema;
