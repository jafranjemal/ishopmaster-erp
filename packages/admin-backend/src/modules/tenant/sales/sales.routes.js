const express = require("express");
const { createSale } = require("./sales.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();
router.use(protect, authorize("sales:pos:access"));

router.route("/").post(createSale);

module.exports = router;
