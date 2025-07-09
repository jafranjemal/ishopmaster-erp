const salesInvoiceSchema = require("./salesInvoice.schema");
const shiftSummarySchema = require("./shiftSummary.schema");
const shiftRoutes = require("./shift.routes"); // <-- 1. IMPORT
const salesRoutes = require("./sales.routes"); // <-- 1. IMPORT
const pricingRoutes = require("./pricing/pricing.routes");
const salesOrderRoutes = require("./salesOrder/salesOrder.routes");

const express = require("express");
const pricingRuleSchema = require("./pricing/pricingRule.schema");
const promotionSchema = require("./pricing/promotion.schema");
const salesOrderSchema = require("./salesOrder/salesOrder.schema");
const mainRouter = express.Router();
/**
 * Manifest file for the Sales & POS module.
 */
// ... mainRouter setup ...
mainRouter.use("/shifts", shiftRoutes);
mainRouter.use("/pricing", pricingRoutes);
mainRouter.use("/orders", salesOrderRoutes);
mainRouter.use("/", salesRoutes);
module.exports = {
  schemas: {
    SalesInvoice: salesInvoiceSchema,
    ShiftSummary: shiftSummarySchema,
    PricingRule: pricingRuleSchema,
    Promotion: promotionSchema,
    SalesOrder: salesOrderSchema,
  },
  router: mainRouter,
};
