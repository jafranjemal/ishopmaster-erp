/**
 * Calculates the optimal combination of bills and coins for a given change amount
 * using a greedy algorithm.
 * @param {number} changeDue - The total amount of change to be given.
 * @param {Array<object>} denominations - The available denominations, must be sorted high to low.
 * @returns {Array<object>} An array like [{ name, value, count }]
 */
export const calculateChange = (changeDue, denominations) => {
  if (typeof changeDue !== 'number' || changeDue <= 0 || !Array.isArray(denominations)) {
    return [];
  }

  let remaining = changeDue;
  const changeBreakdown = [];

  // Ensure denominations are sorted from highest value to lowest
  const sortedDenominations = [...denominations].sort((a, b) => b.value - a.value);

  for (const denom of sortedDenominations) {
    if (remaining >= denom.value) {
      const count = Math.floor(remaining / denom.value);
      if (count > 0) {
        changeBreakdown.push({ ...denom, count });
        remaining = parseFloat((remaining - count * denom.value).toFixed(2));
      }
    }
  }
  return changeBreakdown;
};
