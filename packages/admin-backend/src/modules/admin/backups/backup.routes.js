const express = require("express")
const { getAllBackups, restoreBackup, triggerManualBackup } = require("./backup.controller")
//const { protect, authorize } = require("../../../middleware/auth.middleware") // Assuming admin auth

const router = express.Router()
//router.use(protect, authorize("superadmin")) // Protect these routes
router.route("/").get(getAllBackups)
router.route("/trigger").post(triggerManualBackup)
router.route("/:id/restore").post(restoreBackup)

module.exports = router
