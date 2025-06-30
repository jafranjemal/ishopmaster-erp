const express = require("express");
const {
  generatePrintJob,
  generateLabelPreview,
} = require("./print.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require a user with inventory viewing permissions
router.use(protect, authorize("inventory:product:view"));
router.post("/label-preview", generateLabelPreview);
router.post("/labels", generatePrintJob);

module.exports = router;
