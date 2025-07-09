const express = require("express");
const {
  getActiveSession,
  clockIn,
  clockOut,
  getTimesheet,
  updateEntry,
  createManualEntry,
} = require("./attendance.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

// Routes for the logged-in user's own attendance
router.get("/active", authorize("sales:pos:access"), getActiveSession); // Any user with POS access can check their status
router.post("/clock-in", authorize("sales:pos:access"), clockIn);
router.patch("/clock-out", authorize("sales:pos:access"), clockOut);

// Administrative routes for managers
router.get("/timesheet", authorize("hr:attendance:view"), getTimesheet);
router.put("/:id", authorize("hr:attendance:manage"), updateEntry);
router.post("/manual", authorize("hr:attendance:manage"), createManualEntry);
module.exports = router;
