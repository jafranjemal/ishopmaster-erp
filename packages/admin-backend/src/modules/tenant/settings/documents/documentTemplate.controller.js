const asyncHandler = require("../../../../middleware/asyncHandler")

exports.getAllTemplates = asyncHandler(async (req, res, next) => {
  const { DocumentTemplate } = req.models
  const templates = await DocumentTemplate.find(req.query).sort({ name: 1 })
  res.status(200).json({ success: true, data: templates })
})

exports.createTemplate = asyncHandler(async (req, res, next) => {
  const { DocumentTemplate } = req.models
  const template = await DocumentTemplate.create(req.body)
  res.status(201).json({ success: true, data: template })
})

exports.getTemplateById = asyncHandler(async (req, res, next) => {
  const { DocumentTemplate } = req.models
  const template = await DocumentTemplate.findById(req.params.id)
  if (!template) return res.status(404).json({ success: false, error: "Document template not found." })
  res.status(200).json({ success: true, data: template })
})

exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const { DocumentTemplate } = req.models
  const template = await DocumentTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!template) return res.status(404).json({ success: false, error: "Document template not found." })
  res.status(200).json({ success: true, data: template })
})

exports.deleteTemplate = asyncHandler(async (req, res, next) => {
  const { DocumentTemplate } = req.models
  const template = await DocumentTemplate.findByIdAndDelete(req.params.id)
  if (!template) return res.status(404).json({ success: false, error: "Document template not found." })
  res.status(200).json({ success: true, data: {} })
})
