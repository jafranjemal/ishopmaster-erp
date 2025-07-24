const express = require("express");
const ctrl = require("./notificationTemplate.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const { getNotificationEvents } = require("./notificationEvents.controller");
const router = express.Router();

router.use(protect, authorize("settings:notifications:manage"));

router.route("/").get(ctrl.getAllTemplates).post(ctrl.createTemplate);

router.get("/notification-events", protect, getNotificationEvents);
router.route("/:id").get(ctrl.getTemplateById).put(ctrl.updateTemplate).delete(ctrl.deleteTemplate);
module.exports = router;
