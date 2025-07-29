const express = require("express")
const { printDocument, sendDocumentByEmail } = require("./document.controller") // Assuming a new controller file
const { protect } = require("../../../../middleware/auth.middleware")
const router = express.Router()

// This is a read-only operation, but should still be protected.
router.get("/", protect, printDocument)
router.post(
  "/send-email",
  protect,
  //authorize('sales:invoice:send'),
  sendDocumentByEmail
)
module.exports = router
