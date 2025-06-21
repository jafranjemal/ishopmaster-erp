const attributeSchema = require("./attribute.schema");
const attributeSetSchema = require("./attributeSet.schema");
const attributeRoutes = require("./attribute.routes"); // To be added later

/**
 * Manifest file for the Attributes module.
 * It exports the schemas for dynamic model registration.
 */
module.exports = {
  schemas: {
    Attribute: attributeSchema,
    AttributeSet: attributeSetSchema,
  },
  router: attributeRoutes,
};
