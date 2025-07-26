const express = require("express")
const mainRoute = express.Router()
const labelTemplateSchema = require("./labelTemplate.schema")
const labelTemplateRoutes = require("./labelTemplate.routes")
const printJobRoutes = require("./print.routes")
const printJobSchema = require("./printJob.schema")

mainRoute.use("/label-templates", labelTemplateRoutes)
mainRoute.use("/", printJobRoutes)
module.exports = {
  schemas: {
    LabelTemplate: labelTemplateSchema,
    PrintJob: printJobSchema,
  },
  router: mainRoute,
}
