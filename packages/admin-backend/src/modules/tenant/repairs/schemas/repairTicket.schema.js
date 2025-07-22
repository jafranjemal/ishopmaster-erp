const mongoose = require("mongoose");

const jobSheetItemSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, enum: ["part", "service", "labor"] },
    productVariantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }, // Price at the time of adding
    costPrice: { type: Number, required: true, default: 0 }, // Cost at the time of adding
    /**
     * The specific employee who performed the labor.
     * Required only when itemType is 'labor'.
     */
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    /**
     * The number of hours worked.
     * Required only when itemType is 'labor'.
     */
    laborHours: {
      type: Number,
    },
    /**
     * The billing rate for this specific labor entry (can be overridden from employee default).
     * Required only when itemType is 'labor'.
     */
    laborRate: {
      type: Number,
    },
  },
  { _id: false }
);

const qcChecklistItemResultSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    passed: { type: Boolean, required: true },
  },
  { _id: false }
);

const qcResultSchema = new mongoose.Schema(
  {
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "QcChecklistTemplate", required: true },
    status: { type: String, required: true, enum: ["pass", "fail"] },
    checklist: [qcChecklistItemResultSchema],
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    photos: [{ url: String, public_id: String }],
  },
  { _id: false }
);

const jobSheetHistoryEntrySchema = new mongoose.Schema(
  {
    items: [jobSheetItemSchema],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const repairTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    // --- Multi-Asset Support ---
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true }],

    // --- State Machine ---
    status: {
      type: String,
      required: true,
      enum: [
        "intake",
        "diagnosing",
        "quote_pending",
        "approval_pending",
        "awaiting_parts",
        "repair_active",
        "qc_pending",
        "pickup_pending",
        "closed",
        "cancelled",
        "on_hold_pending_re_quote",
        "on_hold_awaiting_re_approval",
      ],
      default: "intake",
    },
    requoteNeededInfo: {
      reason: { type: String },
      flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      flaggedAt: { type: Date },
    },
    jobSheetHistory: [jobSheetHistoryEntrySchema],

    // --- Intake Details ---
    customerComplaint: { type: String, required: true, trim: true },
    preRepairChecklist: { type: Map, of: String }, // Key-value pairs from the checklist
    beforeImages: [{ url: String, public_id: String }],
    customerSignature: { type: String }, // Base64 encoded image data URI

    // --- Financials ---
    troubleshootFee: {
      amount: { type: Number, default: 0 },
      status: { type: String, enum: ["pending", "waived", "paid"], default: "pending" },
    },
    jobSheet: [jobSheetItemSchema],
    finalInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" },

    // --- Assignments & Timestamps ---
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    afterImages: [{ url: String, public_id: String }],

    qcTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QcChecklistTemplate",
      default: null,
    },
    qcResult: { type: qcResultSchema, default: null },
  },
  { timestamps: true }
);

repairTicketSchema.pre("save", function (next) {
  if (!this.isNew) {
    this._originalStatus = this.get("status", null, { getters: false });
  }
  next();
});

repairTicketSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const originalDoc = this.$__.activePaths.states.require || this.$__.activePaths.states.default;
    const originalStatus = originalDoc?.status || this._doc.status;

    const previousStatus = this.isNew ? "new" : originalStatus;

    const isSameStatus = this.status === previousStatus;

    if (isSameStatus) {
      console.log("Status unchanged. Skipping transition check.");
      return next();
    }

    const allowedTransitions = {
      new: ["intake"],
      intake: ["diagnosing", "cancelled"],
      diagnosing: ["quote_pending", "cancelled"],
      quote_pending: ["approval_pending", "cancelled"],
      approval_pending: ["awaiting_parts", "repair_active", "cancelled"],
      awaiting_parts: ["repair_active", "cancelled"],
      repair_active: ["qc_pending", "cancelled", "on_hold_pending_re_quote"],
      qc_pending: ["pickup_pending", "repair_active"],
      pickup_pending: ["closed"],
      on_hold_pending_re_quote: ["approval_pending", "cancelled"],
    };

    const validTransitions = allowedTransitions[previousStatus];

    if (this.isNew && this.status !== "intake") {
      const err = new Error(`A new ticket must start with 'intake' status.`);
      return next(err);
    }

    if (validTransitions && !validTransitions.includes(this.status)) {
      const err = new Error(
        `Invalid status transition from '${previousStatus}' to '${this.status}'. ` + `Allowed: ${validTransitions.join(", ")}`
      );
      return next(err);
    }
  }
  next();
});
// Pre-save hook to generate a sequential, user-friendly Ticket Number.
repairTicketSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastTicket = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastTicket && lastTicket.ticketNumber) {
      lastNumber = parseInt(lastTicket.ticketNumber.split("-")[1]);
    }
    this.ticketNumber = "TKT-" + String(lastNumber + 1).padStart(8, "0");
  }
  next();
});

module.exports = repairTicketSchema;
