const asyncHandler = require("../../../middleware/asyncHandler");

exports.getAllLabelTemplates = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const templates = await LabelTemplate.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: templates });
});

exports.getLabelTemplateById = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const template = await LabelTemplate.findById(req.params.id).lean();
  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Label template not found." });

  if (Array.isArray(template.content)) {
    template.content = template.content.map((el, index) => ({
      ...el,
      id: el._id?.toString?.() || `el_${Date.now()}_${index}`, // fallback for safety
    }));
  }

  res.status(200).json({ success: true, data: template });
});

// @desc    Create a new label template with a default layout
// @route   POST /api/v1/tenant/printing/label-templates
exports.createLabelTemplate = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const templateData = req.body;

  templateData.content = _generateDefaultContent({
    labelWidth: templateData?.labelWidth,
    labelHeight: templateData?.labelHeight,
    marginTop: templateData?.marginTop,
    marginLeft: templateData?.marginLeft,
    horizontalGap: templateData?.horizontalGap,
    verticalGap: templateData?.verticalGap,
  });

  const newTemplate = await LabelTemplate.create(templateData);
  res.status(201).json({ success: true, data: newTemplate });
});

exports.updateLabelTemplate = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const updatedTemplate = await LabelTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedTemplate)
    return res
      .status(404)
      .json({ success: false, error: "Label template not found." });
  res.status(200).json({ success: true, data: updatedTemplate });
});

exports.deleteLabelTemplate = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const template = await LabelTemplate.findById(req.params.id);
  if (!template)
    return res
      .status(404)
      .json({ success: false, error: "Label template not found." });
  if (template.isDefault)
    return res.status(400).json({
      success: false,
      error: "Cannot delete a default system template.",
    });

  await template.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

/**
 * Generates a default layout of elements based on label dimensions.
 * @param {number} width - The width of the label in mm.
 * @param {number} height - The height of the label in mm.
 * @returns {Array<object>} An array of content elements for the template.
 */
const _generateDefaultContentOld = (width, height) => {
  // Sensible defaults, assuming a standard price tag layout.
  // All coordinates and sizes are in mm for the template.
  return [
    {
      id: `el_${Date.now()}_name`,
      type: "text",
      dataField: "variantName",
      text: "Product Name",
      x: width * 0.05, // 5% from left
      y: height * 0.1, // 10% from top
      fontSize: 8,
      fontWeight: "bold",
    },
    {
      id: `el_${Date.now()}_price`,
      type: "text",
      dataField: "sellingPrice",
      text: "Price",
      x: width * 0.05,
      y: height * 0.3,
      fontSize: 14,
      fontWeight: "bold",
    },
    {
      id: `el_${Date.now()}_barcode`,
      type: "barcode",
      dataField: "sku",
      x: width * 0.05,
      y: height * 0.65,
      barcodeHeight: height * 0.25, // 25% of label height
      barcodeWidth: 1,
    },
  ];
};

/**
 * Generates a default layout of elements based on label dimensions (mm).
 * @param {number} width
 * @param {number} height
 * @returns {Array<object>} A visually optimized array of elements.
 */
/**
 * Generates a realistic, industry-standard default layout.
 * Content is centered within the usable label area (excluding margins/gaps).
 */
const _generateDefaultContent = ({
  labelWidth,
  labelHeight,
  marginTop = 0,
  marginLeft = 0,
  horizontalGap = 0,
  verticalGap = 0,
}) => {
  // Safe printable width/height inside the label
  const safeWidth = labelWidth - marginLeft - horizontalGap;
  const safeHeight = labelHeight - marginTop - verticalGap;

  // Divide height into 3 parts: top, middle, bottom
  const rowHeight = safeHeight / 3;
  const _id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  return [
    // --- Top: Variant Name ---
    {
      id: `el_${_id}_name`,
      type: "text",
      dataField: "variantName",
      text: "Product Name",
      x: marginLeft + safeWidth * 0.1,
      y: marginTop + rowHeight * 0.1,
      fontSize: Math.max(8, rowHeight * 0.4),
      fontWeight: "bold",
    },

    // --- Center: Barcode ---
    {
      id: `el_${_id}_barcode`,
      type: "barcode",
      dataField: "sku",
      x: marginLeft + safeWidth * 0.1,
      y: marginTop + rowHeight * 1 + rowHeight * 0.05, // start of middle + some offset
      width: safeWidth * 0.8,
      height: rowHeight * 0.8,
      barcodeWidth: 1.5,
      barcodeHeight: rowHeight * 0.8,
    },

    // --- Bottom Left: Selling Price ---
    {
      id: `el_${_id}_price`,
      type: "text",
      dataField: "sellingPrice",
      text: "Rs. 100.00",
      x: marginLeft + safeWidth * 0.05,
      y: marginTop + rowHeight * 2 + rowHeight * 0.1,
      fontSize: Math.max(10, rowHeight * 0.4),
      fontWeight: "bold",
    },

    // --- Bottom Right: Company Name ---
    {
      id: `el_${_id}_company`,
      type: "text",
      dataField: "company",
      text: "My Store",
      x: marginLeft + safeWidth * 0.55,
      y: marginTop + rowHeight * 2 + rowHeight * 0.1,
      fontSize: Math.max(8, rowHeight * 0.35),
      fontWeight: "normal",
    },
  ];
};
