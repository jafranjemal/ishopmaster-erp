const puppeteer = require("puppeteer")
const handlebars = require("handlebars")
const path = require("path")
const { get } = require("lodash")
const fs = require("fs")
const moment = require("moment")
const { v4: uuidv4 } = require("uuid")
const _ = require("lodash")

const notificationService = require("./notification.service")
const crypto = require("crypto")
const PDFDocument = require("pdfkit")
const { default: mongoose } = require("mongoose")
// Helper to load the base HTML template from a file
const loadHtmlTemplate = () => {
  const templatePath = path.join(__dirname, "..", "templates", "document-base.html")
  return fs.readFileSync(templatePath, "utf-8")
}

class DocumentService {
  constructor() {
    this.helpers = {
      formatCurrency: (value, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(value)
      },
      formatDate: (date, format = "DD/MM/YYYY") => {
        return moment(date).format(format)
      },
      multiply: (a, b) => a * b,
      getProperty: (obj, path) => _.get(obj, path),
      eq: (a, b) => a === b,
    }
  }

  async generatePdf(template, data, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // 1. Create PDF document with proper dimensions
        const doc = new PDFDocument({
          size: template.paperSize,
          layout: template.orientation,
          margin: 0,
        })

        const buffers = []
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => resolve(Buffer.concat(buffers)))
        doc.on("error", reject)

        // 2. Prepare context with helpers and data
        const context = {
          ...data,
          tenant: options.tenant || {},
          formatCurrency: this.helpers.formatCurrency,
          formatDate: this.helpers.formatDate,
          multiply: this.helpers.multiply,
          get: this.helpers.getProperty,
          eq: this.helpers.eq,
          pageNumber: 1,
          pageCount: 1, // Will be updated later
        }

        // 3. Calculate page dimensions
        const { width, height } = this.getPageDimensions(template)

        // 4. Main rendering workflow
        this.renderReportHeader(doc, template, context, width)
        let currentY = this.renderPageHeader(doc, template, context, width)

        // Detail band handling
        const items = this.getDetailItems(data)
        if (items.length > 0) {
          for (const [index, item] of items.entries()) {
            const itemContext = { ...context, item }

            // Check if we need a new page
            if (this.requiresNewPage(doc, template, currentY, index)) {
              this.renderPageFooter(doc, template, context, width, height)
              doc.addPage()
              context.pageNumber++
              currentY = this.renderPageHeader(doc, template, context, width)
            }

            currentY = this.renderDetailItem(doc, template, itemContext, currentY)
          }
        }

        this.renderReportFooter(doc, template, context, width, height)
        this.renderPageFooter(doc, template, context, width, height)

