const express = require("express");
const ctrl = require("./shift.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect, authorize("sales:pos:access"));

router.post("/open", ctrl.openShift);
router.patch("/:id/close", ctrl.closeShift);
router.get("/active", ctrl.getActiveShift);
router.get("/history", ctrl.getShiftHistory);

module.exports = router;
