const asyncHandler = require("./asyncHandler");

/**
 * Middleware to protect public-facing webhook endpoints.
 * Checks for a specific API key in the headers.
 */
const apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  // The tenant's specific API key would be stored on the tenant document.
  // For now, we use a global one from environment variables for simplicity.
  const validApiKey = process.env.WEBHOOK_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid API Key" });
  }

  next();
});

module.exports = apiKeyAuth;
