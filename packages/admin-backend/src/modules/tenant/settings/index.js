const cashDrawerDenominationSchema = require("./cashDrawerDenomination/cashDrawerDenomination.schema");
const cashDrawerDenominationRoutes = require("./cashDrawerDenomination/cashDrawerDenomination.routes");
const express = require("express");
const mainRouter = express.Router();

mainRouter.use("/cash-drawer-denominations", cashDrawerDenominationRoutes);
module.exports = {
  schemas: {
    CashDrawerDenomination: cashDrawerDenominationSchema,
  },
  router: mainRouter,
};
