console.log("🛠 Repair module starting to load...");
const repairTicketSchema = require("./schemas/repairTicket.schema");
const repairTicketHistorySchema = require("./schemas/repairTicketHistory.schema");

const repairQuoteSchema = require("./schemas/repairQuote.schema");
const timeTrackingRoutes = require("./timeTracking.routes");
const repairRoutes = require("./repair.routes");
const qcTemplateRoutes = require("./qc/qcTemplate.routes");
const repairQuoteRoutes = require("./repairQuote.routes"); // <-- 1. IMPORT
const qcChecklistTemplateSchema = require("./schemas/qcChecklistTemplate.schema");
const laborLogSchema = require("./schemas/laborLog.schema");

const mainRouter = require("express").Router();
mainRouter.use("/quotes", repairQuoteRoutes); // <-- 2. MOUNT
mainRouter.use("/qc-templates", qcTemplateRoutes);
mainRouter.use("/time-tracking", timeTrackingRoutes);
mainRouter.use(repairRoutes);
/**
 * This is the manifest file for the new Service & Repair module.
 * It exports its schemas and router to be discovered and registered
 * by the dynamic module loader in server.js.
 */
module.exports = {
  schemas: {
    RepairTicket: repairTicketSchema,
    RepairTicketHistory: repairTicketHistorySchema,
    RepairQuote: repairQuoteSchema,
    QcChecklistTemplate: qcChecklistTemplateSchema,
    LaborLog: laborLogSchema,
  },
  router: mainRouter,
};

console.log("✅ Repair module loaded successfully");
