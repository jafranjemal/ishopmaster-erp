const mongoose = require("mongoose");

/**
 * Stores the historical exchange rate between two currencies for a specific date.
 * This creates an auditable record of rates used in transactions.
 */
const exchangeRateSchema = new mongoose.Schema(
  {
    fromCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    toCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    rate: {
      type: Number,
      required: [true, "Exchange rate is required."],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Create a compound unique index to ensure there's only one rate per day for a currency pair.
exchangeRateSchema.index(
  { fromCurrency: 1, toCurrency: 1, date: 1 },
  { unique: true }
);

module.exports = exchangeRateSchema;
