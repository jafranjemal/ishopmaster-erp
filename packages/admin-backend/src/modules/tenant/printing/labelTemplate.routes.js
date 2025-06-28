const express = require("express");
const ctrl = require("./labelTemplate.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("settings:printing:manage"));

router.route("/").get(ctrl.getAllLabelTemplates).post(ctrl.createLabelTemplate);
router
  .route("/:id")
  .get(ctrl.getLabelTemplateById)
  .put(ctrl.updateLabelTemplate)
  .delete(ctrl.deleteLabelTemplate);

module.exports = router;
