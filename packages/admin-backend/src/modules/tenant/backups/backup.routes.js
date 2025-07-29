const express = require("express")
const { getTenantBackups } = require("./backup.controller")
const { protect, authorize } = require("../../../middleware/auth.middleware")

const router = express.Router()
router.use(protect, authorize("tenant:admin")) // Protect with tenant admin role
router.route("/").get(getTenantBackups)
module.exports = router
