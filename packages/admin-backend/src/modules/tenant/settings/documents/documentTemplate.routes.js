const express = require("express")
const ctrl = require("./documentTemplate.controller")
const { protect, authorize } = require("../../../../middleware/auth.middleware")
const router = express.Router()

router.use(protect, authorize("settings:access"))

router.route("/").get(ctrl.getAllTemplates).post(ctrl.createTemplate)

router.route("/:id").get(ctrl.getTemplateById).put(ctrl.updateTemplate).delete(ctrl.deleteTemplate)

module.exports = router
