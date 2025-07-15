const express = require("express");
const ctrl = require("./budget.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("accounting:budget:manage"));

router.route("/").get(ctrl.getBudgets).post(ctrl.createOrUpdateBudget);

router.route("/:id").delete(ctrl.deleteBudget);
// A PUT route for updating by ID could be added if needed, but the upsert is more efficient for a spreadsheet UI.

module.exports = router;
