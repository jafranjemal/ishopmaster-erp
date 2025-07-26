const puppeteer = require("puppeteer")
const handlebars = require("handlebars")
const path = require("path")
const fs = require("fs")

// Helper to load the base HTML template from a file
const loadHtmlTemplate = () => {
  const templatePath = path.join(__dirname, "..", "templates", "document-base.html")
  return fs.readFileSync(templatePath, "utf-8")
}

class DocumentService {
  /**
   * Renders a document to a PDF buffer using a visual layout template.
   */
  async renderDocumentUsingPuppeteer(models, { templateId, dataId }) {
    const { DocumentTemplate, SalesInvoice, RepairTicket } = models

    const template = await DocumentTemplate.findById(templateId).lean()
    if (!template) throw new Error("Document template not found.")

    let dataObject = null
    if (template.documentType === "SalesInvoice") {
      dataObject = await SalesInvoice.findById(dataId).populate("customerId").lean()
    } else if (template.documentType === "RepairTicket") {
      dataObject = await RepairTicket.findById(dataId).populate("customerId").lean()
    }
    if (!dataObject) throw new Error("Data document not found.")

    // 1. Compile the HTML
    const baseTemplate = loadHtmlTemplate()
    const compiledTemplate = handlebars.compile(baseTemplate)

    // Register a helper to format currency
    handlebars.registerHelper("formatCurrency", (amount) => {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "LKR" }).format(amount || 0)
    })

    const finalHtml = compiledTemplate({
      data: dataObject,
      layout: template.layout,
      template: template,
    })

    // 2. Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] })
    const page = await browser.newPage()

    await page.setContent(finalHtml, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      width: `${template.paperWidth}mm`,
      height: `${template.paperHeight}mm`,
      printBackground: true,
      // Omit background for pre-printed stationery
      omitBackground: !template.printBackgroundImage,
    })

    await browser.close()
    return pdfBuffer
  }

  /**
   * Renders a document to a PDF buffer using a visual layout template.
   */
  async renderDocument(models, { templateId, dataId }) {
    const { DocumentTemplate, SalesInvoice } = models // Add other models as needed

    const [template, data] = await Promise.all([
      DocumentTemplate.findById(templateId).lean(),
      SalesInvoice.findById(dataId).populate("customerId").lean(),
    ])

    if (!template) throw new Error("Document template not found.")
    if (!data) throw new Error("Data document not found.")

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: template.paperSize,
        layout: template.orientation,
        margins: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      })

      const buffers = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on("error", reject)

      // Render elements
      template.elements.forEach((element) => {
        this._renderElement(doc, element, data)
      })

      doc.end()
    })
  }

  /**
   * Renders a single element onto the PDFKit document.
   * @private
   */
  _renderElement(doc, element, data) {
    doc.save()

    // PDFKit's origin is top-left. Positions are in mm, PDFKit uses points (1mm = 2.83465 pt)
    const mmToPt = (mm) => mm * 2.83465
    const x = mmToPt(element.position.x)
    const y = mmToPt(element.position.y)
    const width = mmToPt(element.dimensions.width)
    const height = mmToPt(element.dimensions.height)

    switch (element.type) {
      case "text":
        const content = element.content.dataKey
          ? get(data, element.content.dataKey, "") // Safely get nested data
          : element.content.staticText

        doc
          .font(element.style.fontFamily || "Helvetica")
          .fontSize(element.style.fontSize || 10)
          .fillColor(element.style.color || "#000000")
          .text(content, x, y, { width, height, align: element.style.textAlign })
        break

      case "line":
        doc
          .moveTo(x, y)
          .lineTo(x + width, y + height)
          .strokeColor(element.style.strokeColor || "#000000")
          .lineWidth(element.style.borderWidth || 1)
          .stroke()
        break

      case "rectangle":
        doc
          .rect(x, y, width, height)
          .strokeColor(element.style.strokeColor || "#000000")
          .lineWidth(element.style.borderWidth || 1)
          .stroke()
        break
    }
    doc.restore()
  }
}

module.exports = new DocumentService()
