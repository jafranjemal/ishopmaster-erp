const cashDrawerDenominationSchema = require("./cashDrawerDenomination/cashDrawerDenomination.schema")
const cashDrawerDenominationRoutes = require("./cashDrawerDenomination/cashDrawerDenomination.routes")
const notificationTemplateRoutes = require("./notifications/notificationTemplate.routes")
const documentTemplateRoutes = require("./documents/documentTemplate.routes") // <-- 2. IMPORT
const documentPrintRoutes = require("./documents/document.routes") // <-- 2. IMPORT
const hardwareDeviceRoutes = require("./hardware/hardwareDevice.routes")
const express = require("express")
const notificationTemplateSchema = require("./notifications/notificationTemplate.schema")
const documentTemplateSchema = require("./documents/documentTemplate.schema")
const hardwareDeviceSchema = require("./hardware/hardwareDevice.schema")
const mainRouter = express.Router()

mainRouter.use("/cash-drawer-denominations", cashDrawerDenominationRoutes)
mainRouter.use("/notification-templates", notificationTemplateRoutes) // <-- 3. MOUNT
mainRouter.use("/document/templates", documentTemplateRoutes)
mainRouter.use("/document/print", documentPrintRoutes)
mainRouter.use("/hardware-devices", hardwareDeviceRoutes)
module.exports = {
  schemas: {
    CashDrawerDenomination: cashDrawerDenominationSchema,
    NotificationTemplate: notificationTemplateSchema,
    DocumentTemplate: documentTemplateSchema,
    HardwareDevice: hardwareDeviceSchema,
  },
  router: mainRouter,
}
