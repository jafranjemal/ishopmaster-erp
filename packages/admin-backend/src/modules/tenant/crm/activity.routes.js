const express = require("express");
const ctrl = require("./activity.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

// Secure all routes with a base CRM permission
router.use(protect, authorize("crm:lead:view"));

router
  .route("/")
  .get(ctrl.getAllActivities)
  .post(authorize("crm:lead:manage"), ctrl.createActivity);

module.exports = router;
