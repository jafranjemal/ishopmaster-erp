const express = require("express");
const {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAllLedgerEntries,
  getChartOfAccounts,
} = require("./accounting.controller");

// Import our security middleware
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures that only authenticated tenant users can access any of these endpoints.
router.use(protect);

// --- Chart of Accounts Routes ---
router
  .route("/accounts")
  .get(
    authorize("accounting:chart:view", "accounting:chart:manage"),
    getAllAccounts
  )
  .post(authorize("accounting:chart:manage"), createAccount);

router
  .route("/accounts/:id")
  .put(authorize("accounting:chart:manage"), updateAccount)
  .delete(authorize("accounting:chart:manage"), deleteAccount);

// --- General Ledger Routes ---
router
  .route("/ledger")
  .get(authorize("accounting:ledger:view"), getAllLedgerEntries);

router.route("/chart").get(getChartOfAccounts);

module.exports = router;
