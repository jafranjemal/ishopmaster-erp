const authRoutes = require("./auth.routes");

module.exports = {
  schemas: {}, // Auth module has no new schemas, it uses the User schema
  router: authRoutes,
};
