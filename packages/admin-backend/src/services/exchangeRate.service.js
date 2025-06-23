/**
 * The ExchangeRateService is responsible for fetching and managing currency
 * conversion rates. It provides a single source of truth for all currency operations.
 */
class ExchangeRateService {
  /**
   * Gets the exchange rate between two currencies for a specific date.
   * Includes fallback logic to find the most recent rate if an exact match isn't found.
   * @param {object} models - The tenant's compiled models, including ExchangeRate.
   * @param {string} fromCurrency - The 3-letter ISO code of the source currency (e.g., 'USD').
   * @param {string} toCurrency - The 3-letter ISO code of the target currency (e.g., 'LKR').
   * @param {Date} date - The date for which to find the rate.
   * @returns {Promise<number>} The exchange rate.
   */
  async getRate(models, { fromCurrency, toCurrency, date }) {
    const { ExchangeRate } = models;

    // If converting to the same currency, the rate is always 1.
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Normalize the date to the beginning of the day (UTC) for consistent lookups.
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // 1. First, try to find an exact match for the given date.
    let rateRecord = await ExchangeRate.findOne({
      fromCurrency,
      toCurrency,
      date: targetDate,
    }).lean();

    // 2. Fallback Logic: If no exact match, find the most recent rate on or before the target date.
    if (!rateRecord) {
      console.log(
        `No exact rate found for ${fromCurrency}->${toCurrency} on ${targetDate}. Searching for most recent.`
      );
      rateRecord = await ExchangeRate.findOne({
        fromCurrency,
        toCurrency,
        date: { $lte: targetDate },
      })
        .sort({ date: -1 }) // Sort by date descending to get the most recent
        .lean();
    }

    if (!rateRecord) {
      throw new Error(
        `No exchange rate found for ${fromCurrency} to ${toCurrency} on or before ${
          targetDate.toISOString().split("T")[0]
        }`
      );
    }

    return rateRecord.rate;
  }
}

// Export a singleton instance.
module.exports = new ExchangeRateService();
