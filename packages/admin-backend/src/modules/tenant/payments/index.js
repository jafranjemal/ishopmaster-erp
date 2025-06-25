const express = require("express");
const chequeSchema = require("./cheque/cheque.schema");
const paymentSchema = require("./transactions/payment.schema");
const paymentMethodSchema = require("./paymentMethod/paymentMethod.schema");
const paymentPlanSchema = require("./paymentPlan/paymentPlan.schema");
const subscriptionSchema = require("./subscription/subscription.schema");
const paymentMethodRoutes = require("./paymentMethod/paymentMethod.routes"); // <-- 1. IMPORT NEW ROUTES
const chequeRoutes = require("./cheque/cheque.routes"); // To be added later
const paymentRoutes = require("./transactions/payment.routes"); // <-- 1. IMPORT

/**
 * Manifest file for the Universal Payments module.
 */

const mainRouter = express.Router();
mainRouter.use("/methods", paymentMethodRoutes);
mainRouter.use("/cheques", chequeRoutes);
mainRouter.use("/transactions", paymentRoutes);

module.exports = {
  schemas: {
    PaymentMethod: paymentMethodSchema,
    Payment: paymentSchema,
    Cheque: chequeSchema,
    PaymentPlan: paymentPlanSchema,
    Subscription: subscriptionSchema,
  },
  router: mainRouter,
};
