const express = require("express");
const { getAllPayments, getPaymentById, recordPayment } = require("./payment.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

router.route("/").post(authorize("accounting:payment:create"), recordPayment).get(authorize("accounting:payment:view"), getAllPayments);
router.route("/:id").get(authorize("accounting:payment:view"), getPaymentById);
module.exports = router;
