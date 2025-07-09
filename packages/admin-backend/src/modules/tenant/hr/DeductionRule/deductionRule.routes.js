const express = require("express");
const ctrl = require("./deductionRule.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require a user with payroll management permissions
router.use(protect, authorize("hr:payroll:manage"));

router.route("/").get(ctrl.getAllDeductionRules).post(ctrl.createDeductionRule);

router.route("/:id").put(ctrl.updateDeductionRule).delete(ctrl.deleteDeductionRule);

module.exports = router;
