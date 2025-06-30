const express = require("express");
const ctrl = require("./repair.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect, authorize("service:ticket:view"));

router
  .route("/")
  .get(ctrl.getAllTickets)
  .post(authorize("service:ticket:create"), ctrl.createTicket);
router.route("/:id").get(ctrl.getTicketById);
router.route("/:id/status").patch(authorize("service:ticket:manage"), ctrl.updateStatus);

// Routes for managing the job sheet
router.route("/:id/jobsheet").post(authorize("service:ticket:manage"), ctrl.addItemToJobSheet);
router
  .route("/:id/jobsheet/:itemId")
  .delete(authorize("service:ticket:manage"), ctrl.removeJobSheetItem);

module.exports = router;
