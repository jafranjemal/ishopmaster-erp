const express = require("express");
const ctrl = require("./lead.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("crm:lead:view"));

router.route("/").get(ctrl.getAllLeads).post(authorize("crm:lead:manage"), ctrl.createLead);
router.route("/:id").get(ctrl.getLeadById).put(authorize("crm:lead:manage"), ctrl.updateLead);

router.post("/:id/convert", authorize("crm:lead:manage"), ctrl.convertLead);

module.exports = router;
