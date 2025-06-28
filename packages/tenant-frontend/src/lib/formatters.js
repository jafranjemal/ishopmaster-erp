/**
 * Centralized utility module for data formatting in ERP or dashboard apps.
 */

/**
 * Formats a number as full currency (e.g., "LKR18,000.00")
 * @param {number} amount - The numerical value to format.
 * @param {string} currencyCode - ISO 4217 currency code (e.g., 'USD', 'LKR', 'INR').
 * @returns {string}
 */
export const formatCurrency = (amount, currencyCode = "USD") => {
  const numericAmount = typeof amount === "number" ? amount : 0;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formats large numbers using compact notation (e.g., "1.2K", "3.4M") — without currency.
 * @param {number} num - The numeric value to format.
 * @param {number} digits - Number of decimal places (default 1).
 * @returns {string}
 */
export const formatNumber = (num, digits = 1) => {
  if (typeof num !== "number" || isNaN(num)) return num;

  const lookup = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
    { value: 1, symbol: "" },
  ];

  const item = lookup.find((item) => num >= item.value);
  if (!item) return num.toString();

  const formatted = (num / item.value).toFixed(digits).replace(/\.0$/, "");
  return formatted + item.symbol;
};

/**
 * Formats large numbers as compact currency (e.g., "LKR 1.8K", "USD 2.4M")
 * @param {number} amount - Numeric amount
 * @param {string} currencyCode - Currency code, default "LKR"
 * @param {number} digits - Decimal places (default 1)
 * @returns {string}
 */
export const formatCurrencyCompact = (
  amount,
  currencyCode = "LKR",
  digits = 1
) => {
  const numericAmount = typeof amount === "number" ? amount : 0;

  if (numericAmount < 1000) {
    return formatCurrency(numericAmount, currencyCode);
  }

  const compact = formatNumber(numericAmount, digits);
  return `${currencyCode} ${compact}`;
};

/**
 * Formats a Date object or date string into 'MM/DD/YYYY'
 * @param {string|Date} date - A string or Date object.
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "N/A";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return dateObj.toLocaleDateString("en-US", options);
};
