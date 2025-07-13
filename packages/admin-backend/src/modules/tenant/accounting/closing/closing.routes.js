const express = require("express");
const ctrl = require("./closing.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("accounting:closing:manage"));

router.get("/status/:periodId", ctrl.getClosingStatus);
router.post("/close/:periodId", ctrl.closePeriod);

module.exports = router;
