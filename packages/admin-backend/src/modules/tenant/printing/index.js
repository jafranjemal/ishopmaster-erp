const express = require("express");
const mainRoute = express.Router();
const labelTemplateSchema = require("./labelTemplate.schema");
const labelTemplateRoutes = require("./labelTemplate.routes");

mainRoute.use("/label-templates", labelTemplateRoutes);
module.exports = {
  schemas: {
    LabelTemplate: labelTemplateSchema,
  },
  router: mainRoute,
};
