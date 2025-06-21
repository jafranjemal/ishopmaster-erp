const branchSchema = require("./branch.schema");
const warehouseSchema = require("./warehouse.schema");
const locationRoutes = require("./location.routes"); // <-- Add this line

module.exports = {
  schemas: {
    Branch: branchSchema,
    Warehouse: warehouseSchema,
  },
  router: locationRoutes, // <-- Add this line
};
