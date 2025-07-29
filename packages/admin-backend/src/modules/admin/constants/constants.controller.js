const notificationEvents = require("./notificationEvents.masterlist")
const documentDataFields = require("./documentDataFields.masterlist") // <-- 1. IMPORT
const documentDataSources = require("./documentDataSources.masterlist")

/**
 * @desc    Get the master list of all possible notification events
 * @route   GET /api/v1/admin/constants/notification-events
 * @access  Private (Admin only)
 */
exports.getNotificationEvents = (req, res) => {
  res.status(200).json({ success: true, data: notificationEvents })
}

// --- Definitive Fix #1: Add the new controller for data fields ---
/**
 * @desc    Get the master list of available data fields for a specific document type
 * @route   GET /api/v1/admin/constants/document-data-fields?documentType=...
 * @access  Private (Admin only)
 */
exports.getDocumentDataFields = (req, res) => {
  const { documentType } = req.query
  if (!documentType || !documentDataFields[documentType]) {
    return res.status(400).json({ success: false, error: "A valid documentType is required." })
  }
  res.status(200).json({ success: true, data: documentDataFields[documentType] })
}

/**
 * @desc    Get the master list of available data fields for a specific document type
 * @route   GET /api/v1/admin/constants/document-data-sources/:documentType
 * @access  Private (Admin only)
 */
exports.getDocumentDataSources = (req, res) => {
  const { documentType } = req.params
  const dataSources = documentDataSources[documentType]

  if (!dataSources) {
    return res.status(404).json({ success: false, error: `Data sources for document type "${documentType}" not found.` })
  }
  res.status(200).json({ success: true, data: dataSources })
}
