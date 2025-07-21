const express = require("express");
const ctrl = require("./portalQuote.controller");
// This route does not use the standard 'protect' or 'authorize' middleware for staff

const router = express.Router();

router.get("/:id", ctrl.getPublicQuoteById);
router.post("/:id/approve", ctrl.approveQuote);

module.exports = router;
