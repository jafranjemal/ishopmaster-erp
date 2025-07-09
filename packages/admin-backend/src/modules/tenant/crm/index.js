const express = require("express");
const customerSchema = require("./customer.schema");
const customerRoutes = require("./customer.routes");
const customerGroupRoutes = require("./customerGroup.routes");
const customerGroupSchema = require("./customerGroup.schema");
const leadSchema = require("./lead.schema");
const opportunitySchema = require("./opportunity.schema");
const activitySchema = require("./activity.schema");
const leadRoutes = require("./lead.routes");
const opportunityRoutes = require("./opportunity.routes");
const activityRoutes = require("./activity.routes");
const mainRouter = express.Router();

// Mount the customer-specific routes under the /customers path
mainRouter.use("/customers", customerRoutes);
mainRouter.use("/groups", customerGroupRoutes);
mainRouter.use("/leads", leadRoutes);
mainRouter.use("/opportunities", opportunityRoutes);
mainRouter.use("/activities", activityRoutes);
// In the future, other CRM routes could be added here:
// mainRouter.use('/leads', leadRoutes);

module.exports = {
  schemas: {
    Customer: customerSchema,
    CustomerGroup: customerGroupSchema,
    Lead: leadSchema, // <-- 2. ADD TO EXPORT
    Opportunity: opportunitySchema, // <-- 2. ADD TO EXPORT
    Activity: activitySchema,
  },
  router: mainRouter,
};
