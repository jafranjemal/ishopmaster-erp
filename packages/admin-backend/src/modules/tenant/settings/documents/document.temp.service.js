const { default: mongoose } = require("mongoose")
const PDFDocument = require("pdfkit")
const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")
const moment = require("moment")

const Handlebars = require("handlebars")
class DocumentController {
  // Sales Invoice PDF Generation
  async generateSalesInvoicePDF(req, res) {
    const { id } = req.params
    try {
      // 1. Fetch invoice data
      const invoice = await req.models.SalesInvoice.findById(id).populate("customerId branchId soldBy items.productVariantId").lean()

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" })
      }

      // 2. Generate PDF
      const pdfBuffer = await this._createSalesInvoicePDF(invoice)

      // 3. Display in Puppeteer
      // await this._displayPDFInBrowser(pdfBuffer, `Sales Invoice ${invoice.invoiceId}`)

      // 4. Send response
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice_${invoice.invoiceId}.pdf"`,
      })
      res.send(pdfBuffer)
    } catch (error) {
      console.error("Invoice PDF generation error:", error)
      res.status(500).json({ error: "Failed to generate invoice PDF" })
    }
  }

  // Repair Ticket PDF Generation
  async generateRepairTicketPDFs(req, res) {
    const { dataId } = req.query
    const { DocumentTemplate, SalesInvoice, RepairQuote, RepairTicket } = req.models
    try {
      // 1. Fetch repair ticket data
      const ticket2 = await RepairTicket.findById(new mongoose.Types.ObjectId(dataId))
        .populate("customerId branchId assignedTo createdBy assets")
        .lean()
      const ticket = await RepairTicket.findById(dataId).populate("customerId").populate("assets").populate("assignedTo").lean()
      // console.log("ticket ", ticket)
      // console.log("dataId ", dataId)
      if (!ticket) {
        return res.status(404).json({ error: "Repair ticket not found" })
      }

      // 2. Generate PDF
      const pdfBuffer = await this._createRepairTicketPDF(ticket)
      console.log("pdfbuffer ", pdfBuffer)
      return pdfBuffer
      // 3. Display in Puppeteer
      //  await this._displayPDFInBrowser(pdfBuffer, `Repair Ticket ${ticket.ticketNumber}`)

      // 4. Send response
      //   res.set({
      //     "Content-Type": "application/pdf",
      //     "Content-Disposition": `attachment; filename="repair_ticket_${ticket.ticketNumber}.pdf"`,
      //   })

      //   res.send(pdfBuffer)
    } catch (error) {
      console.error("Repair ticket PDF generation error:", error)
      res.status(500).json({ error: "Failed to generate repair ticket PDF" })
    }
  }
  async generateRepairTicketPDF(req) {
    const { dataId } = req.query
    const { RepairTicket, RepairQuote } = req.models

    try {
      //   const tickets = await RepairTicket.findById(dataId).populate("customerId branchId assignedTo createdBy assets").lean()

      //   if (!tickets) {
      //     return null // Let controller handle 404
      //   }

      let dataObject = null

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

      console.log("dataObject ", dataObject)

      if (!dataObject) throw new Error("Data document not found.")

      const ticket = dataObject

      // Prepare data
      const subTotal = dataObject.jobSheet.reduce((sum, it) => {
        const line = it.itemType === "labor" ? it.quantity * it.laborRate : it.quantity * it.unitPrice
        return sum + line
      }, 0)
      const taxRate = 8 // example
      const taxAmt = (subTotal * taxRate) / 100
      const total = subTotal + taxAmt

      const data = {
        ticketNumber: ticket.ticketNumber,
        status: this._formatStatus(ticket.status),
        createdAt: new Date(ticket.createdAt).toLocaleDateString(),
        customer: {
          name: ticket.customerId.name,
          phone: ticket.customerId.phone,
          email: ticket.customerId.email,
        },
        assets: ticket.assets.map((a) => ({
          model: a.name,
          serialNumber: a.serialNumber,
        })),
        jobSheet: ticket.jobSheet.map((it) => ({
          ...it,
          itemType: it.itemType.toUpperCase(),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          laborRate: it.laborRate,
        })),
        subTotal: this._formatCurrency(subTotal),
        taxRate,
        taxAmount: this._formatCurrency(taxAmt),
        totalAmount: this._formatCurrency(total),
        technicianNotes: ticket.technicianNotes || "None",
      }

      const pdfBuffer = await this._createPDFfromTemplate("repair-ticket", data)

      return pdfBuffer
    } catch (error) {
      console.error("Error in generateRepairTicketPDF:", error)
      return null // Let controller handle error
    }
  }

  async _createPDFfromTemplate(templateName, data, pdfOptions = {}) {
    // 1) Load & compile template
    //const templatePath = path.join(__dirname, "..", "templates", `${templateName}.html`)
    const templatePath = path.join(
      __dirname,
      "..", // from documents → settings
      "..", // → tenant
      "..", // → modules
      "..", // → src
      "templates", // src/templates
      `${templateName}.html`
    )

    const html = fs.readFileSync(templatePath, "utf8")
    const template = Handlebars.compile(html)

    // 2) Render HTML
    const rendered = template(data)

    console.log(rendered)
    // 3) Launch & render PDF
    //const browser = await puppeteer.launch()
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] })

    const page = await browser.newPage()
    await page.setContent(rendered, { waitUntil: "networkidle0" })
    await page.emulateMediaType("screen")

    const defaultOptions = {
      format: "A4",
      printBackground: true,
      margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
    }

    const buffer = await page.pdf({ ...defaultOptions, ...pdfOptions })
    await browser.close()
    return buffer
  }

  // PRIVATE METHODS
  async _displayPDFInBrowser(pdfBuffer, title) {
    const tempPath = path.join(__dirname, "temp", `${Date.now()}.pdf`)
    fs.writeFileSync(tempPath, pdfBuffer)

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    await page.goto(`file://${tempPath}`, { waitUntil: "networkidle0" })
    await page.setViewport({ width: 1200, height: 800 })
    await page.pdf({ path: tempPath }) // Ensures proper rendering

    console.log(`Displaying ${title} in browser...`)
  }

  _createSalesInvoicePDF(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 40 })
        const buffers = []
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => resolve(Buffer.concat(buffers)))
        doc.on("error", reject)

        // Industrial-standard invoice design
        this._renderInvoiceHeader(doc, invoice)
        this._renderInvoiceCustomer(doc, invoice)
        this._renderInvoiceItems(doc, invoice)
        this._renderInvoiceTotals(doc, invoice)
        this._renderInvoiceFooter(doc, invoice)

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  _createRepairTicketPDF(ticket) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 40 })
        const buffers = []
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => resolve(Buffer.concat(buffers)))
        doc.on("error", (err) => console.error("PDFKit error", err))

        // Industrial-standard repair ticket design
        this._renderRepairHeader(doc, ticket)
        this._renderRepairCustomer(doc, ticket)
        this._renderRepairAssets(doc, ticket)
        this._renderRepairServices(doc, ticket)
        this._renderRepairTotals(doc, ticket)
        this._renderRepairFooter(doc, ticket)

        doc.end()
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }

  // INVOICE RENDERING HELPERS
  _renderInvoiceHeader(doc, invoice) {
    // Company Information
    doc.fontSize(16).font("Helvetica-Bold").text("INDUSTRIAL EQUIPMENT SOLUTIONS", 50, 50)

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("123 Industrial Park Blvd", 50, 75)
      .text("Houston, TX 77001", 50, 90)
      .text("Phone: (713) 555-1234 | www.industry-solutions.com", 50, 105)

    // Invoice Information
    doc.fontSize(20).font("Helvetica-Bold").text("TAX INVOICE", 400, 50, { align: "right" })

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Invoice #: ${invoice.invoiceId}`, 400, 85, { align: "right" })
      .text(`Date: ${moment(invoice.createdAt).format("DD/MM/YYYY")}`, 400, 100, { align: "right" })
      .text(`Due Date: ${moment(invoice.dueDate).format("DD/MM/YYYY")}`, 400, 115, { align: "right" })

    doc.moveDown(2)
  }

  _renderInvoiceCustomer(doc, invoice) {
    doc.fontSize(12).font("Helvetica-Bold").text("BILL TO:", 50, 150)

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(invoice.customerId.name, 50, 170)
      .text(invoice.customerId.address, 50, 185)
      .text(`${invoice.customerId.city}, ${invoice.customerId.state} ${invoice.customerId.postalCode}`, 50, 200)

    doc.moveDown()
  }

  _renderInvoiceItems(doc, invoice) {
    // Table Header
    const startY = 230
    doc.fontSize(10).font("Helvetica-Bold")
    doc.text("DESCRIPTION", 50, startY)
    doc.text("QTY", 300, startY)
    doc.text("UNIT PRICE", 350, startY, { width: 80, align: "right" })
    doc.text("TOTAL", 450, startY, { width: 80, align: "right" })

    // Table Divider
    doc
      .moveTo(50, startY + 15)
      .lineTo(550, startY + 15)
      .stroke()

    // Table Rows
    let y = startY + 25
    invoice.items.forEach((item) => {
      doc.font("Helvetica").fontSize(10)
      doc.text(item.description, 50, y)
      doc.text(item.quantity.toString(), 300, y)
      doc.text(this._formatCurrency(item.unitPrice), 350, y, { width: 80, align: "right" })
      doc.text(this._formatCurrency(item.finalPrice), 450, y, { width: 80, align: "right" })
      y += 20
    })

    doc.moveDown()
    return y
  }

  _renderInvoiceTotals(doc, invoice) {
    const startY = 450
    doc.fontSize(10)

    doc
      .text("Subtotal:", 400, startY, { width: 80, align: "right" })
      .text(this._formatCurrency(invoice.subTotal), 450, startY, { width: 80, align: "right" })

    if (invoice.totalLineDiscount > 0) {
      doc
        .text("Discount:", 400, startY + 20, { width: 80, align: "right" })
        .text(this._formatCurrency(-invoice.totalLineDiscount), 450, startY + 20, { width: 80, align: "right" })
    }

    doc
      .text("Tax:", 400, startY + 40, { width: 80, align: "right" })
      .text(this._formatCurrency(invoice.totalTax), 450, startY + 40, { width: 80, align: "right" })

    doc
      .font("Helvetica-Bold")
      .text("TOTAL:", 400, startY + 60, { width: 80, align: "right" })
      .text(this._formatCurrency(invoice.totalAmount), 450, startY + 60, { width: 80, align: "right" })

    doc.moveDown()
  }

  _renderInvoiceFooter(doc, invoice) {
    doc
      .fontSize(9)
      .font("Helvetica")
      .text("Payment Terms: Net 30 days", 50, 550)
      .text("Make all checks payable to Industrial Equipment Solutions", 50, 565)
      .text("Thank you for your business!", 50, 580)

    doc.text(`Invoice generated on: ${new Date().toLocaleDateString()}`, 400, 580, { align: "right" })
  }

  // REPAIR TICKET RENDERING HELPERS
  _renderRepairHeader(doc, ticket) {
    doc.fontSize(16).font("Helvetica-Bold").text("INDUSTRIAL EQUIPMENT SERVICES", 50, 50)

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("789 Service Center Rd", 50, 75)
      .text("Detroit, MI 48201", 50, 90)
      .text("Phone: (313) 555-7890 | www.industrial-repair.com", 50, 105)

    doc.fontSize(20).font("Helvetica-Bold").text("REPAIR TICKET", 400, 50, { align: "right" })

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Ticket #: ${ticket.ticketNumber}`, 400, 85, { align: "right" })
      .text(`Status: ${this._formatStatus(ticket.status)}`, 400, 100, { align: "right" })
      .text(`Created: ${moment(ticket.createdAt).format("DD/MM/YYYY")}`, 400, 115, { align: "right" })

    doc.moveDown(2)
  }

  _renderRepairCustomer(doc, ticket) {
    doc.fontSize(12).font("Helvetica-Bold").text("CUSTOMER:", 50, 150)

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(ticket.customerId.name, 50, 170)
      .text(ticket.customerId.phone, 50, 185)
      .text(ticket.customerId.email, 50, 200)

    doc.moveDown()
  }

  _renderRepairAssets(doc, ticket) {
    doc.fontSize(12).font("Helvetica-Bold").text("EQUIPMENT:", 50, 230)

    ticket.assets.forEach((asset, i) => {
      const y = 250 + i * 60
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Model: ${asset.model}`, 50, y)
        .text(`Serial: ${asset.serialNumber}`, 50, y + 15)
        .text(`Issue: ${ticket.customerComplaint}`, 50, y + 30)
    })

    doc.moveDown()
  }

  _renderRepairServices(doc, ticket) {
    const startY = ticket.assets.length > 0 ? 320 : 250

    // Table Header
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("SERVICE DESCRIPTION", 50, startY)
      .text("TYPE", 300, startY)
      .text("HOURS", 350, startY)
      .text("RATE", 400, startY, { width: 80, align: "right" })
      .text("TOTAL", 450, startY, { width: 80, align: "right" })

    // Table Divider
    doc
      .moveTo(50, startY + 15)
      .lineTo(550, startY + 15)
      .stroke()

    // Table Rows
    let y = startY + 25
    ticket.jobSheet.forEach((item) => {
      doc.font("Helvetica").fontSize(10)
      doc.text(item.description, 50, y)
      doc.text(item.itemType.toUpperCase(), 300, y)

      if (item.itemType === "labor") {
        doc.text(item.laborHours.toString(), 350, y)
        doc.text(this._formatCurrency(item.laborRate), 400, y, { width: 80, align: "right" })
        doc.text(this._formatCurrency(item.laborHours * item.laborRate), 450, y, { width: 80, align: "right" })
      } else {
        doc.text("", 350, y)
        doc.text(this._formatCurrency(item.unitPrice), 400, y, { width: 80, align: "right" })
        doc.text(this._formatCurrency(item.quantity * item.unitPrice), 450, y, { width: 80, align: "right" })
      }
      y += 20
    })

    doc.moveDown()
    return y
  }

  _renderRepairTotals(doc, ticket) {
    const subtotal = ticket.jobSheet.reduce((sum, item) => {
      return sum + (item.itemType === "labor" ? item.laborHours * item.laborRate : item.quantity * item.unitPrice)
    }, 0)

    const tax = subtotal * 0.08 // Example tax calculation
    const total = subtotal + tax

    const startY = 500
    doc.fontSize(10)
    doc
      .text("Subtotal:", 400, startY, { width: 80, align: "right" })
      .text(this._formatCurrency(subtotal), 450, startY, { width: 80, align: "right" })

    doc
      .text("Tax (8%):", 400, startY + 20, { width: 80, align: "right" })
      .text(this._formatCurrency(tax), 450, startY + 20, { width: 80, align: "right" })

    doc
      .font("Helvetica-Bold")
      .text("TOTAL:", 400, startY + 40, { width: 80, align: "right" })
      .text(this._formatCurrency(total), 450, startY + 40, { width: 80, align: "right" })
  }

  _renderRepairFooter(doc, ticket) {
    doc
      .fontSize(9)
      .font("Helvetica")
      .text("Technician Notes:", 50, 550)
      .text(ticket.technicianNotes || "No additional notes", 50, 565, { width: 250 })

    doc.text("Customer Signature: _________________________", 350, 550).text("Authorized by: _________________________", 350, 580)
  }

  // UTILITY METHODS
  _formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  _formatStatus(status) {
    const statusMap = {
      intake: "Intake",
      diagnosing: "Diagnosing",
      repair_active: "Repair in Progress",
      qc_pending: "Quality Check",
      closed: "Completed",
    }
    return statusMap[status] || status
  }
}

module.exports = new DocumentController()
