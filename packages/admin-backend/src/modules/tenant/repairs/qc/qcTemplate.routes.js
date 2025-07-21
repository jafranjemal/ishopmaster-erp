const express = require("express");
const ctrl = require("./qcTemplate.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("service:qc:manage"));

router.route("/").get(ctrl.getAllQcTemplates).post(ctrl.createQcTemplate);

router.route("/:id").get(ctrl.getQcTemplateById).put(ctrl.updateQcTemplate).delete(ctrl.deleteQcTemplate);

module.exports = router;
