const authRoutes = require("./auth.routes");

const express = require("express");
const mainRouter = express.Router();

mainRouter.use("/", authRoutes);
module.exports = {
  schemas: {}, // Auth module has no new schemas, it uses the User schema
  router: mainRouter,
};
