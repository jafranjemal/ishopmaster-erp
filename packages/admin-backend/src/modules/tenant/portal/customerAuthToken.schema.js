const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * Defines a single-use, time-limited token for passwordless customer authentication.
 */
const customerAuthTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    repairTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairTicket",
      required: false, // This is the critical change
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      default: "active",
    },
    // Set a TTL index to have MongoDB automatically delete expired tokens after 24 hours
    expiryDate: {
      type: Date,
      required: true,
      expires: "24h",
    },
  },
  { timestamps: true }
);

// Generate a secure, random token before saving
customerAuthTokenSchema.pre("validate", function (next) {
  if (this.isNew) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

module.exports = customerAuthTokenSchema;
