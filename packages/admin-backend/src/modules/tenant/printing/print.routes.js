const express = require("express")
const ctrl = require("./print.controller")
const { protect, authorize } = require("../../../middleware/auth.middleware")
const router = express.Router()

router.use(protect) // All routes require a login

// Endpoint for frontend to create a new job
router.post(
  "/jobs",
  //authorize("sales:pos:print"),
  ctrl.createPrintJob
)

// Endpoint for the local Hardware Bridge to poll for jobs
router.get(
  "/queue",
  //authorize("hardware:bridge:access"),
  ctrl.getPrintQueue
)

// Endpoint for the local Hardware Bridge to update a job's status
router.patch(
  "/jobs/:id/status",
  //authorize("hardware:bridge:access"),
  ctrl.updatePrintJobStatus
)

module.exports = router
