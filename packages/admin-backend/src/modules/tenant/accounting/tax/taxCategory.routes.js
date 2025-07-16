const express = require("express");
const ctrl = require("./taxCategory.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("accounting:tax:manage"));

router.route("/").get(ctrl.getAllTaxCategories).post(ctrl.createTaxCategory);
router.route("/:id").put(ctrl.updateTaxCategory).delete(ctrl.deleteTaxCategory);

module.exports = router;
