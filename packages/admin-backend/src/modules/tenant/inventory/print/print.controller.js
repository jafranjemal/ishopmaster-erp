const asyncHandler = require("../../../../middleware/asyncHandler");
const barcodeService = require("../../../../services/barcode.service");
const { Types } = require("mongoose");
const { generateLabelHtml } = require("label-renderer");
const mongoose = require("mongoose");
// @desc    Generate a preview of a single label
// @route   POST /api/v1/tenant/inventory/print/label-preview
exports.generateLabelPreview = asyncHandler(async (req, res, next) => {
  const { template, itemData } = req.body;
  const dummyData = itemData || {
    variantName: "Sample Product",
    sku: "SKU12345",
    sellingPrice: 999999.99,
  };
  console.log("####################################");
  console.log("Preview ", template);
  console.log("####################################");
  const baseCurrency = req.tenant.settings.localization.baseCurrency;

  const singleLabelHtml = await generateLabelHtml(
    template,
    dummyData,
    baseCurrency
  );
  res.header("Content-Type", "text/html");
  res.send(singleLabelHtml);
});

// @desc    Generate a full page of labels for printing
// @route   POST /api/v1/tenant/inventory/print/labels
exports.generatePrintJob = asyncHandler(async (req, res, next) => {
  const { LabelTemplate, ProductVariants } = req.models;
  const { templateId, items } = req.body;

  if (!templateId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "A templateId and an array of items are required.",
    });
  }

  const template = await LabelTemplate.findById(templateId).lean();
  if (!template) {
    return res
      .status(404)
      .json({ success: false, error: "Label template not found." });
  }

  // --- THE DEFINITIVE FIX STARTS HERE ---
  // This new logic correctly handles serialized vs. non-serialized items.

  // 1. Pre-fetch all variants at once for efficiency
  const variantIds = items
    .map((i) => i.productVariantId || i._id)
    .filter(Boolean)
    .map((id) => new mongoose.mongo.ObjectId(id));
  console.log(variantIds);
  const variantsData = await ProductVariants.find({ _id: { $in: variantIds } })
    .populate("templateId")
    .lean();

  console.log(variantsData);
  const variantMap = new Map(variantsData.map((v) => [v._id.toString(), v]));

  console.log(variantMap);
  // 2. Build the final list of items to be printed
  const itemsToPrint = [];
  for (const item of items) {
    const variantId = item.productVariantId || item._id;
    const variant = variantMap.get(variantId);
    if (!variant) continue;

    const isSerialized = variant.templateId?.type === "serialized";

    // Guard: Serialized item must have an array of serials
    if (isSerialized) {
      if (!Array.isArray(item.serials) || item.serials.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            "Serialized items require available serial numbers to print labels.",
        });
      }

      // One label per serial number
      for (const serial of item.serials) {
        itemsToPrint.push({
          ...variant,
          sku: serial, // override SKU with serial number
        });
      }
    } else {
      // Non-serialized: repeat label by quantity
      const qty = Math.max(Number(item.quantity) || 1, 1);
      for (let i = 0; i < qty; i++) {
        itemsToPrint.push({ ...variant });
      }
    }
  }

  if (itemsToPrint.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "No valid items to print." });
  }

  // --- END OF FIX ---

  console.log("itemsToPrint =======> ", itemsToPrint);
  // 3. Call the service with the correctly constructed list
  const fullHtml = await barcodeService.generatePrintPageHtml(
    template,
    itemsToPrint,
    req.tenant.settings.localization.baseCurrency
  );

  res.header("Content-Type", "text/html");
  res.send(fullHtml);
});
