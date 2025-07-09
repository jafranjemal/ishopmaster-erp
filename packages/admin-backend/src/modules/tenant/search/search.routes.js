const express = require("express");
const { findDocumentByNumber } = require("./search.controller");
const { protect } = require("../../../middleware/auth.middleware");
const router = express.Router();

router.get("/documents", protect, findDocumentByNumber);
module.exports = router;
