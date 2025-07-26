const express = require("express")
const { printDocument } = require("./document.controller") // Assuming a new controller file
const { protect } = require("../../../../middleware/auth.middleware")
const router = express.Router()

// This is a read-only operation, but should still be protected.
router.get("/", protect, printDocument)

module.exports = router
