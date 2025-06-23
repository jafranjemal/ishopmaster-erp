const currencyRoutes = require("./currency.routes"); // To be added later
const currencySchema = require("./currency.schema");
const exchangeRateSchema = require("./exchangeRate.schema");

/**
 * Manifest file for the Currencies module.
 */
module.exports = {
  schemas: {
    Currency: currencySchema,
    ExchangeRate: exchangeRateSchema,
  },
  router: currencyRoutes,
};
