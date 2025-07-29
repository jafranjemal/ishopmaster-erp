const asyncHandler = require("../../../../middleware/asyncHandler")
const documentService = require("../../../../services/document.service")
const docTemp = require("./document.temp.service")
const crypto = require("crypto")

/**
 * @desc    Render a document and stream it as a PDF
 * @route   GET /api/v1/tenant/documents/print?templateId=...&dataId=...
 * @access  Private
 */
exports.printDocumentss = asyncHandler(async (req, res, next) => {
  const { templateId, dataId, style } = req.query
  if (!templateId || !dataId) {
    return res.status(400).json({ success: false, error: "Template ID and Data ID are required." })
  }
  //const pdfBuffer = await docTemp.generateRepairTicketPDF(req, res)
  const pdfBuffer = await documentService.renderDocument(req.models, { templateId, dataId, style })
  const randomSuffix = crypto.randomBytes(6).toString("hex")
  const filename = `document-${dataId}-${new Date().getTime().toString()}.pdf`
  console.log("filename ", filename)
  res.setHeader("Content-Type", "application/pdf")
  //res.setHeader("Content-Disposition", `inline; filename=${filename}`)
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
  res.send(pdfBuffer)
})

exports.printDocument = asyncHandler(async (req, res, next) => {
  const { templateId, dataId, style } = req.query

  if (!templateId || !dataId) {
    return res.status(400).json({
      success: false,
      error: "Template ID and Data ID are required.",
    })
  }

  try {
    const pdfBuffer = await docTemp.generateRepairTicketPDF(req)

    if (!pdfBuffer) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate PDF",
      })
    }

    // console.log(pdfBuffer)

    const filename = `document-${dataId}-${Date.now()}.pdf`

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename=${filename}`)
    //res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf")
    res.send(pdfBuffer)
  } catch (err) {
    console.error("PDF generation failed:", err)
    res.status(500).json({ success: false, error: "Internal Server Error" })
  }
})

/**
 * @desc    Render a document and send it via email as a PDF attachment.
 * @route   POST /api/v1/tenant/documents/send-email
 * @access  Private
 */
exports.sendDocumentByEmail = asyncHandler(async (req, res, next) => {
  const { templateId, dataId, emailTemplateId, recipientEmail } = req.body

  const result = await documentService.sendDocumentByEmail(req.models, {
    templateId,
    dataId,
    emailTemplateId,
    recipientEmail,
    userId: req.user._id,
  })

  res.status(200).json({ success: true, data: result })
})
