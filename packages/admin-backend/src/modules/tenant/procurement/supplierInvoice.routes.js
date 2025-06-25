const express = require("express");
const {
  createAndPostInvoice,
  getAllInvoices,
  getInvoiceById,
  recordPaymentForInvoice,
} = require("./supplierInvoice.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require an authenticated user.
router.use(protect);

router
  .route("/")
  .get(authorize("accounting:payables:view"), getAllInvoices)
  .post(authorize("accounting:payables:manage"), createAndPostInvoice);

router.route("/:id").get(authorize("accounting:payables:view"), getInvoiceById);

// Special action route for creating a payment against an invoice
router
  .route("/:id/payments")
  .post(authorize("accounting:payables:manage"), recordPaymentForInvoice);

module.exports = router;
