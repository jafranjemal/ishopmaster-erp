const asyncHandler = require("../../../../middleware/asyncHandler")
const documentService = require("../../../../services/document.service")

/**
 * @desc    Render a document and stream it as a PDF
 * @route   GET /api/v1/tenant/documents/print?templateId=...&dataId=...
 * @access  Private
 */
exports.printDocument = asyncHandler(async (req, res, next) => {
  const { templateId, dataId } = req.query
  if (!templateId || !dataId) {
    return res.status(400).json({ success: false, error: "Template ID and Data ID are required." })
  }

  const pdfBuffer = await documentService.renderDocument(req.models, { templateId, dataId })

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `inline; filename=document-${dataId}.pdf`)
  res.send(pdfBuffer)
})
