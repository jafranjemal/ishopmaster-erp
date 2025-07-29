const express = require("express")
const { getNotificationEvents, getDocumentDataFields, getDocumentDataSources } = require("./constants.controller") // <-- 1. IMPORT
const { protect, authorize } = require("../../../middleware/auth.middleware")
const router = express.Router()

router.get("/notification-events", getNotificationEvents)

// --- Definitive Fix #1: Add the new route for data fields ---
router.get("/document-data-fields", getDocumentDataFields)
router.get("/document-data-sources/:documentType", getDocumentDataSources)

module.exports = router
