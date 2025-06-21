const userRoutes = require("./user.routes");
const userSchema = require("./user.schema");

module.exports = {
  schemas: {
    User: userSchema,
  },
  router: userRoutes, // Export the router
};
