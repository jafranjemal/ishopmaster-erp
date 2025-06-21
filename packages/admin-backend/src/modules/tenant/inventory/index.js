const express = require("express");

const brandSchema = require("./brands/brand.schema");
const categorySchema = require("./categories/category.schema");
const productTemplateRoutes = require("./products/productTemplate.routes");
const brandRoutes = require("./brands/brand.routes");
const categoryRoutes = require("./categories/category.routes");
const productTemplateSchema = require("./products/productTemplate.schema");
const productVariantSchema = require("./products/productVariant.schema");

const mainRouter = express.Router();

// Mount the sub-module routers
mainRouter.use("/brands", brandRoutes);
mainRouter.use("/categories", categoryRoutes);
mainRouter.use("/templates", productTemplateRoutes);
// productRoutes will be added here later

module.exports = {
  schemas: {
    ProductTemplate: productTemplateSchema,
    ProductVariant: productVariantSchema, // Will become ProductTemplate/Variant
    Brand: brandSchema,
    Category: categorySchema,
  },
  router: mainRouter,
};
