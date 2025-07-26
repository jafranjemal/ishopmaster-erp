const express = require("express")
const ctrl = require("./hardwareDevice.controller")
const { protect, authorize } = require("../../../../middleware/auth.middleware")
const router = express.Router()

router.use(protect, authorize("settings:access"))

router.route("/").get(ctrl.getAllHardware).post(ctrl.createHardware)

router.route("/:id").get(ctrl.getHardwareById).put(ctrl.updateHardware).delete(ctrl.deleteHardware)

module.exports = router
