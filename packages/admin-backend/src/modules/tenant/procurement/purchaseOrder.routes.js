const express = require("express");
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  receiveGoods,
  // updatePurchaseOrder,
  // cancelPurchaseOrder
} = require("./purchaseOrder.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require an authenticated user.
router.use(protect);

router
  .route("/")
  .get(authorize("procurement:po:view"), getAllPurchaseOrders)
  .post(authorize("procurement:po:create"), createPurchaseOrder);

router
  .route("/:id")
  .get(authorize("procurement:po:view"), getPurchaseOrderById);
// .put(authorize('procurement:po:edit'), updatePurchaseOrder)
// .delete(authorize('procurement:po:cancel'), cancelPurchaseOrder);

router
  .route("/:id/receive")
  .post(authorize("procurement:po:receive"), receiveGoods);

module.exports = router;
