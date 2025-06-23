/**
 * Master list of the 10 most popular world currencies to be seeded for new tenants.
 */
const CURRENCIES = [
  { name: "US Dollar", code: "USD", symbol: "$" },
  { name: "Euro", code: "EUR", symbol: "€" },
  { name: "Japanese Yen", code: "JPY", symbol: "¥" },
  { name: "British Pound", code: "GBP", symbol: "£" },
  { name: "Australian Dollar", code: "AUD", symbol: "A$" },
  { name: "Canadian Dollar", code: "CAD", symbol: "C$" },
  { name: "Swiss Franc", code: "CHF", symbol: "Fr" },
  { name: "Chinese Yuan", code: "CNH", symbol: "¥" },
  { name: "Indian Rupee", code: "INR", symbol: "₹" },
  { name: "Sri Lankan Rupee", code: "LKR", symbol: "Rs" },
];

module.exports = CURRENCIES;
