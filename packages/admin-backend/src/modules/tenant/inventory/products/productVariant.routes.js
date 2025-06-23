const express = require("express");
const {
  getAllVariants,
  updateVariant,
  searchVariants,
  bulkUpdateVariants,
} = require("./productVariant.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");
const {
  getAllTemplates,
  createTemplate,
} = require("./productTemplate.controller");

const router = express.Router();

router.use(protect, authorize("inventory:product:view"));

router.route("/").get(getAllVariants);
router.route("/search").get(searchVariants);
router.route("/:id").put(authorize("inventory:product:manage"), updateVariant);
router.patch(
  "/bulk-update",
  protect,
  authorize("inventory:product:manage"),
  bulkUpdateVariants
);
//router.route("/").get(getAllTemplates).post(createTemplate);
module.exports = router;
