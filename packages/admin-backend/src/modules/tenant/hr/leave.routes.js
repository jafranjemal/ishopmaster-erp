const express = require("express");
const { getLeaveHistory, requestLeave, updateLeaveStatus } = require("./leave.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

// Route for an employee to request leave (any employee can do this)
router.post("/request", authorize("hr:employee:view"), requestLeave);

// Route for viewing leave history (employees see their own, managers can see all)
router.get("/", authorize("hr:employee:view"), getLeaveHistory);

// Administrative route for managers to approve/reject leave
router.patch("/:id/status", authorize("hr:leave:manage"), updateLeaveStatus);

module.exports = router;
