const mongoose = require("mongoose")
const defaultTemplates = require("../../../admin/constants/defaultTemplates")
const { cloneDeep } = require("lodash")
// DIN 476 standard paper sizes in millimeters [width, height]
const PAPER_SIZES_MM = {
  A4: [210, 297],
  A5: [148, 210],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
  // Add other sizes as needed
}

const elementStyleSchema = new mongoose.Schema(
  {
    fontSize: { type: Number, default: 10 },
    fontFamily: { type: String, default: "Helvetica" },
    fontWeight: { type: String, enum: ["normal", "bold"], default: "normal" },
    color: { type: String, default: "#000000" },
    backgroundColor: { type: String, default: "transparent" },
    textAlign: { type: String, enum: ["left", "center", "right"], default: "left" },
    verticalAlign: { type: String, enum: ["top", "middle", "bottom"], default: "top" },
    border: {
      color: { type: String, default: "#000000" },
      width: { type: Number, default: 0 },
      style: { type: String, enum: ["solid", "dashed", "dotted"], default: "solid" },
    },
  },
  { _id: false }
)

const elementContentSchema = new mongoose.Schema(
  {
    staticText: { type: String }, // For labels
    dataKey: { type: String }, // For simple data binding, e.g., 'customer.name'
    template: { type: String }, // For complex formatted text, e.g., '{{street}}, {{city}}'
    format: { type: String, enum: ["currency", "date", "datetime"] },
  },
  { _id: false }
)

const tableColumnSchema = new mongoose.Schema(
  {
    header: { type: String, required: true },
    dataKey: { type: String, required: true },
    width: { type: Number, required: true }, // Percentage
    align: { type: String, enum: ["left", "center", "right"], default: "left" },
    format: { type: String, enum: ["currency", "date"] },
  },
  { _id: false }
)

const tableContentSchema = new mongoose.Schema(
  {
    dataKey: { type: String, required: true }, // e.g., 'invoice.items'
    columns: [tableColumnSchema],
  },
  { _id: false }
)

const elementSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Frontend-generated UUID
  type: { type: String, required: true, enum: ["text", "image", "line", "rectangle", "table"] },
  position: {
    x: { type: Number, required: true }, // in mm
    y: { type: Number, required: true }, // in mm
  },
  dimensions: {
    width: { type: Number, required: true }, // in mm
    height: { type: Number, required: true }, // in mm
  },
  style: elementStyleSchema,
  content: elementContentSchema,
  tableContent: tableContentSchema, // Only for 'table' type elements
})

const documentTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    documentType: { type: String, required: true, enum: ["SalesInvoice", "RepairTicket", "PurchaseOrder"] },
    paperSize: { type: String, default: "A4", enum: Object.keys(PAPER_SIZES_MM) },
    orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
    paperDimensions: {
      width: { type: Number }, // in mm
      height: { type: Number }, // in mm
    },
    printArea: {
      top: { type: Number, default: 15 },
      bottom: { type: Number, default: 15 },
      left: { type: Number, default: 15 },
      right: { type: Number, default: 15 },
    },
    backgroundImageUrl: { type: String },
    printBackgroundImage: { type: Boolean, default: false },
    elements: [elementSchema],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// --- Definitive Fix #1: Intelligent pre-save hook for paper dimensions ---
documentTemplateSchema.pre("save", function (next) {
  const dimensions = PAPER_SIZES_MM[this.paperSize]
  if (dimensions) {
    if (this.orientation === "landscape") {
      this.paperDimensions = { width: dimensions[1], height: dimensions[0] }
    } else {
      this.paperDimensions = { width: dimensions[0], height: dimensions[1] }
    }
  }
  next()
})

documentTemplateSchema.pre("save", function (next) {
  // This hook only runs when a document is first created.
  if (this.isNew) {
    // Find the default template from our master list that matches the
    // document type the user selected (e.g., 'SalesInvoice').
    const defaults = defaultTemplates.find((t) => t.documentType === this.documentType)

    if (defaults) {
      // If a default exists, and the user hasn't provided their own layout,
      // we seed the template with the professional default layout.
      if (this.elements.length === 0) {
        // We use cloneDeep to ensure we are not modifying the original master list object.
        this.elements = cloneDeep(defaults.elements)
      }
      // We can also set other defaults if they weren't provided.
      if (!this.paperSize) this.paperSize = defaults.paperSize
      if (!this.orientation) this.orientation = defaults.orientation
    }
  }
  next()
})

module.exports = documentTemplateSchema
