const repairTypeSchema = require("./repairType.schema");
// const repairTypeRoutes = require('./repairType.routes'); // To be added later

/**
 * Manifest file for the RepairTypes sub-module.
 */
module.exports = {
  schemas: {
    RepairType: repairTypeSchema,
  },
  // router: repairTypeRoutes,
};
