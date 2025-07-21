const mongoose = require("mongoose");

/**
 * Defines a single, unique, physical asset that can be sold or serviced.
 * This is the master record for a device, tracked by its serial number.
 */
const assetSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true, trim: true, index: true },
    imei: { type: String, trim: true, sparse: true, index: true },

    // Link to the 'type' of device (e.g., the "iPhone 14 Pro" model)
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },

    // Polymorphic owner - can be a Customer or the Tenant (for in-house stock)
    owner: {
      kind: { type: String, required: true, enum: ["Customer", "Tenant"] },
      item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "owner.kind" },
    },

    // A running history of all repairs for this specific asset
    repairHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "RepairTicket" }],

    // Other details
    purchaseDate: { type: Date },
    warrantyExpiryDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = assetSchema;
