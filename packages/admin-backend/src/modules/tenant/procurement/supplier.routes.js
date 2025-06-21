const express = require("express");
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierLedger,
} = require("./supplier.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// Protect all routes in this file
router.use(protect);

// All routes require the 'procurement:supplier:manage' permission
router.use(authorize("procurement:supplier:manage"));

router.route("/").get(getAllSuppliers).post(createSupplier);

router
  .route("/:id")
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

router.route("/:id/ledger").get(getSupplierLedger);

module.exports = router;
