const express = require("express");
const ctrl = require("./pricing.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("sales:pricing:manage"));

// Pricing Rules Routes
router.route("/rules").get(ctrl.getAllPricingRules).post(ctrl.createPricingRule);

router.route("/rules/:id").put(ctrl.updatePricingRule).delete(ctrl.deletePricingRule);

// Promotions Routes
router.route("/promotions").get(ctrl.getAllPromotions).post(ctrl.createPromotion);

router.route("/promotions/:id").put(ctrl.updatePromotion).delete(ctrl.deletePromotion);

module.exports = router;
