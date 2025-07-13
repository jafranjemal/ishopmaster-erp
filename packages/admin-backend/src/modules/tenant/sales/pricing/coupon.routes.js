const express = require("express");
const ctrl = require("./coupon.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

// --- Administrative Routes for Managing Coupon Campaigns ---
const adminRouter = express.Router();
adminRouter.use(protect, authorize("sales:pricing:manage"));

adminRouter.route("/batches").get(ctrl.getAllCouponBatches).post(ctrl.createCouponBatch);
adminRouter.route("/batches/:id").put(ctrl.updateCouponBatch);
adminRouter.route("/batches/:id/generate").post(ctrl.generateCouponsFromBatch);
adminRouter.get("/by-batch/:batchId", ctrl.getCouponsForBatch);

// --- POS Route for Validating and Redeeming a Coupon ---
const posRouter = express.Router();
posRouter.use(protect, authorize("sales:pos:access"));

posRouter.post("/validate", ctrl.validateAndLockCoupon);

// Mount both sets of routes
router.use(adminRouter);
router.use(posRouter);

module.exports = router;
