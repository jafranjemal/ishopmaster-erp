const express = require("express");
const ctrl = require("./reporting.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("accounting:reports:view"));

router.post("/consolidated-pl", ctrl.generateConsolidatedPL);
// Future routes for Balance Sheet, Cash Flow, etc., will be added here.

module.exports = router;
