const express = require("express");
const supplierSchema = require("./supplier.schema");
const supplierRoutes = require("./supplier.routes");
// We will import PurchaseOrder schemas and routes here later

// Create a main router for the entire procurement module
const mainRouter = express.Router();

// Mount the supplier-specific routes under the /suppliers path
mainRouter.use("/suppliers", supplierRoutes);

// In the future, other procurement routes could be added here:
// mainRouter.use('/purchase-orders', purchaseOrderRoutes);

module.exports = {
  schemas: {
    Supplier: supplierSchema,
    // PurchaseOrder: purchaseOrderSchema, // To be added later
  },
  router: mainRouter,
};
