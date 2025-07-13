const express = require("express");
const ctrl = require("./warrantyPolicy.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(ctrl.getAllWarrantyPolicies).post(ctrl.createWarrantyPolicy);
router
  .route("/:id")
  .get(ctrl.getWarrantyPolicyById)
  .put(ctrl.updateWarrantyPolicy)
  .delete(ctrl.deleteWarrantyPolicy);

module.exports = router;
