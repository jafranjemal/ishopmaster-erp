const express = require("express");
const ctrl = require("./cashDrawerDenomination.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("settings:pos:manage"));
router.route("/").get(ctrl.getAllDenominations).post(ctrl.createDenomination);
router.route("/:id").put(ctrl.updateDenomination).delete(ctrl.deleteDenomination);

module.exports = router;
