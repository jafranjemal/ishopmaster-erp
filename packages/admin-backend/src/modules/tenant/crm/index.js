const express = require("express");
const customerSchema = require("./customer.schema");
const customerRoutes = require("./customer.routes");

// Create a main router for the entire CRM module
const mainRouter = express.Router();

// Mount the customer-specific routes under the /customers path
mainRouter.use("/customers", customerRoutes);
// In the future, other CRM routes could be added here:
// mainRouter.use('/leads', leadRoutes);

module.exports = {
  schemas: {
    Customer: customerSchema,
  },
  router: mainRouter,
};
