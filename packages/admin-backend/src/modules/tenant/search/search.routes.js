const express = require("express")
const { findDocumentByNumber, findDocument } = require("./search.controller")
const { protect } = require("../../../middleware/auth.middleware")
const router = express.Router()

router.get("/documents", protect, findDocumentByNumber)
router.get("/", findDocument)
module.exports = router
