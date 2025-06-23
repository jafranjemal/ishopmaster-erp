const express = require("express");
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateVariants,
  syncVariants,
} = require("./productTemplate.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(getAllTemplates).post(createTemplate);

router
  .route("/:id")
  .get(getTemplateById)
  .put(updateTemplate)
  .delete(deleteTemplate);

router.route("/:id/generate-variants").post(generateVariants);
// This is the new, definitive route for creating and managing variants
router.route("/:id/sync-variants").post(syncVariants);
module.exports = router;
