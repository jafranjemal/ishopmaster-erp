const express = require("express");
const ctrl = require("./repair.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

// All routes in this module require a user to be logged in.
router.use(protect);

// Routes for managing tickets
router
  .route("/tickets")
  .post(authorize("service:ticket:create"), ctrl.createRepairTicket)
  .get(authorize("service:ticket:view"), ctrl.getAllRepairTickets);
router.get("/tickets/my-queue", authorize("service:ticket:view_own"), ctrl.getMyTickets);

router.route("/tickets/:id").get(authorize("service:ticket:view"), ctrl.getRepairTicketById);

router.patch("/tickets/:id/status", authorize("service:ticket:update_status"), ctrl.updateTicketStatus);
router.put("/tickets/:id/assign", authorize("service:ticket:assign_technician"), ctrl.assignTechnician);

router.route("/tickets/:id/jobsheet/items").post(authorize("service:ticket:update"), ctrl.addItemToJobSheet);

router.route("/tickets/:id/jobsheet/items/:itemId").delete(authorize("service:ticket:update"), ctrl.removeItemFromJobSheet);
router.post("/tickets/:id/submit-qc", authorize("service:qc:perform"), ctrl.submitQcCheck);
router.get("/tickets/:id/qc-details", authorize("service:qc:perform"), ctrl.getQcDetails);
router.post("/tickets/:id/flag-for-requote", authorize("service:ticket:update"), ctrl.flagForRequote);

module.exports = router;
