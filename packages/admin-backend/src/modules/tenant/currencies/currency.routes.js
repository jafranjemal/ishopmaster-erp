const express = require("express");
const {
  // Currency CRUD
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  // Exchange Rate CRUD
  getExchangeRates,
  createOrUpdateExchangeRate,
  deleteExchangeRate,
} = require("./currency.controller");

const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file require a user to be authenticated.
router.use(protect);

// All routes in this file require a general settings permission.
// We could make this even more granular if needed (e.g., 'settings:currency:manage')
router.use(authorize("settings:access"));

// --- Routes for managing the list of supported currencies ---
router.route("/").get(getAllCurrencies).post(createCurrency);

router.route("/:id").put(updateCurrency).delete(deleteCurrency);

// --- Routes for managing daily exchange rates ---
router.route("/rates").get(getExchangeRates).post(createOrUpdateExchangeRate);

router.route("/rates/:id").delete(deleteExchangeRate);

module.exports = router;