        // Finalize PDF
        context.pageCount = context.pageNumber
        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  getPageDimensions(template) {
    // DIN sizes in points (1mm = 2.83465 points)
    const sizes = {
      A4: { width: 595.28, height: 841.89 },
      A5: { width: 420.94, height: 595.28 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
    }

    const size = sizes[template.paperSize] || sizes.A4
    return template.orientation === "landscape" ? { width: size.height, height: size.width } : size
  }

  renderReportHeader(doc, template, context, pageWidth) {
    let maxY = 0
    template.reportHeaderElements.forEach((element) => {
      const y = this.renderElement(doc, element, context, pageWidth)
      maxY = Math.max(maxY, y)
    })
    return maxY
  }

  renderPageHeader(doc, template, context, pageWidth) {
    let maxY = 0
    template.pageHeaderElements.forEach((element) => {
      const y = this.renderElement(doc, element, context, pageWidth)
      maxY = Math.max(maxY, y)
    })
    return maxY + 10 // Add small margin
  }

  renderDetailItem(doc, template, context, startY) {
    let maxY = startY
    template.detailElements.forEach((element) => {
      const y = this.renderElement(doc, element, context, doc.page.width, startY)
      maxY = Math.max(maxY, y)
    })
    return maxY + 5 // Add spacing between items
  }

  renderPageFooter(doc, template, context, pageWidth, pageHeight) {
    const startY = pageHeight - 50 // Footer area
    template.pageFooterElements.forEach((element) => {
      this.renderElement(doc, element, context, pageWidth, startY)
    })
  }

  renderReportFooter(doc, template, context, pageWidth, pageHeight) {
    const startY = pageHeight - 100 // Footer area
    template.reportFooterElements.forEach((element) => {
      this.renderElement(doc, element, context, pageWidth, startY)
    })
  }

  renderElement(doc, element, context, pageWidth, baseY = 0) {
    // Apply baseY offset for positioned bands
    const y = baseY + (element.position?.y || 0)
    const x = element.position?.x || 0

    // Get content based on element type
    const content = this.getElementContent(element, context)

    // Apply styling
    this.applyTextStyles(doc, element.style)

    // Render based on element type
    switch (element.type) {
      case "text":
        return this.renderText(doc, content, x, y, element.dimensions.width, pageWidth)

      case "line":
        doc
          .moveTo(x, y)
          .lineTo(x + element.dimensions.width, y)
          .stroke()
        return y

      case "image":
        // In real implementation, you'd fetch the image
        doc.rect(x, y, element.dimensions.width, element.dimensions.height).stroke()
        doc.text("Image Placeholder", x, y)
        return y + element.dimensions.height

      case "table":
        return this.renderTable(doc, element, context, x, y)

      default:
        return y
    }
  }

  getElementContent(element, context) {
    if (element.content?.dataKey) {
      return this.resolveDataPath(context, element.content.dataKey)
    }

    if (element.content?.template) {
      return this.renderTemplate(element.content.template, context)
    }

    return element.content?.staticText || ""
  }

  renderTemplate(template, context) {
    // Simple template rendering with {{ }} syntax
    return template.replace(/{{\s*([^{}]+)\s*}}/g, (match, path) => {
      // Handle helper functions (e.g., {{formatCurrency total}})
      if (path.includes(" ")) {
        const [fn, ...args] = path.split(" ")
        return context[fn]?.(...args.map((a) => this.resolveDataPath(context, a))) || ""
      }
      return this.resolveDataPath(context, path) || ""
    })
  }

  resolveDataPath(context, path) {
    // Handle array paths: items[].description
    if (path.includes("[]")) {
      const [base, field] = path.split("[]")
      return (_.get(context, base) || []).map((item) => item[field]).join("\n")
    }

    // Handle nested properties: tenant.companyName
    return _.get(context, path, "")
  }

  renderText(doc, text, x, y, width, pageWidth) {
    // Handle text wrapping and alignment
    const options = {
      width: width,
      align: doc._font.align || "left",
    }

    // Handle right-aligned text positioning
    const finalX = options.align === "right" ? pageWidth - x - width : x

    doc.text(text, finalX, y, options)
    return y + doc.heightOfString(text, options)
  }

  renderTable(doc, element, context, startX, startY) {
    const { columns } = element.tableContent
    const itemHeight = 15
    let currentY = startY

    // Render table header
    doc.font("Helvetica-Bold")
    columns.forEach((col, i) => {
      const colWidth = (element.dimensions.width * col.width) / 100
      doc.text(col.header, startX + this.getColumnOffset(columns, i), currentY, {
        width: colWidth,
        align: col.align || "left",
      })
    })
    currentY += itemHeight

    // Render table rows
    doc.font("Helvetica")
    const items = this.getDetailItems(context)
    items.forEach((item) => {
      columns.forEach((col, i) => {
        const colWidth = (element.dimensions.width * col.width) / 100
        const value = this.formatCellValue(item[col.dataKey], col)
        doc.text(value, startX + this.getColumnOffset(columns, i), currentY, {
          width: colWidth,
          align: col.align || "left",
        })
      })
      currentY += itemHeight
    })

    return currentY
  }

  getColumnOffset(columns, index) {
    return columns.slice(0, index).reduce((sum, col) => sum + (col.width || 0), 0)
  }

  formatCellValue(value, column) {
    if (column.format === "currency") {
      return this.helpers.formatCurrency(value)
    }
    if (column.format === "date") {
      return this.helpers.formatDate(value)
    }
    return value?.toString() || ""
  }

  applyTextStyles(doc, style = {}) {
    doc
      .font(style.fontFamily || "Helvetica")
      .fontSize(style.fontSize || 10)
      .fillColor(style.color || "#000000")

    if (style.fontWeight === "bold") {
      doc.font(`Helvetica-Bold`)
    }

    // Handle text alignment
    switch (style.textAlign) {
      case "center":
        doc.textAlign = "center"
        break
      case "right":
        doc.textAlign = "right"
        break
      default:
        doc.textAlign = "left"
    }
  }

  getDetailItems(data) {
    // Extract items based on document type
    if (data.items) return data.items // SalesInvoice
    if (data.jobSheet) return data.jobSheet // RepairTicket
    return []
  }

  requiresNewPage(doc, template, currentY, itemIndex) {
    const pageHeight = this.getPageDimensions(template).height
    const detailHeight = template.detailElements.reduce((sum, el) => sum + (el.dimensions.height || 0) + 5, 0)

    return currentY + detailHeight > pageHeight - 100 // Reserve space for footer
  }

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
      layout: template.elements,
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
  async renderDocumentOld(models, { templateId, dataId }) {
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
   * The main dispatcher method. It fetches the template and data,
   * then calls the appropriate rendering engine.
   */
  async renderDocumentOld2(models, { templateId, dataId, style = "customer_copy" }) {
    const { DocumentTemplate, SalesInvoice, RepairTicket } = models

    const [template, dataObject] = await Promise.all([
      DocumentTemplate.findById(templateId).lean(),
      SalesInvoice.findById(dataId).populate("customerId").lean(), // Simplified for now
    ])

    if (!template || !dataObject) throw new Error("Template or data document not found.")

    const transformedData = this._transformDataForStyle(dataObject, style)

    if (template.renderEngine === "pdfkit") {
      return this._renderWithPdfKit(template, transformedData)
    } else {
      return this._renderWithPuppeteer(template, transformedData)
    }
  }

  async renderDocument(models, { templateId, dataId, style = "customer_copy" }) {
    const { DocumentTemplate, SalesInvoice, RepairTicket, RepairQuote } = models

    // Fetch template
    const template = await DocumentTemplate.findById(templateId).lean()
    if (!template) throw new Error("Document template not found.")

    // Fetch data based on template type
    let dataObject = null
    if (template.documentType === "SalesInvoice") {
      dataObject = await SalesInvoice.findById(dataId)
        .populate("customerId")
        .populate("items.productVariantId")
        .populate("items.requiredParts.productVariantId")
        .lean()
    } else if (template.documentType === "RepairTicket") {
      const repairQuotes = await RepairQuote.findOne({
        repairTicketId: new mongoose.Types.ObjectId(dataId),
      })
        .populate("repairTicketId")
        .populate("lineItems.productVariantId")
        // .populate("assets")
        // .populate("jobSheet.productVariantId")
        // .populate("assignedTo")
        .sort({
          version: -1,
        })
        .lean()

      const repairTicket = await RepairTicket.findById(dataId).populate("customerId").populate("assets").populate("assignedTo").lean()

      dataObject = {
        ...repairTicket,
        jobSheet: repairQuotes.lineItems,
      }

      console.log("dataObject ", dataObject.jobSheet)
    }
    if (!dataObject) throw new Error("Data document not found.")

    // Transform data based on style
    const transformedData = this._transformDataForStyle(dataObject, style)

    console.log("transformedData ", transformedData)
    // Render document
    if (template.renderEngine === "pdfkit") {
      return this._renderWithPdfKit(template, transformedData)
    } else {
      return this._renderWithPuppeteer(template, transformedData)
    }
  }

  async renderDocumentz(models, { templateId, dataId, style = "customer_copy" }) {
    const { DocumentTemplate, SalesInvoice, RepairQuote, RepairTicket } = models

    const [template] = await Promise.all([
      DocumentTemplate.findById(templateId).lean(),
      //  SalesInvoice.findById(dataId).populate("customerId").lean() || RepairTicket.findById(dataId).populate("customerId").lean(),
    ])

    console.log("template ", template)
    let dataObject = null
    if (template.documentType === "SalesInvoice") {
      dataObject = await SalesInvoice.findById(dataId)
        .populate("customerId")
        .populate("items.productVariantId")
        .populate("items.requiredParts.productVariantId")
        .lean()
    } else if (template.documentType === "RepairTicket") {
      const repairQuotes = await RepairQuote.findOne({
        repairTicketId: new mongoose.Types.ObjectId(dataId),
      })
        .populate("repairTicketId")
        .populate("lineItems.productVariantId")
        // .populate("assets")
        // .populate("jobSheet.productVariantId")
        // .populate("assignedTo")
        .sort({
          version: -1,
        })
        .lean()

      const repairTicket = await RepairTicket.findById(dataId).populate("customerId").populate("assets").populate("assignedTo").lean()

      dataObject = {
        ...repairTicket,
        jobSheet: repairQuotes.lineItems,
      }

      console.log("dataObject ", dataObject.jobSheet)
    }

    if (!template || !dataObject) throw new Error("Template or data document not found.")

    const transformedData = this._transformDataForStyle(dataObject, style)

    const pdfBuffer = await this.generatePdf(template, transformedData, {
      tenant: {
        companyName: "My Business Inc.",
        address: "456 Business Ave",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        phone: "(555) 123-4567",
      },
    })

    // Save to file
    // fs.writeFileSync("invoice.pdf", pdfBuffer)
    console.log("Invoice generated successfully")

    // const baseTemplate = fs.readFileSync(path.join(__dirname, "..", "templates", "document-base.html"), "utf-8")
    // const compiledTemplate = handlebars.compile(baseTemplate)

    // // The compiled template will now correctly find the 'eq' and 'get' helpers.
    // const finalHtml = compiledTemplate({
    //   data: transformedData,
    //   layout: template.elements, // The template expects a variable named 'layout'
    //   template: template,
    // })

    // const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] })
    // const page = await browser.newPage()
    // await page.setContent(finalHtml, { waitUntil: "networkidle0" })

    // const pdfBuffer = await page.pdf({
    //   width: `${template.paperDimensions.width}mm`,
    //   height: `${template.paperDimensions.height}mm`,
    //   printBackground: true,
    //   omitBackground: !template.printBackgroundImage,
    // })

    // await browser.close()
    return pdfBuffer
  }

  /**
   * Renders a document using PDFKit for vector-perfect output.
   * @private
   */
  async _renderWithPdfKit(template, data) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: template.paperSize,
        layout: template.orientation,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
      })

