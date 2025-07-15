const salesInvoiceSchema = require("./salesInvoice.schema");
const shiftSummarySchema = require("./shiftSummary.schema");
const shiftRoutes = require("./shift.routes"); // <-- 1. IMPORT
const salesRoutes = require("./sales.routes"); // <-- 1. IMPORT
const pricingRoutes = require("./pricing/pricing.routes");
const salesOrderRoutes = require("./salesOrder/salesOrder.routes");
const returnsRoutes = require("./returns/returns.routes"); // <-- IMPORT

const couponRoutes = require("./pricing/coupon.routes");

const express = require("express");
const pricingRuleSchema = require("./pricing/pricingRule.schema");
const promotionSchema = require("./pricing/promotion.schema");
const salesOrderSchema = require("./salesOrder/salesOrder.schema");
const cashMovementSchema = require("./cashMovement.schema");
const couponBatchSchema = require("./pricing/couponBatch.schema");
const couponSchema = require("./pricing/coupon.schema");
const refundVoucherSchema = require("./returns/refundVoucher.schema");
const rmaSchema = require("./returns/rma.schema");
const mainRouter = express.Router();
/**
 * Manifest file for the Sales & POS module.
 */
// ... mainRouter setup ...
mainRouter.use("/shifts", shiftRoutes);
mainRouter.use("/pricing/coupons", couponRoutes);
mainRouter.use("/pricing", pricingRoutes);
mainRouter.use("/orders", salesOrderRoutes);
mainRouter.use("/returns", returnsRoutes);
mainRouter.use("/", salesRoutes);

module.exports = {
  schemas: {
    SalesInvoice: salesInvoiceSchema,
    ShiftSummary: shiftSummarySchema,
    PricingRule: pricingRuleSchema,
    Promotion: promotionSchema,
    SalesOrder: salesOrderSchema,
    CashMovement: cashMovementSchema,
    CouponBatch: couponBatchSchema, // <-- EXPORT
    Coupon: couponSchema,
    RMA: rmaSchema,
    RefundVoucher: refundVoucherSchema,
  },
  router: mainRouter,
};
