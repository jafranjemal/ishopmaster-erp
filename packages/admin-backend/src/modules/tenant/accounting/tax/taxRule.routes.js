const express = require("express");
const ctrl = require("./taxRule.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("accounting:tax:manage"));

router.route("/").get(ctrl.getAllTaxRules).post(ctrl.createTaxRule);
router.route("/:id").put(ctrl.updateTaxRule).delete(ctrl.deleteTaxRule);

module.exports = router;
