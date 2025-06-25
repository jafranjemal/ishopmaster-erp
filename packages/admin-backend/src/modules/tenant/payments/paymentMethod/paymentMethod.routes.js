const express = require("express");
const {
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require("./paymentMethod.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

// Protect all routes and authorize for users who can access settings
router.use(protect, authorize("settings:access"));

router.route("/").get(getAllPaymentMethods).post(createPaymentMethod);

router.route("/:id").put(updatePaymentMethod).delete(deletePaymentMethod);

module.exports = router;
