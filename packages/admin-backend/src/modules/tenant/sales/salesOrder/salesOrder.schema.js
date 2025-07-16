const mongoose = require("mongoose");

/**
 * Defines a Sales Order - a confirmed order from a customer that is pending fulfillment.
 * This is the internal trigger for the warehouse/operations team.
 */
const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    sourceQuotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
      default: null, // No longer required
    },
    sourceOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      default: null,
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    status: {
      type: String,
      required: true,
      enum: ["pending_fulfillment", "partially_fulfilled", "fulfilled", "cancelled", "invoiced"],
      default: "pending_fulfillment",
    },

    items: [
      {
        productVariantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariants" },
        description: { type: String },
        quantity: { type: Number },
        unitPrice: { type: Number },
        finalPrice: { type: Number },
      },
    ],

    totalAmount: { type: Number, required: true },

    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

salesOrderSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const lastOrder = await this.constructor.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;
    if (lastOrder && lastOrder.orderNumber) {
      lastNumber = parseInt(lastOrder.orderNumber.split("-")[1]);
    }
    this.orderNumber = "SO-" + String(lastNumber + 1).padStart(7, "0");
  }
  next();
});

module.exports = salesOrderSchema;
