const mongoose = require("mongoose");

/**
 * Defines a single element (text, barcode, qrcode) to be rendered on a label.
 */
const labelElementSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["text", "barcode", "qrcode"] },
    dataField: { type: String, required: true }, // e.g., 'variantName', 'sku', 'sellingPrice'
    x: { type: Number, required: true }, // X coordinate in mm
    y: { type: Number, required: true }, // Y coordinate in mm
    fontSize: { type: Number, default: 8 },
    fontWeight: { type: String, default: "normal" },
    // Barcode/QR specific options
    barcodeHeight: { type: Number, default: 15 }, // in mm
    barcodeWidth: { type: Number, default: 1 }, // bar width factor
  },
  { _id: true }
);

/**
 * Defines the master template for a printable label.
 * Stores the physical layout of the paper and the design of the label itself.
 */
const labelTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Physical paper properties
    paperType: {
      type: String,
      required: true,
      enum: ["sheet", "roll"],
      default: "sheet",
    },
    paperSize: {
      type: String,
      required: true,
      enum: ["A4", "A5", "custom"],
      default: "A4",
    },

    // Dimensions in millimeters (mm)
    labelWidth: { type: Number, required: true },
    labelHeight: { type: Number, required: true },
    horizontalGap: { type: Number, default: 0 },
    verticalGap: { type: Number, default: 0 },
    marginTop: { type: Number, default: 0 },
    marginLeft: { type: Number, default: 0 },

    // For sheet paper
    columns: { type: Number, default: 1 },
    rows: { type: Number, default: 1 },

    // The array of elements that make up the visual design of a single label
    content: [labelElementSchema],

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = labelTemplateSchema;
