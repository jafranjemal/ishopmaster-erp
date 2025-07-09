const express = require("express");
const ctrl = require("./opportunity.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("crm:opportunity:view"));

router
  .route("/")
  .get(ctrl.getAllOpportunities)
  .post(authorize("crm:opportunity:manage"), ctrl.createOpportunity);

router
  .route("/:id")
  .get(ctrl.getOpportunityById)
  .put(authorize("crm:opportunity:manage"), ctrl.updateOpportunity);

router.patch("/:id/stage", authorize("crm:opportunity:manage"), ctrl.updateOpportunityStage);

module.exports = router;
