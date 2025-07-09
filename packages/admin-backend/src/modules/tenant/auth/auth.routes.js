const express = require("express");
const { login, validateAccessCard } = require("./auth.controller");
const { protect } = require("../../../middleware/auth.middleware");
const router = express.Router();
router.post("/auth/validate-card", protect, validateAccessCard);
router.post("/login", login);
module.exports = router;
