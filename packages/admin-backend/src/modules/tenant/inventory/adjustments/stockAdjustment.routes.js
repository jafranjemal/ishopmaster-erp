const express = require("express");
const { getAdjustmentHistory } = require("./stockAdjustment.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require a user with stock adjustment permissions
router.use(protect, authorize("inventory:stock:adjust"));

router.get("/history", getAdjustmentHistory);

// The POST /adjustments route would live here as well

module.exports = router;
