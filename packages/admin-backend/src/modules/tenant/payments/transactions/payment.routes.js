const express = require("express");
const { getAllPayments, getPaymentById } = require("./payment.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

router.route("/").get(authorize("accounting:payment:view"), getAllPayments);
router.route("/:id").get(authorize("accounting:payment:view"), getPaymentById);
module.exports = router;
