const express = require("express");
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerLedger,
} = require("./customer.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// Protect all routes in this file
router.use(protect);

// All routes require the 'crm:customer:manage' permission
router.use(authorize("crm:customer:manage"));

router.route("/").get(getAllCustomers).post(createCustomer);

router
  .route("/:id")
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

router
  .route("/:id/ledger")
  .get(authorize("crm:customer:view_financials"), getCustomerLedger);

module.exports = router;
