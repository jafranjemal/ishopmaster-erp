const roleRoutes = require("./role.routes");
const roleSchema = require("./role.schema");

module.exports = {
  schemas: {
    Role: roleSchema,
  },
  router: roleRoutes,
};
