const express = require("express");
const {
  getStockLevels,
  getStockDetails,
  getStockMovements,
} = require("./stock.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

// Protect all routes in this file
router.use(protect, authorize("inventory:product:view"));

router.get("/levels", getStockLevels);
router.get("/details/:variantId", getStockDetails);
router.get("/movements/:variantId", getStockMovements);

module.exports = router;
