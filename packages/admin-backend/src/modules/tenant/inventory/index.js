const express = require("express")

const brandSchema = require("./brands/brand.schema")
const categorySchema = require("./categories/category.schema")
const productTemplateRoutes = require("./products/productTemplate.routes")
const brandRoutes = require("./brands/brand.routes")
const categoryRoutes = require("./categories/category.routes")
const productTemplateSchema = require("./products/productTemplate.schema")
const productVariantSchema = require("./products/productVariant.schema")
const ProductVariantsRoutes = require("./products/ProductVariant.routes")
const inventoryLotSchema = require("./stock/inventoryLot.schema")
const inventoryItemSchema = require("./stock/inventoryItem.schema")
const stockMovementSchema = require("./stock/stockMovement.schema")
const stockTransferSchema = require("./stock/stockTransfer.schema")
const stockRoutes = require("./stock/stock.routes") // <-- 1. IMPORT NEW ROUTES
const stockAdjustmentRoutes = require("./adjustments/stockAdjustment.routes") // <-- 1. IMPORT NEW ROUTES
const printRoutes = require("./print/print.routes") // <-- IMPORT
const deviceSchema = require("./devices/device.schema")

const deviceRoutes = require("./devices/device.routes")

const assemblyRoutes = require("./assemblies/assembly.routes") // <-- 1. IMPORT NEW ROUTES
const warrantyRoutes = require("./warranties/warrantyPolicy.routes") // <-- 1. IMPORT
const warrantyPolicySchema = require("./warranties/warrantyPolicy.schema")
const inventoryLedgerSchema = require("./inventoryLedger/inventoryLedger.schema")
const inventoryLedgerRoutes = require("./inventoryLedger/inventoryLedger.routes") // <-- 1. IMPORT NEW ROUTES
const assetSchema = require("./assets/asset.schema")
const assetRoutes = require("./assets/asset.routes")
const mainRouter = express.Router()

// Mount the sub-module routers
mainRouter.use("/brands", brandRoutes)
mainRouter.use("/categories", categoryRoutes)
mainRouter.use("/templates", productTemplateRoutes)
// Create a sub-router for all product-catalog related items
const productsRouter = express.Router()
productsRouter.use("/templates", productTemplateRoutes)
productsRouter.use("/variants", ProductVariantsRoutes)

mainRouter.use("/products", productsRouter) // Mount the sub-router
mainRouter.use("/stock", stockRoutes)
mainRouter.use("/adjustments", stockAdjustmentRoutes)
mainRouter.use("/print", printRoutes)
mainRouter.use("/devices", deviceRoutes)

mainRouter.use("/assemblies", assemblyRoutes)
mainRouter.use("/warranties", warrantyRoutes)
mainRouter.use("/ledger", inventoryLedgerRoutes)
mainRouter.use("/assets", assetRoutes)
module.exports = {
  schemas: {
    ProductTemplates: productTemplateSchema,
    ProductVariants: productVariantSchema, // Will become ProductTemplates/Variant
    Brand: brandSchema,
    Category: categorySchema,
    InventoryLot: inventoryLotSchema,
    InventoryItem: inventoryItemSchema,
    StockMovement: stockMovementSchema,
    Device: deviceSchema,
    StockTransfer: stockTransferSchema,

    WarrantyPolicy: warrantyPolicySchema,
    InventoryLedger: inventoryLedgerSchema,
    Asset: assetSchema,
  },
  router: mainRouter,
}
