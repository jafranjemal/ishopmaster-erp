const repairTicketSchema = require("./repairTicket.schema");
const repairRoutes = require("./repair.routes");

const express = require("express");
const mainRoute = express.Router();
mainRoute.use("/tickets", repairRoutes);
module.exports = {
  schemas: {
    RepairTicket: repairTicketSchema,
  },
  router: mainRoute,
};
