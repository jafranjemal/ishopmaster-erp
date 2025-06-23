/**
 * A centralized place for all data formatting utilities.
 */

/**
 * Formats a number as currency according to a specific currency code.
 * @param {number} amount - The numerical value to format.
 * @param {string} currencyCode - The 3-letter ISO currency code (e.g., 'USD', 'LKR', 'INR').
 * @returns {string} A formatted currency string.
 */
export const formatCurrency = (amount, currencyCode) => {
  // Default to 0 if the amount is not a valid number
  const numericAmount = typeof amount === "number" ? amount : 0;

  // Use the browser's built-in Internationalization API for robust formatting.
  return new Intl.NumberFormat("en-US", {
    // Using 'en-US' locale for consistent number format, currency symbol is separate
    style: "currency",
    currency: currencyCode || "USD", // Fallback to USD if no code is provided
  }).format(numericAmount);
};
/**
 * Formats a date string into a more readable format.
 * @param {string|Date} date - The date to format, can be a string or Date object.
 * @returns {string} A formatted date string in 'MM/DD/YYYY' format.
 */
export const formatDate = (date) => {
  if (!date) return "N/A"; // Handle null or undefined dates

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date"; // Handle invalid date

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return dateObj.toLocaleDateString("en-US", options);
};
