const mongoose = require("mongoose")
const { cloneDeep } = require("lodash")
const defaultTemplates = require("../../../admin/constants/defaultTemplates")

// DIN 476 standard paper sizes in millimeters [width, height]
const PAPER_SIZES_MM = {
  A4: [210, 297],
  A5: [148, 210],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
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
    staticText: { type: String },
    dataKey: { type: String },
    template: { type: String },
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
    dataKey: { type: String, required: true },
    columns: [tableColumnSchema],
  },
  { _id: false }
)

const elementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ["text", "image", "line", "rectangle", "table"] },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  style: elementStyleSchema,
  content: elementContentSchema,
  tableContent: tableContentSchema,
})

const documentTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    documentType: { type: String, required: true, enum: ["SalesInvoice", "RepairTicket", "PurchaseOrder"] },
    paperSize: { type: String, default: "A4", enum: Object.keys(PAPER_SIZES_MM) },
    orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
    paperDimensions: { width: { type: Number }, height: { type: Number } },
    printArea: {
      top: { type: Number, default: 15 },
      bottom: { type: Number, default: 15 },
      left: { type: Number, default: 15 },
      right: { type: Number, default: 15 },
    },

    // --- Definitive Fix #1: Implement the "Banded" architecture ---
    reportHeaderElements: [elementSchema],
    pageHeaderElements: [elementSchema],
    detailElements: [elementSchema], // This band will be repeated for each line item
    pageFooterElements: [elementSchema],
    reportFooterElements: [elementSchema],

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
)

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
  // Always seed default layout for new templates
  if (this.isNew) {
    const defaults = defaultTemplates.find((t) => t.documentType === this.documentType)
    if (defaults) {
      // Only override if bands are empty
      const bands = ["reportHeaderElements", "pageHeaderElements", "detailElements", "pageFooterElements", "reportFooterElements"]

      const isLayoutEmpty = bands.every((band) => !this[band] || this[band].length === 0)

      if (isLayoutEmpty) {
        this.reportHeaderElements = cloneDeep(defaults.reportHeaderElements || [])
        this.pageHeaderElements = cloneDeep(defaults.pageHeaderElements || [])
        this.detailElements = cloneDeep(defaults.detailElements || [])
        this.pageFooterElements = cloneDeep(defaults.pageFooterElements || [])
        this.reportFooterElements = cloneDeep(defaults.reportFooterElements || [])
      }
    }
  }
  next()
})

module.exports = documentTemplateSchema
