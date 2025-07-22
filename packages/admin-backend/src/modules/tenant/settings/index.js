const cashDrawerDenominationSchema = require("./cashDrawerDenomination/cashDrawerDenomination.schema");
const cashDrawerDenominationRoutes = require("./cashDrawerDenomination/cashDrawerDenomination.routes");
const notificationTemplateRoutes = require("./notifications/notificationTemplate.routes");

const express = require("express");
const notificationTemplateSchema = require("./notifications/notificationTemplate.schema");
const mainRouter = express.Router();

mainRouter.use("/cash-drawer-denominations", cashDrawerDenominationRoutes);
mainRouter.use("/notification-templates", notificationTemplateRoutes); // <-- 3. MOUNT

module.exports = {
  schemas: {
    CashDrawerDenomination: cashDrawerDenominationSchema,
    NotificationTemplate: notificationTemplateSchema,
  },
  router: mainRouter,
};
