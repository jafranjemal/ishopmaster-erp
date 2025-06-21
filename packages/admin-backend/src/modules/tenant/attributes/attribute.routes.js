const express = require("express");
const ctrl = require("./attribute.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();
router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(ctrl.getAllAttributes).post(ctrl.createAttribute);
router.route("/:id").put(ctrl.updateAttribute).delete(ctrl.deleteAttribute);

router
  .route("/sets")
  .get(ctrl.getAllAttributeSets)
  .post(ctrl.createAttributeSet);
router
  .route("/sets/:id")
  .put(ctrl.updateAttributeSet)
  .delete(ctrl.deleteAttributeSet);

module.exports = router;
