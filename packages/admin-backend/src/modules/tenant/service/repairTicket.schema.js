const mongoose = require("mongoose");

/**
 * Defines a single line item on a Job Sheet within a Repair Ticket.
 * This can be a physical part used or a labor service performed.
 */
const jobSheetItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      required: true,
      enum: ["part", "service"],
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true }, // Price charged to customer
    costPrice: { type: Number, required: true }, // Our internal cost
  },
  { _id: false }
);

/**
 * Defines the main Repair Ticket document, which tracks a service job from intake to completion.
 */
const repairTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    deviceDetails: {
      type: { type: String }, // e.g., Phone, Laptop
      manufacturer: { type: String },
      model: { type: String },
      serialNumber: { type: String, index: true },
      passwordOrPattern: { type: String },
    },

    customerComplaint: { type: String, required: true },

    preRepairChecklist: {
      type: Map,
      of: String, // e.g., { 'Screen Condition': 'Scratched', 'Powers On': 'Yes', 'Water Damage': 'No' }
    },

    status: {
      type: String,
      required: true,
      enum: [
        "intake",
        "diagnosing",
        "awaiting_customer_approval",
        "awaiting_parts",
        "in_progress",
        "completed_pending_pickup",
        "closed",
        "cancelled",
      ],
      default: "intake",
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // The detailed log of all parts and services used for the repair.
    jobSheet: [jobSheetItemSchema],

    estimatedCompletionDate: { type: Date },
    notes: [
      {
        text: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

repairTicketSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastTicket = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastTicket && lastTicket.ticketNumber) {
      lastNumber = parseInt(lastTicket.ticketNumber.split("-")[1]);
    }
    this.ticketNumber = "JOB-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = repairTicketSchema;
