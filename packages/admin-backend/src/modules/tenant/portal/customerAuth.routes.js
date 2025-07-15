const express = require("express");
const ctrl = require("./customerAuth.controller");
const rateLimit = require("express-rate-limit");

// Rate limiter to prevent brute-force attacks on the public auth endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();
router.post("/validate-token", authLimiter, ctrl.validateToken);
router.post("/resend-link", authLimiter, ctrl.resendAccessLink);
module.exports = router;
