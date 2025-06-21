const asyncHandler = require("../../../middleware/asyncHandler");

// --- ATTRIBUTE CONTROLLERS ---
exports.getAllAttributes = asyncHandler(async (req, res, next) => {
  const { Attribute } = req.models;
  res
    .status(200)
    .json({ success: true, data: await Attribute.find({}).sort({ name: 1 }) });
});
exports.createAttribute = asyncHandler(async (req, res, next) => {
  const { Attribute } = req.models;
  res
    .status(201)
    .json({ success: true, data: await Attribute.create(req.body) });
});
exports.updateAttribute = asyncHandler(async (req, res, next) => {
  const { Attribute } = req.models;
  const attr = await Attribute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!attr)
    return res
      .status(404)
      .json({ success: false, error: "Attribute not found" });
  res.status(200).json({ success: true, data: attr });
});
exports.deleteAttribute = asyncHandler(async (req, res, next) => {
  /* ... add integrity check against AttributeSet ... */
});

// --- ATTRIBUTE SET CONTROLLERS ---
exports.getAllAttributeSets = asyncHandler(async (req, res, next) => {
  const { AttributeSet } = req.models;
  res
    .status(200)
    .json({
      success: true,
      data: await AttributeSet.find({})
        .populate("attributes", "name")
        .sort({ name: 1 }),
    });
});
exports.createAttributeSet = asyncHandler(async (req, res, next) => {
  const { AttributeSet } = req.models;
  res
    .status(201)
    .json({ success: true, data: await AttributeSet.create(req.body) });
});
exports.updateAttributeSet = asyncHandler(async (req, res, next) => {
  /* ... */
});
exports.deleteAttributeSet = asyncHandler(async (req, res, next) => {
  /* ... add integrity check against ProductTemplate ... */
});