      const buffers = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => resolve(Buffer.concat(buffers)))
      doc.on("error", reject)

      // Render elements using PDFKit's vector drawing methods
      template.elements.forEach((element) => {
        //console.log("element ", element)
        this._renderElementPdfKit(doc, element, data)
      })

      doc.end()
    })
  }

  /**
   * Renders a document using Puppeteer for rich HTML/CSS layouts.
   * @private
   */
  async _renderWithPuppeteer(template, data) {
    const baseHtml = fs.readFileSync(path.join(__dirname, "..", "templates", "document-base.html"), "utf-8")
    const compiledTemplate = handlebars.compile(baseHtml)

    // Prepare data for Handlebars
    const templateData = {
      data: data,
      template: {
        ...template,
        paperDimensions: template.paperDimensions || {
          width: 210,
          height: 297,
        },
      },
      layout: template.elements.map((el) => {
        // Enhance table elements with data binding info
        if (el.type === "table" && el.tableContent) {
          return {
            ...el,
            tableContent: {
              ...el.tableContent,
              // Add currency flags for price columns
              columns: el.tableContent.columns.map((col) => ({
                ...col,
                // isCurrency: col.key.includes("Price") || col.key.includes("Amount"),
              })),
            },
          }
        }
        return el
      }),
    }

    // const finalHtml = compiledTemplate({ data, template, layout: template.elements })
    const finalHtml = compiledTemplate(templateData)

    console.log("final html ", finalHtml)
    // console.log("final  data", JSON.stringify(data))
    // console.log("final  template", JSON.stringify(templateData))
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] })
    const page = await browser.newPage()
    await page.setContent(finalHtml, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      width: `${template.paperDimensions.width}mm`,
      height: `${template.paperDimensions.height}mm`,
      printBackground: true,
      omitBackground: !template.printBackgroundImage,
    })

    await browser.close()
    return pdfBuffer
  }

  /**
   * Renders a document and sends it as an attachment via a templated email.
   * @param {object} models - The tenant's compiled models.
   * @param {string} templateId - The ID of the DocumentTemplate for the PDF.
   * @param {string} dataId - The ID of the data document (e.g., SalesInvoice).
   * @param {string} emailTemplateId - The ID of the NotificationTemplate for the email body.
   * @param {string} recipientEmail - The email address to send to.
   */
  async sendDocumentByEmail(models, { templateId, dataId, emailTemplateId, recipientEmail, userId }) {
    // 1. Render the document to a PDF buffer first.
    const pdfBuffer = await this.renderDocument(models, { templateId, dataId })

    const { NotificationTemplate, SalesInvoice } = models // Add other data models as needed

    // 2. Fetch the email template and the data needed for its placeholders.
    const emailTemplate = await NotificationTemplate.findById(emailTemplateId).lean()
    const invoiceData = await SalesInvoice.findById(dataId).populate("customerId").lean()
    if (!emailTemplate) throw new Error("Email template not found.")
    if (!invoiceData) throw new Error("Invoice data not found.")

    const context = {
      invoice: invoiceData,
      customer: invoiceData.customerId,
      // Add other context variables here
    }

    // 3. Trigger the notification, passing the PDF buffer as an attachment.
    await notificationService.triggerNotification(
      models,
      emailTemplate.eventName, // Use the event name from the chosen template
      {
        ...context,
        // The NotificationService is already designed to handle this attachment object
        attachment: {
          filename: `${invoiceData.invoiceId || "document"}.pdf`,
          content: pdfBuffer,
        },
      }
    )

    return { message: `Document successfully sent to ${recipientEmail}` }
  }

  /**
   * A private helper that filters and transforms data based on the print style.
   * @private
   */
  _transformDataForStyleOld(data, style) {
    if (style === "customer_copy") {
      const customerData = { ...data }
      // For a customer copy, we must remove sensitive internal data.
      customerData.items = data.items.map((item) => {
        const { costPrice, ...rest } = item // Remove costPrice
        return rest
      })
      return customerData
    }
    if (style === "technician_copy") {
      // For a technician copy, we might add extra diagnostic info
      // For now, it returns the full data.
      return data
    }
    // Default to returning the full data object
    return data
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

  _renderElementPdfKit(doc, element, data) {
    const mmToPt = (mm) => (mm || 0) * 2.83465
    const x = mmToPt(element.position.x)
    const y = mmToPt(element.position.y)
    const width = mmToPt(element.dimensions.width)
    const height = mmToPt(element.dimensions.height)

    switch (element.type) {
      case "text": {
        // safely grab content or default to empty
        const content = element.content?.dataKey ? get(data, element.content.dataKey, "") : element.content?.staticText || ""

        doc
          .font(element.style.fontFamily || "Helvetica")
          .fontSize(element.style.fontSize || 8)
          .fillColor(element.style.color || "#000000")
          .text(content, x, y, {
            width,
            height,
            align: element.style.textAlign,
          })
        break
      }

      case "image": {
        // if you have a buffer or path in data, render image
        const imgSrc = get(data, element.content.dataKey, null)
        if (imgSrc) {
          doc.image(imgSrc, x, y, { width, height })
        }
        break
      }

      case "line": {
        doc
          .strokeColor(element.style.border.color || "#000000")
          .lineWidth(element.style.border.width || 1)
          .moveTo(x, y)
          .lineTo(x + width, y)
          .stroke()
        break
      }

      case "table": {
        console.log("element.tableContent ", element.tableContent)
        const { columns, dataKey } = element.tableContent
        const rows = Array.isArray(get(data, dataKey)) ? get(data, dataKey) : []

        // Draw header row
        const headerHeight = mmToPt(8) // or compute dynamically
        let cursorY = y
        columns.forEach((col, i) => {
          const colWidthPt = mmToPt(col.width)
          doc.rect(x + columns.slice(0, i).reduce((sum, c) => sum + mmToPt(c.width), 0), cursorY, colWidthPt, headerHeight).stroke()
          doc.text(col.header, x + columns.slice(0, i).reduce((sum, c) => sum + mmToPt(c.width), 0) + 2, cursorY + 2, {
            width: colWidthPt - 4,
            align: col.align,
          })
        })
        cursorY += headerHeight

        // Draw rows
        rows.forEach((row) => {
          columns.forEach((col, i) => {
            const colWidthPt = mmToPt(col.width)
            const rawVal = get(row, col.dataKey, "")
            const textVal =
              col.format === "currency"
                ? new Intl.NumberFormat(undefined, { style: "currency", currency: "LKR" }).format(rawVal)
                : String(rawVal)

            doc.rect(x + columns.slice(0, i).reduce((sum, c) => sum + mmToPt(c.width), 0), cursorY, colWidthPt, headerHeight).stroke()
            doc.text(textVal, x + columns.slice(0, i).reduce((sum, c) => sum + mmToPt(c.width), 0) + 2, cursorY + 2, {
              width: colWidthPt - 4,
              align: col.align,
            })
          })
          cursorY += headerHeight
        })

        break
      }

      default:
        // Skip unknown types
        break
    }
  }

  _renderElementPdfKita(doc, element, data) {
    const mmToPt = (mm) => (mm || 0) * 2.83465
    const x = mmToPt(element.position.x)
    const y = mmToPt(element.position.y)
    const width = mmToPt(element.dimensions.width)
    const height = mmToPt(element.dimensions.height)

    //console.log("JSON.stringify(element) ", JSON.stringify(element))
    const content = element.content.dataKey ? get(data, element.content.dataKey, "") : element.content.staticText

    doc
      .font(element.style.fontFamily || "Helvetica")
      .fontSize(element.style.fontSize || 10)
      .fillColor(element.style.color || "#000000")
      .text(content, x, y, { width, height, align: element.style.textAlign })
  }

  /**
   * Master transformation method
   * @private
   */
  _transformDataForStyle(data, style) {
    // Create deep clone to prevent mutation
    const transformedData = JSON.parse(JSON.stringify(data))

    // Determine document type
    const docType = this._detectDocumentType(transformedData)

    // Apply document-specific transformations
    switch (docType) {
      case "SalesInvoice":
        return this._transformSalesInvoice(transformedData, style)
      case "RepairTicket":
        return this._transformRepairTicket(transformedData, style)
      default:
        return transformedData
    }
  }

  /**
   * Detect document type based on schema characteristics
   * @private
   */
  _detectDocumentType(data) {
    if (data.items && data.items.some((item) => item.finalPrice !== undefined)) {
      return "SalesInvoice"
    }
    if (data.jobSheet && data.ticketNumber) {
      return "RepairTicket"
    }
    return "Unknown"
  }

  /**
   * Sales Invoice transformations
   * @private
   */
  _transformSalesInvoice(invoice, style) {
    // Service consolidation for customer copies
    if (style === "customer_copy") {
      invoice = this._consolidateServicesForCustomer(invoice)
    }

    // Apply style-specific transformations
    const config = {
      customer_copy: {
        removeFromItems: [
          "costPriceInBaseCurrency",
          "inventoryLotId",
          "inventoryItemId",
          "lineDiscount",
          "isService",
          "laborHours",
          "laborRate",
          "requiredParts",
          "serviceReference",
        ],
        removeFromRoot: ["globalDiscount", "paymentStatus", "amountPaid", "quotationId", "draftId"],
        mask: ["customerId.ledgerAccountId"],
        simplifyPricing: true,
      },
      technician_copy: {
        add: { internalNote: "Full technical details included" },
        preserveAll: true,
      },
      audit_copy: {
        add: {
          auditStamp: new Date().toISOString(),
          compliance: "Financial Record Keeping Standard",
          systemHash: this._generateSystemHash(invoice),
        },
        preserveAll: true,
      },
    }

    const styleConfig = config[style] || config.customer_copy

    // Apply item-level transformations
    if (styleConfig.removeFromItems && invoice.items) {
      invoice.items = invoice.items.map((item) => {
        const cleanItem = { ...item }
        styleConfig.removeFromItems.forEach((field) => delete cleanItem[field])

        // Simplify pricing display
        if (styleConfig.simplifyPricing) {
          delete cleanItem.unitPrice
          delete cleanItem.lineDiscount
        }

        return cleanItem
      })
    }

    // Apply root-level transformations
    if (styleConfig.removeFromRoot) {
      styleConfig.removeFromRoot.forEach((field) => delete invoice[field])
    }

    // Add metadata
    if (styleConfig.add) {
      Object.assign(invoice, styleConfig.add)
    }

    return invoice
  }

  /**
   * Repair Ticket transformations
   * @private
   */
  _transformRepairTicket(ticket, style) {
    // Service consolidation for customer copies
    if (style === "customer_copy") {
      ticket = this._consolidateRepairServicesForCustomer(ticket)
    }

    const config = {
      customer_copy: {
        removeFromJobSheet: ["costPrice", "employeeId", "laborRate", "serviceReference"],
        removeFromRoot: ["qcTemplateId", "requoteNeededInfo", "jobSheetHistory", "assignedTo"],
        transformQCResult: true,
        mask: ["customerId.ledgerAccountId"],
        simplifyServiceParts: true,
      },
      technician_copy: {
        add: { technicalNote: "Includes diagnostic codes and cost data" },
        preserveAll: true,
      },
      audit_copy: {
        add: {
          qcStandard: "ISO 9001:2015",
          traceabilityCode: `TRC-${Date.now()}`,
          systemHash: this._generateSystemHash(ticket),
        },
        preserveAll: true,
      },
    }

    const styleConfig = config[style] || config.customer_copy

    // Apply job sheet transformations
    if (styleConfig.removeFromJobSheet && ticket.jobSheet) {
      ticket.jobSheet = ticket.jobSheet.map((item) => {
        const cleanItem = { ...item }
        styleConfig.removeFromJobSheet.forEach((field) => delete cleanItem[field])

        // Simplify service parts display
        // if (styleConfig.simplifyServiceParts && item.consolidated) {
        //   delete cleanItem.unitPrice
        //   delete cleanItem.quantity
        // }

        return cleanItem
      })
    }

    // Apply root-level transformations
    if (styleConfig.removeFromRoot) {
      styleConfig.removeFromRoot.forEach((field) => delete ticket[field])
    }

    // Simplify QC results for customers
    if (styleConfig.transformQCResult && ticket.qcResult && style === "customer_copy") {
      ticket.qcResult = {
        status: ticket.qcResult.status,
        checkedAt: ticket.qcResult.checkedAt,
      }
    }

    // Add metadata
    if (styleConfig.add) {
      Object.assign(ticket, styleConfig.add)
    }

    // Add compliance flags for audits
    if (style === "audit_copy") {
      ticket.complianceFlags = this._generateComplianceFlags(ticket)
    }

    // console.log("ticket ", ticket)
    return ticket
  }

  /**
   * Service consolidation for Sales Invoices (customer copies)
   * @private
   */
  _consolidateServicesForCustomer(invoice) {
    const serviceGroups = {}
    const nonServiceItems = []
    let hasServices = false

    // First pass: Identify service items and their components
    invoice.items.forEach((item) => {
      // Handle service items
      if (item.isService) {
        hasServices = true
        const serviceKey = this._normalizeServiceKey(item.description)

        // Initialize service group if needed
        if (!serviceGroups[serviceKey]) {
          serviceGroups[serviceKey] = {
            description: item.description,
            basePrice: 0,
            parts: [],
            labor: [],
            quantity: item.quantity || 1,
            serviceItem: _.omit(item, ["requiredParts", "laborHours", "laborRate"]),
          }
        }

        // Add base service price
        serviceGroups[serviceKey].basePrice += (item.unitPrice || 0) * (item.quantity || 1)

        // Add embedded parts
        if (item.requiredParts && item.requiredParts.length > 0) {
          serviceGroups[serviceKey].parts.push(
            ...item.requiredParts.map((p) => ({
              ...p,
              source: "embedded",
            }))
          )
        }

        // Add embedded labor
        if (item.laborHours && item.laborRate) {
          serviceGroups[serviceKey].labor.push({
            hours: item.laborHours,
            rate: item.laborRate,
            source: "embedded",
          })
        }
      }
      // Handle separately added parts with service reference
      else if (item.itemType === "part") {
        const serviceKey = this._normalizeServiceKey(item.description)
        if (serviceGroups[serviceKey]) {
          serviceGroups[serviceKey].parts.push({
            description: item.description,
            costPrice: item.unitPrice,
            quantity: item.quantity || 1,
            source: "separate",
          })
        } else {
          nonServiceItems.push(item)
        }
      }
      // Handle separately added labor with service reference
      else if (item.itemType === "labor") {
        const serviceKey = this._normalizeServiceKey(item.description)
        if (serviceGroups[serviceKey]) {
          serviceGroups[serviceKey].labor.push({
            hours: item.quantity || 1, // Using quantity as hours
            rate: item.unitPrice,
            source: "separate",
          })
        } else {
          nonServiceItems.push(item)
        }
      }
      // Regular product or non-associated item
      else {
        nonServiceItems.push(item)
      }
    })

    // Second pass: Create consolidated service items
    const consolidatedItems = Object.values(serviceGroups).map((service) => {
      // Calculate parts total
      const partsTotal = service.parts.reduce((sum, part) => sum + part.costPrice * (part.quantity || 1), 0)

      // Calculate labor total
      const laborTotal = service.labor.reduce((sum, labor) => sum + labor.hours * labor.rate, 0)

      // Calculate total service cost
      const totalCost = service.basePrice + partsTotal + laborTotal

      // Create consolidated item
      return {
        ...service.serviceItem,
        description: service.description,
        quantity: service.quantity,
        unitPrice: totalCost / service.quantity,
        finalPrice: totalCost,
        isService: true,
        consolidated: true,
        consolidationDetails: {
          basePrice: service.basePrice,
          partsTotal,
          laborTotal,
          totalCost,
        },
      }
    })

    // Combine with non-service items
    invoice.items = [...consolidatedItems, ...nonServiceItems]

    // Recalculate invoice totals if services were consolidated
    if (hasServices) {
      return this._recalculateInvoiceTotals(invoice)
    }

    return invoice
  }

  /**
   * Service consolidation for Repair Tickets (customer copies)
   * @private
   */
  _consolidateRepairServicesForCustomerOld(ticket) {
    const serviceGroups = {}
    const nonServiceItems = []
    let hasServices = false

    // First pass: Identify service items and their components
    ticket.jobSheet.forEach((item) => {
      // Service items
      if (item.itemType === "service") {
        hasServices = true
        const serviceKey = this._normalizeServiceKey(item.description)

        // Initialize service group
        if (!serviceGroups[serviceKey]) {
          serviceGroups[serviceKey] = {
            description: item.description,
            basePrice: 0,
            parts: [],
            labor: [],
            quantity: item.quantity || 1,
          }
        }

        // Add base service price
        serviceGroups[serviceKey].basePrice += (item.unitPrice || 0) * (item.quantity || 1)
        serviceGroups[serviceKey].quantity += item.quantity || 1
      }
      // Parts with service reference
      else if (item.itemType === "part") {
        const serviceKey = this._normalizeServiceKey(item.description)
        if (serviceGroups[serviceKey]) {
          serviceGroups[serviceKey].parts.push({
            costPrice: item.unitPrice,
            quantity: item.quantity || 1,
          })
        } else {
          nonServiceItems.push(item)
        }
      }
      // Labor with service reference
      else if (item.itemType === "labor") {
        const serviceKey = this._normalizeServiceKey(item.description)
        if (serviceGroups[serviceKey]) {
          serviceGroups[serviceKey].labor.push({
            hours: item.quantity || 1,
            rate: item.unitPrice,
          })
        } else {
          nonServiceItems.push(item)
        }
      }
      // Non-service items
      else {
        nonServiceItems.push(item)
      }
    })

    // Second pass: Create consolidated service items
    const consolidatedItems = Object.values(serviceGroups).map((service) => {
      // Calculate costs
      const partsTotal = service.parts.reduce((sum, part) => sum + part.costPrice * part.quantity, 0)

      const laborTotal = service.labor.reduce((sum, labor) => sum + labor.hours * labor.rate, 0)

      const totalCost = service.basePrice + partsTotal + laborTotal

      // Create consolidated item
      return {
        description: service.description,
        quantity: service.quantity,
        unitPrice: totalCost / service.quantity,
        finalPrice: totalCost,
        itemType: "service",
        consolidated: true,
        consolidationDetails: {
          basePrice: service.basePrice,
          partsTotal,
          laborTotal,
          totalCost,
        },
      }
    })

    // Combine with non-service items
    ticket.jobSheet = [...consolidatedItems, ...nonServiceItems]
    console.log("consolidatedItems ", consolidatedItems)
    console.log("nonServiceItems ", nonServiceItems)
    // Include troubleshoot fee in the first service item
    if (consolidatedItems.length > 0 && ticket.troubleshootFee) {
      if (ticket.troubleshootFee.status !== "waived") {
        const troubleshootFee = ticket.troubleshootFee.amount || 0
        consolidatedItems[0].unitPrice += troubleshootFee / consolidatedItems[0].quantity
        consolidatedItems[0].finalPrice += troubleshootFee
        consolidatedItems[0].consolidationDetails.troubleshootFee = troubleshootFee
      }
      // Clear troubleshoot fee from root
      ticket.troubleshootFee = undefined
    }

    return ticket
  }

  _consolidateRepairServicesForCustomer(ticket) {
    const serviceGroups = {}
    const nonService = []
    let lastServiceKey = null

    // 1) First pass: walk in order, bucket services & assign parts/labor to last service
    ticket.jobSheet.forEach((item) => {
      const key = this._normalizeServiceKey(item.description)

      if (item.itemType === "service") {
        // start a new service bucket
        lastServiceKey = key
        if (!serviceGroups[key]) {
          serviceGroups[key] = {
            description: item.description,
            basePrice: 0,
            parts: [],
            labor: [],
            quantity: 0,
          }
        }
        // accumulate the service’s own price & quantity
        serviceGroups[key].basePrice += (item.unitPrice || 0) * (item.quantity || 1)
        serviceGroups[key].quantity += item.quantity || 1
      } else if ((item.itemType === "part" || item.itemType === "labor") && lastServiceKey) {
        // attach to the most recent service bucket
        const bucket = serviceGroups[lastServiceKey]
        if (item.itemType === "part") {
          bucket.parts.push({
            costPrice: item.unitPrice,
            quantity: item.quantity || 1,
          })
        } else {
          bucket.labor.push({
            hours: item.quantity || 1,
            rate: item.unitPrice,
          })
        }
      } else {
        // not a service or no service yet => leave it unaltered
        nonService.push(item)
      }
    })

    // 2) Build consolidated items from each service bucket
    const consolidated = Object.values(serviceGroups).map((svc) => {
      const partsTotal = svc.parts.reduce((sum, p) => sum + p.costPrice * p.quantity, 0)
      const laborTotal = svc.labor.reduce((sum, l) => sum + l.hours * l.rate, 0)
      const totalCost = svc.basePrice + partsTotal + laborTotal

      return {
        description: svc.description,
        quantity: svc.quantity,
        unitPrice: totalCost / svc.quantity,
        finalPrice: totalCost,
        itemType: "service",
        consolidated: true,
        consolidationDetails: {
          basePrice: svc.basePrice,
          partsTotal,
          laborTotal,
          totalCost,
        },
      }
    })

    // 3) Inject troubleshoot fee (if any) into first service
    if (consolidated.length && ticket.troubleshootFee && ticket.troubleshootFee.status !== "waived") {
      const fee = ticket.troubleshootFee.amount || 0
      const first = consolidated[0]
      first.unitPrice += fee / first.quantity
      first.finalPrice += fee
      first.consolidationDetails.troubleshootFee = fee
      delete ticket.troubleshootFee
    }

    // 4) Replace jobSheet with consolidated services + other items
    ticket.jobSheet = [...consolidated, ...nonService]
    console.log("consolidated ", consolidated)
    console.log("nonService ", nonService)
    return ticket
  }
  /**
   * Normalize service key for grouping
   * @private
   */
  _normalizeServiceKey(key) {
    return key
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  }

  /**
   * Recalculate invoice totals after service consolidation
   * @private
   */
  _recalculateInvoiceTotals(invoice) {
    // Recalculate subtotal from items
    invoice.subTotal = invoice.items.reduce((sum, item) => sum + (item.finalPrice || 0), 0)

    // Recalculate totals (simplified - real implementation would reapply discounts/taxes)
    invoice.totalAmount = invoice.subTotal

    return invoice
  }

  /**
   * Generate system hash for audit purposes
   * @private
   */
  _generateSystemHash(data) {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").substring(0, 12)
  }

  /**
   * Generate compliance flags for repair tickets
   * @private
   */
  _generateComplianceFlags(ticket) {
    const flags = []

    // Check for required customer signature
    if (!ticket.customerSignature) {
      flags.push("MISSING_CUSTOMER_ACKNOWLEDGMENT")
    }

    // Check QC compliance
    if (ticket.qcResult && ticket.qcResult.status === "fail") {
      flags.push("QC_FAILURE_NOT_RESOLVED")
    }

    // Check before/after images
    if (!ticket.beforeImages || ticket.beforeImages.length === 0) {
      flags.push("MISSING_PRE_REPAIR_DOCUMENTATION")
    }

    // Check technician assignment
    if (!ticket.assignedTo) {
      flags.push("UNASSIGNED_REPAIR_TICKET")
    }

    return flags.length > 0 ? flags : ["COMPLIANT"]
  }
}

module.exports = new DocumentService()
