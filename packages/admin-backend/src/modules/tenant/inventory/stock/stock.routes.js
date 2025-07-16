const express = require("express");
const {
  getStockLevels,
  getStockDetails,
  getStockMovements,
  getStockSummary,
  receiveTransferOrder,
  dispatchTransferOrder,
  createTransfer,
  createStockAdjustment,
  getAllTransfers,
  getTransferById,
  cancelTransfer,
  getLotQuantityForVariant,
  getAvailableSerials,
  getLotsForVariant,
} = require("./stock.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const ctrl = require("./stock.controller");
const router = express.Router();

// Protect all routes in this file
router.use(protect, authorize("inventory:product:view"));

// Stock Viewing Routes
router.get("/summary", authorize("inventory:product:view"), getStockSummary);
router.get("/levels", authorize("inventory:product:view"), getStockLevels);
router.get("/details/:variantId", authorize("inventory:product:view"), getStockDetails);
router.get("/movements/:variantId", authorize("inventory:product:view"), getStockMovements);
router.get("/breakdown/:variantId", ctrl.getStockBreakdown);
// Stock Adjustment Route
router.post("/adjustments", authorize("inventory:stock:adjust"), createStockAdjustment);

// Stock Transfer Routes
router
  .route("/transfers")
  .get(authorize("inventory:stock:transfer"), getAllTransfers)
  .post(authorize("inventory:stock:transfer"), createTransfer);

router.get("/lot-quantity", authorize("inventory:product:view"), getLotQuantityForVariant);
router.get("/available-serials", authorize("inventory:product:view"), getAvailableSerials);

router.get("/lots-for-variant", authorize("sales:pos:access"), getLotsForVariant);

router.route("/transfers/:id").get(authorize("inventory:stock:transfer"), getTransferById);

router.post(
  "/transfers/:id/dispatch",
  authorize("inventory:stock:transfer"),
  dispatchTransferOrder
);
router.post("/transfers/:id/receive", authorize("inventory:stock:transfer"), receiveTransferOrder);
router.patch("/transfers/:id/cancel", authorize("inventory:stock:transfer"), cancelTransfer);

module.exports = router;
