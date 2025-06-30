const deviceSchema = require("./device.schema");
// const deviceRoutes = require('./device.routes'); // To be added later

/**
 * Manifest file for the Devices sub-module.
 */
module.exports = {
  schemas: {
    Device: deviceSchema,
  },
  // router: deviceRoutes,
};
