const mongoose = require("mongoose");

/**
 * Defines a single element (text, barcode, qrcode) to be rendered on a label.
 * This schema is based on the enhanced design for absolute positioning and
 * clear property definitions.
 */
const contentElementSchema = new mongoose.Schema(
  {
    // --- Base Properties (for all elements) ---
    id: { type: String, required: true }, // A unique frontend ID, e.g., el_12345
    type: { type: String, required: true, enum: ["text", "barcode", "qrcode"] },
    x: { type: Number, default: 0 }, // Distance from left edge in mm
    y: { type: Number, default: 0 }, // Distance from top edge in mm
    width: { type: Number }, // Final width of the element's bounding box in mm
    height: { type: Number }, // Final height of the element's bounding box in mm
    rotation: { type: Number, default: 0 }, // Rotation in degrees

    // --- Type-Specific Properties ---

    // For type: 'text'
    dataField: { type: String }, // Path to data, e.g., 'variantName', 'sku'
    text: { type: String }, // For static text content
    fontSize: { type: Number, default: 10 }, // Font size in points (pt)
    fontWeight: { type: String, default: "normal", enum: ["normal", "bold"] },
    fontFamily: { type: String, default: "Arial" }, // e.g., 'OCR-B', 'Arial', 'Helvetica'
    align: { type: String, default: "left", enum: ["left", "center", "right"] },

    // For type: 'barcode'
    barDensity: { type: Number, default: 1 }, // Corresponds to bwip-js 'scale' option (the X-dimension)

    // Note: 'dataField' from the text properties is also used for barcode/qrcode
  },
  { _id: false }
); // Use `id` from the frontend, not Mongoose's `_id` for subdocuments

/**
 * Defines the master template for a printable label.
 * Stores the physical layout of the paper and the design of the label itself.
 */
const labelTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // --- Physical Paper Properties ---
    paperType: {
      type: String,
      required: true,
      enum: ["sheet", "roll", "custom"],
      default: "sheet",
    },
    paperSize: {
      type: String,
      // Not required for 'roll' type
      required: function () {
        return this.paperType === "sheet";
      },
      enum: ["A4", "letter", "custom", "A5"], // Expanded for more options
      default: "A4",
    },

    // --- Dimensions in millimeters (mm) ---
    labelWidth: { type: Number, required: true },
    labelHeight: { type: Number, required: true },

    // For sheet paper layout
    columns: { type: Number, default: 1 },
    rows: { type: Number, default: 1 },
    horizontalGap: { type: Number, default: 0 },
    verticalGap: { type: Number, default: 0 },
    marginTop: { type: Number, default: 0 },
    marginLeft: { type: Number, default: 0 },

    // The array of elements that make up the visual design of a single label
    content: [contentElementSchema],

    isDefault: { type: Boolean, default: false },
    // You could add createdBy, organizationId, etc. for multi-tenancy
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// *** THE FIX IS HERE ***
// Exporting the schema object itself, not the compiled model.
module.exports = labelTemplateSchema;
