const mongoose = require("mongoose")

/**
 * Defines a single print job request. This acts as a queue for the
 * local Hardware Bridge service to poll and execute.
 */
const printJobSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      enum: ["SalesInvoice", "RepairTicket", "PurchaseOrder"],
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "documentType",
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentTemplate",
      required: true,
    },
    hardwareDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HardwareDevice",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "printing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    copies: {
      type: Number,
      default: 1,
    },
    failureReason: {
      type: String,
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    workstationId: { type: String, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

module.exports = printJobSchema
