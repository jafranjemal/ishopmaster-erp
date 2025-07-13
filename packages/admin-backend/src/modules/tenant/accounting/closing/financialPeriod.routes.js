const express = require("express");
const ctrl = require("./financialPeriod.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();

router.use(protect, authorize("accounting:closing:manage"));

router.route("/").get(ctrl.getAllPeriods).post(ctrl.createPeriod);

router.route("/:id").put(ctrl.updatePeriod);
// Delete route can be added later if needed, but closing is preferred over deleting.

module.exports = router;
