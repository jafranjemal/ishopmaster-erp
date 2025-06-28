const asyncHandler = require("../../../../middleware/asyncHandler");
const barcodeService = require("../../../../services/barcode.service");

// @desc    Generate print-ready HTML for labels
// @route   POST /api/v1/tenant/inventory/print/labels
// @access  Private (Requires 'inventory:product:view' permission)
exports.generateLabels = asyncHandler(async (req, res, next) => {
  const { LabelTemplate, ProductVariants } = req.models;
  const { templateId, items, isPreview = false } = req.body;

  if (!templateId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "A templateId and an array of items are required.",
    });
  }

  // 1. Fetch the label template
  const template = await LabelTemplate.findById(templateId).lean();
  if (!template) {
    return res
      .status(404)
      .json({ success: false, error: "Label template not found." });
  }
  console.log("is preview ", isPreview);
  console.log("is preview  templateId", templateId);
  // 2. Handle Preview Mode — bypass DB fetch
  if (isPreview) {
    const html = await barcodeService.generatePrintHtml(template, items);
    res.header("Content-Type", "text/html");
    return res.send(html);
  }

  // 3. Normal Mode — fetch actual product data
  const itemsToPrint = [];

  for (const item of items) {
    const variant = await ProductVariants.findById(item.productVariantId)
      .populate("templateId")
      .lean();

    if (!variant) continue;

    const isSerialized = variant.templateId?.type === "serialized";

    if (
      isSerialized &&
      Array.isArray(item.serials) &&
      item.serials.length > 0
    ) {
      for (const serial of item.serials) {
        itemsToPrint.push({ ...variant, sku: serial });
      }
    } else {
      const qty = Number(item.quantity || 1);
      for (let i = 0; i < qty; i++) {
        itemsToPrint.push(variant);
      }
    }
  }

  const html = await barcodeService.generatePrintHtml(template, itemsToPrint);
  res.header("Content-Type", "text/html");
  res.send(html);
});
