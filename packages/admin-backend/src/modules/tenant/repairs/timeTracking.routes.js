const express = require("express");
const ctrl = require("./timeTracking.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("service:ticket:update")); // Or a more specific permission

router.post("/tickets/:ticketId/timer/start", ctrl.startTimer);
router.post("/tickets/:ticketId/timer/stop", ctrl.stopTimer);
router.get("/tickets/:ticketId/timer/active", ctrl.getActiveTimer);
router.post("/tickets/:ticketId/timer/pause", ctrl.pauseTimer);

module.exports = router;
