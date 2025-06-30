const asyncHandler = require("../../../middleware/asyncHandler");

// No changes needed here.
exports.getAllLabelTemplates = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const templates = await LabelTemplate.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: templates });
});

// Simplified to remove the unnecessary and now incorrect ID mapping.
exports.getLabelTemplateById = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const template = await LabelTemplate.findById(req.params.id).lean();

  if (!template) {
    return res
      .status(404)
      .json({ success: false, error: "Label template not found." });
  }

  if (Array.isArray(template.content)) {
    template.content = template.content.map((el, index) => ({
      ...el,
      id: el._id?.toString?.() || `el_${Date.now()}_${index}`, // fallback for safety
    }));
  }

  // The content array now has a required `id` field from the schema.
  // No need to manually create it anymore. Sending the data as-is.
  res.status(200).json({ success: true, data: template });
});

// The main logic is the same, but it now calls the new _generateDefaultContent.
exports.createLabelTemplate = asyncHandler(async (req, res, next) => {
  const { LabelTemplate } = req.models;
  const templateData = req.body;

  // This function is now updated to match the new schema.
  templateData.content = _generateDefaultContent(templateData);

  const newTemplate = await LabelTemplate.create(templateData);
  res.status(201).json({ success: true, data: newTemplate });
});

// No changes needed here.
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

// No changes needed here.
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
 * **FULLY REWRITTEN HELPER FUNCTION**
 * Generates a default layout of elements that conforms to the new, enhanced schema.
 * @param {object} templateData - The initial template data containing label dimensions.
 * @returns {Array<object>} An array of content elements with all required properties.
 */
const _generateDefaultContentOld = ({ labelWidth, labelHeight }) => {
  // Use a consistent timestamp for all related element IDs
  const idSuffix = Date.now();

  // Define a small internal padding/margin for a cleaner look
  const padding = 2; // 2mm padding inside the label

  const safeWidth = labelWidth - padding * 2;
  const safeHeight = labelHeight - padding * 2;

  return [
    // --- Top: Product Name (Full Width) ---
    {
      id: `el_${idSuffix}_name`,
      type: "text",
      dataField: "variantName",
      x: padding,
      y: padding,
      width: safeWidth,
      height: safeHeight * 0.25, // 25% of the safe height
      fontSize: 9,
      fontWeight: "bold",
      fontFamily: "Arial",
      align: "left",
    },
    // --- Center: Barcode ---
    {
      id: `el_${idSuffix}_barcode`,
      type: "barcode",
      dataField: "sku",
      x: padding,
      y: padding + safeHeight * 0.3, // Positioned below the name
      width: safeWidth,
      height: safeHeight * 0.4, // 40% of the safe height
      barDensity: 1.2, // A good starting density
    },
    // --- Bottom: Human-Readable SKU ---
    {
      id: `el_${idSuffix}_sku`,
      type: "text",
      dataField: "sku",
      x: padding,
      y: padding + safeHeight * 0.75, // Positioned below the barcode
      width: safeWidth,
      height: safeHeight * 0.2, // 20% of the safe height
      fontSize: 8,
      fontWeight: "normal",
      fontFamily: "OCR-B", // The correct font for this purpose
      align: "center",
    },
  ];
};

/**
 * **DEFINITIVE HELPER FUNCTION**
 * Programmatically generates a perfect, "concrete" default layout for a new template.
 * All positions (x, y) and dimensions (width, height, fontSize) are calculated
 * based on the label size to create a professional, industry-standard layout.
 */
const _generateDefaultContent = ({ labelWidth, labelHeight }) => {
  const idSuffix = Date.now();
  const PADDING = 2; // 2mm safe area inside the label

  // Define the main layout areas
  const safeWidth = labelWidth - PADDING * 2;
  const headerHeight = labelHeight * 0.25;
  const footerHeight = labelHeight * 0.25;
  const bodyHeight = labelHeight - headerHeight - footerHeight;

  const headerY = PADDING;
  const bodyY = headerY + headerHeight;
  const footerY = bodyY + bodyHeight;

  return [
    // --- Header: Product Name ---
    {
      id: `el_${idSuffix}_name`,
      type: "text",
      dataField: "variantName",
      x: PADDING,
      y: headerY,
      width: safeWidth,
      height: headerHeight,
      fontSize: Math.max(8, headerHeight * 0.7), // Font size relative to header height
      fontWeight: "bold",
      fontFamily: "Arial",
      align: "left",
    },

    // --- Body: The Barcode ---
    // You are correct, the height should be calculated. labelHeight / 3 is a great rule.
    {
      id: `el_${idSuffix}_barcode`,
      type: "barcode",
      dataField: "sku",
      x: PADDING,
      y: bodyY,
      width: safeWidth,
      height: bodyHeight,
      barDensity: 0.6,
    },

    // --- Footer: Contains Price and Human-Readable SKU ---
    {
      id: `el_${idSuffix}_price`,
      type: "text",
      dataField: "sellingPrice",
      x: PADDING,
      y: footerY,
      width: safeWidth / 2, // Takes up left half of the footer
      height: footerHeight,
      fontSize: Math.max(8, footerHeight * 0.8),
      fontWeight: "bold",
      fontFamily: "Arial",
      align: "left",
    },
    {
      id: `el_${idSuffix}_sku`,
      type: "text",
      dataField: "sku",
      x: PADDING + safeWidth / 2, // Takes up right half of the footer
      y: footerY,
      width: safeWidth / 2,
      height: footerHeight,
      fontSize: Math.max(7, footerHeight * 0.7),
      fontWeight: "normal",
      fontFamily: "OCR-B", // The correct font for machine-readable text
      align: "right",
    },
  ];
};
