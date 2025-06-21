/**
 * A higher-order function to wrap async route handlers,
 * catching errors and passing them to the next error-handling middleware.
 * This avoids repetitive try-catch blocks in controllers.
 * @param {Function} fn The async function to execute.
 * @returns {Function} An Express route handler function.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
