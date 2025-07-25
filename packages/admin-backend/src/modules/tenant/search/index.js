const searchRoutes = require("./search.routes")
const express = require("express")
const mainRouter = express.Router()
mainRouter.use("/", searchRoutes)
module.exports = {
  schemas: {}, // This module has no new schemas
  router: mainRouter,
}
