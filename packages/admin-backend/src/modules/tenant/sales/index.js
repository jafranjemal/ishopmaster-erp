const salesInvoiceSchema = require("./salesInvoice.schema");
const shiftSummarySchema = require("./shiftSummary.schema");
const shiftRoutes = require("./shift.routes"); // <-- 1. IMPORT
const salesRoutes = require("./sales.routes"); // <-- 1. IMPORT

const express = require("express");
const mainRouter = express.Router();
/**
 * Manifest file for the Sales & POS module.
 */
// ... mainRouter setup ...
mainRouter.use("/shifts", shiftRoutes); // <-- 2. MOUNT
mainRouter.use("/", salesRoutes); // <-- 2. MOUNT at the root of /sales

module.exports = {
  schemas: {
    SalesInvoice: salesInvoiceSchema,
    ShiftSummary: shiftSummarySchema,
  },
  router: mainRouter,
};
