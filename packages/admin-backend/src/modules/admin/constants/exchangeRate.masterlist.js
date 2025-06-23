/**
 * Dynamically generates a 7-day historical exchange rate seed list.
 * This simulates realistic data for a new tenant.
 */
const generateRecentRates = () => {
  const rates = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const baseRates = {
    EUR: 0.92,
    JPY: 157.5,
    GBP: 0.78,
    AUD: 1.5,
    CAD: 1.37,
    CHF: 0.89,
    CNH: 7.26,
    INR: 83.5,
    LKR: 301.75,
  };

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    for (const [currency, baseRate] of Object.entries(baseRates)) {
      // Add a small, realistic fluctuation for each day
      const fluctuation = (Math.random() - 0.5) * 0.01; // +/- 0.5%
      const finalRate = baseRate * (1 + fluctuation);

      rates.push({
        fromCurrency: "USD",
        toCurrency: currency,
        rate: parseFloat(finalRate.toFixed(4)),
        date: new Date(date), // Ensure it's a new date object
      });
    }
  }

  return rates;
};

module.exports = generateRecentRates();
