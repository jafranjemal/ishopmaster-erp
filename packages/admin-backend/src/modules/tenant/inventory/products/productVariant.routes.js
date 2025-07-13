const express = require("express");
const {
  getAllVariants,
  updateVariant,
  searchVariants,
  bulkUpdateVariants,
  getVariantById,
  updateVariantImage,
} = require("./productVariant.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const { getAllTemplates, createTemplate } = require("./productTemplate.controller");

const router = express.Router();

router.use(protect, authorize("inventory:product:view"));

router.route("/").get(getAllVariants);
router.route("/search").get(searchVariants);
router
  .route("/:id")
  .get(protect, authorize("inventory:product:view"), getVariantById)
  .put(protect, authorize("inventory:product:manage"), updateVariant);
router.patch("/bulk-update", protect, authorize("inventory:product:manage"), bulkUpdateVariants);
router.route("/:id/image").put(protect, authorize("inventory:product:manage"), updateVariantImage);

//router.route("/").get(getAllTemplates).post(createTemplate);
module.exports = router;
