const express = require("express");
const {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("./brand.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect, authorize("inventory:product:manage")); // Use a general permission for now

router.route("/").get(getAllBrands).post(createBrand);
router.route("/:id").put(updateBrand).delete(deleteBrand);

module.exports = router;
