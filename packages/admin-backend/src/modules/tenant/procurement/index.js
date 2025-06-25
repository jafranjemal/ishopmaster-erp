const express = require("express");
const supplierSchema = require("./supplier.schema");
const supplierRoutes = require("./supplier.routes");
const purchaseOrderSchema = require("./purchaseOrder.schema");
const purchaseOrderRoutes = require("./purchaseOrder.routes");
const goodsReceiptNoteSchema = require("./goodsReceiptNote.schema");
const supplierInvoiceSchema = require("./supplierInvoice.schema");
const supplierInvoiceRoutes = require("./supplierInvoice.routes"); // <-- 2. IMPORT INVOICE ROUTES
const goodsReceiptNoteRoutes = require("./goodsReceiptNote.routes"); // <-- 1. IMPORT NEW ROUTES

// Create a main router for the entire procurement module
const mainRouter = express.Router();

// Mount the supplier-specific routes under the /suppliers path
mainRouter.use("/suppliers", supplierRoutes);

// Mount the purchase-order-specific routes under the /purchase-orders path
mainRouter.use("/purchase-orders", purchaseOrderRoutes);
mainRouter.use("/invoices", supplierInvoiceRoutes);
mainRouter.use("/grns", goodsReceiptNoteRoutes);

module.exports = {
  schemas: {
    Supplier: supplierSchema,
    PurchaseOrder: purchaseOrderSchema,
    GoodsReceiptNote: goodsReceiptNoteSchema,
    SupplierInvoice: supplierInvoiceSchema,
  },
  router: mainRouter,
};
