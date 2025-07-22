const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllTemplates = asyncHandler(async (req, res, next) => {
  const { NotificationTemplate } = req.models;
  const templates = await NotificationTemplate.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: templates });
});

exports.createTemplate = asyncHandler(async (req, res, next) => {
  const { NotificationTemplate } = req.models;
  const template = await NotificationTemplate.create(req.body);
  res.status(201).json({ success: true, data: template });
});

exports.getTemplateById = asyncHandler(async (req, res, next) => {
  const { NotificationTemplate } = req.models;
  const template = await NotificationTemplate.findById(req.params.id);
  if (!template) return res.status(404).json({ success: false, error: "Notification template not found." });
  res.status(200).json({ success: true, data: template });
});

exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const { NotificationTemplate } = req.models;
  const template = await NotificationTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!template) return res.status(404).json({ success: false, error: "Notification template not found." });
  res.status(200).json({ success: true, data: template });
});

exports.deleteTemplate = asyncHandler(async (req, res, next) => {
  const { NotificationTemplate } = req.models;
  const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
  if (!template) return res.status(404).json({ success: false, error: "Notification template not found." });
  res.status(200).json({ success: true, data: {} });
});
