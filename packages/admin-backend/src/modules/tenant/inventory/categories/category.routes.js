const express = require("express");
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./category.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(getAllCategories).post(createCategory);
router.route("/:id").put(updateCategory).delete(deleteCategory);

module.exports = router;
