const express = require("express");
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getLinkedBrands,
  getLinkedDevices,
  getChildren,
} = require("./category.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(getAllCategories).post(createCategory);
router.route("/:id").put(updateCategory).delete(deleteCategory);
router.get("/:id/brands", getLinkedBrands);
router.get("/:id/devices", getLinkedDevices);
router.get("/children/:parentId", getChildren);
module.exports = router;
