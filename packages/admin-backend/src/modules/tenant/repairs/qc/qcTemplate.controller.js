const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllQcTemplates = asyncHandler(async (req, res, next) => {
  const { QcChecklistTemplate } = req.models;
  const templates = await QcChecklistTemplate.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ success: true, data: templates });
});

exports.createQcTemplate = asyncHandler(async (req, res, next) => {
  const { QcChecklistTemplate } = req.models;
  const template = await QcChecklistTemplate.create(req.body);
  res.status(201).json({ success: true, data: template });
});

exports.getQcTemplateById = asyncHandler(async (req, res, next) => {
  const { QcChecklistTemplate } = req.models;
  const template = await QcChecklistTemplate.findById(req.params.id);
  if (!template) return res.status(404).json({ success: false, error: "QC Template not found." });
  res.status(200).json({ success: true, data: template });
});

exports.updateQcTemplate = asyncHandler(async (req, res, next) => {
  const { QcChecklistTemplate } = req.models;
  const template = await QcChecklistTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!template) return res.status(404).json({ success: false, error: "QC Template not found." });
  res.status(200).json({ success: true, data: template });
});

exports.deleteQcTemplate = asyncHandler(async (req, res, next) => {
  const { QcChecklistTemplate } = req.models;
  const template = await QcChecklistTemplate.findByIdAndDelete(req.params.id);
  if (!template) return res.status(404).json({ success: false, error: "QC Template not found." });
  res.status(200).json({ success: true, data: {} });
});
