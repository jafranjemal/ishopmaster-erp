const express = require("express");

const brandSchema = require("./brands/brand.schema");
const categorySchema = require("./categories/category.schema");
const productTemplateRoutes = require("./products/productTemplate.routes");
const brandRoutes = require("./brands/brand.routes");
const categoryRoutes = require("./categories/category.routes");
const productTemplateSchema = require("./products/productTemplate.schema");
const productVariantSchema = require("./products/productVariant.schema");
const productVariantRoutes = require("./products/productVariant.routes");
const inventoryLotSchema = require("./stock/inventoryLot.schema");
const inventoryItemSchema = require("./stock/inventoryItem.schema");
const stockMovementSchema = require("./stock/stockMovement.schema");
const stockRoutes = require("./stock/stock.routes"); // <-- 1. IMPORT NEW ROUTES

const mainRouter = express.Router();

// Mount the sub-module routers
mainRouter.use("/brands", brandRoutes);
mainRouter.use("/categories", categoryRoutes);
mainRouter.use("/templates", productTemplateRoutes);
// Create a sub-router for all product-catalog related items
const productsRouter = express.Router();
productsRouter.use("/templates", productTemplateRoutes);
productsRouter.use("/variants", productVariantRoutes); // <-- 2. MOUNT NEW ROUTES

mainRouter.use("/products", productsRouter); // Mount the sub-router
mainRouter.use("/stock", stockRoutes); // <-- 2. MOUNT NEW ROUTES

module.exports = {
  schemas: {
    ProductTemplates: productTemplateSchema,
    ProductVariants: productVariantSchema, // Will become ProductTemplates/Variant
    Brand: brandSchema,
    Category: categorySchema,
    InventoryLot: inventoryLotSchema,
    InventoryItem: inventoryItemSchema,
    StockMovement: stockMovementSchema,
  },
  router: mainRouter,
};
