const { v4: uuidv4 } = require("uuid")

// A4 dimensions in millimeters (210mm × 297mm)
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

const DEFAULT_SALES_INVOICE_A4 = {
  name: "Professional A4 Sales Invoice",
  documentType: "SalesInvoice",
  paperSize: "A4",
  orientation: "portrait",
  isDefault: true,
  printArea: {
    top: 15,
    bottom: 20,
    left: 15,
    right: 15,
  },
  elements: [
    // ===== HEADER SECTION =====
    {
      id: "header-logo",
      type: "image",
      position: { x: 15, y: 15 },
      dimensions: { width: 25, height: 25 }, // Smaller logo for better proportion
      content: { dataKey: "tenant.companyProfile.logoUrl" },
    },
    {
      id: "company-name",
      type: "text",
      position: { x: 45, y: 15 },
      dimensions: { width: 100, height: 10 },
      content: { dataKey: "tenant.companyName" },
      style: { fontSize: 14, fontWeight: "bold" }, // Slightly smaller font
    },
    {
      id: "company-address",
      type: "text",
      position: { x: 45, y: 26 },
      dimensions: { width: 100, height: 20 },
      content: {
        template:
          "{{tenant.companyProfile.address.street}}\n{{tenant.companyProfile.address.city}}, {{tenant.companyProfile.address.state}}\n{{tenant.companyProfile.address.postalCode}}",
      },
      style: { fontSize: 8 }, // Smaller font
    },
    {
      id: "company-contact",
      type: "text",
      position: { x: 45, y: 48 },
      dimensions: { width: 100, height: 15 },
      content: {
        template: "Tel: {{tenant.companyProfile.phone}}\nEmail: {{tenant.companyProfile.email}}\nTax ID: {{tenant.companyProfile.taxId}}",
      },
      style: { fontSize: 8 }, // Smaller font
    },
    {
      id: "invoice-title",
      type: "text",
      position: { x: 150, y: 15 },
      dimensions: { width: 45, height: 10 },
      content: { staticText: "TAX INVOICE" },
      style: { fontSize: 16, fontWeight: "bold", textAlign: "right" }, // Smaller font
    },
    {
      id: "invoice-number",
      type: "text",
      position: { x: 150, y: 30 },
      dimensions: { width: 45, height: 6 },
      content: { template: "Invoice #: {{invoice.invoiceId}}" },
      style: { fontSize: 9, textAlign: "right", fontWeight: "bold" }, // Smaller font
    },
    {
      id: "invoice-date",
      type: "text",
      position: { x: 150, y: 37 },
      dimensions: { width: 45, height: 6 },
      content: { template: "Date: {{formatDate invoice.createdAt}}" },
      style: { fontSize: 9, textAlign: "right" }, // Smaller font
    },
    {
      id: "due-date",
      type: "text",
      position: { x: 150, y: 44 },
      dimensions: { width: 45, height: 6 },
      content: { template: "Due Date: {{formatDate invoice.dueDate}}" },
      style: { fontSize: 9, textAlign: "right" }, // Smaller font
    },

    // ===== BILLING SECTION =====
    {
      id: "bill-to-label",
      type: "text",
      position: { x: 15, y: 70 },
      dimensions: { width: 30, height: 5 },
      content: { staticText: "BILL TO:" },
      style: { fontSize: 9, fontWeight: "bold" }, // Smaller font
    },
    {
      id: "customer-info",
      type: "text",
      position: { x: 15, y: 75 },
      dimensions: { width: 80, height: 25 },
      content: {
        template:
          "{{customer.name}}\n{{customer.address.street}}\n{{customer.address.city}}, {{customer.address.state}}\n{{customer.address.postalCode}}\n{{customer.phone}}",
      },
      style: { fontSize: 9 }, // Smaller font
    },

    // ===== ITEMS TABLE =====
    {
      id: "items-table",
      type: "table",
      position: { x: 15, y: 105 },
      dimensions: { width: 180, height: 120 },
      style: { border: { width: 0.5 } },
      tableContent: {
        dataKey: "invoice.items",
        columns: [
          { header: "Description", dataKey: "description", width: 70, align: "left" }, // Wider description
          { header: "Qty", dataKey: "quantity", width: 15, align: "center" },
          { header: "Unit Price", dataKey: "unitPrice", width: 30, align: "right", format: "currency" },
          { header: "Discount", dataKey: "lineDiscount.value", width: 25, align: "right", format: "currency" },
          { header: "Total", dataKey: "finalPrice", width: 30, align: "right", format: "currency" },
        ],
      },
    },

    // ===== FINANCIAL SUMMARY =====
    {
      id: "subtotal",
      type: "text",
      position: { x: 140, y: 230 },
      dimensions: { width: 30, height: 6 },
      content: { staticText: "Subtotal:" },
      style: { fontSize: 9, textAlign: "right" }, // Smaller font
    },
    {
      id: "subtotal-value",
      type: "text",
      position: { x: 170, y: 230 },
      dimensions: { width: 25, height: 6 },
      content: { template: "{{formatCurrency invoice.subTotal}}" },
      style: { fontSize: 9, textAlign: "right" }, // Smaller font
    },
    {
      id: "tax-label",
      type: "text",
      position: { x: 140, y: 237 },
      dimensions: { width: 30, height: 6 },
      content: { staticText: "Tax:" },
      style: { fontSize: 9, textAlign: "right" }, // Smaller font
    },
    {
      id: "tax-value",
      type: "text",
      position: { x: 170, y: 237 },
      dimensions: { width: 25, height: 6 },
      content: { template: "{{formatCurrency invoice.totalTax}}" },
      style: { fontSize: 9, textAlign: "right" }, // Smaller font
    },
    {
      id: "total-label",
      type: "text",
      position: { x: 140, y: 250 },
      dimensions: { width: 30, height: 8 },
      content: { staticText: "TOTAL:" },
      style: { fontSize: 11, fontWeight: "bold", textAlign: "right" }, // Adjusted font size
    },
    {
      id: "total-value",
      type: "text",
      position: { x: 170, y: 250 },
      dimensions: { width: 25, height: 8 },
      content: { template: "{{formatCurrency invoice.totalAmount}}" },
      style: { fontSize: 11, fontWeight: "bold", textAlign: "right" }, // Adjusted font size
    },

    // ===== TERMS & NOTES =====
    {
      id: "terms-label",
      type: "text",
      position: { x: 15, y: 230 },
      dimensions: { width: 40, height: 5 },
      content: { staticText: "Payment Terms:" },
      style: { fontSize: 9, fontWeight: "bold" }, // Smaller font
    },
    {
      id: "terms-value",
      type: "text",
      position: { x: 15, y: 235 },
      dimensions: { width: 100, height: 15 },
      content: { template: "Net {{customer.creditTerms}} days\nLate payments subject to 1.5% monthly interest" },
      style: { fontSize: 8 }, // Smaller font
    },

    // ===== FOOTER SECTION =====
    {
      id: "footer-line",
      type: "line",
      position: { x: 15, y: 270 },
      dimensions: { width: 180, height: 0 },
      style: { border: { width: 0.3, color: "#000000" } },
    },
    {
      id: "footer-thanks",
      type: "text",
      position: { x: 15, y: 275 },
      dimensions: { width: 180, height: 5 },
      content: { staticText: "Thank you for your business!" },
      style: { fontSize: 9, textAlign: "center", fontWeight: "bold" }, // Smaller font
    },
    {
      id: "footer-contact",
      type: "text",
      position: { x: 15, y: 280 },
      dimensions: { width: 180, height: 5 },
      content: { template: "Questions? {{tenant.companyProfile.phone}} | {{tenant.companyProfile.email}}" },
      style: { fontSize: 8, textAlign: "center" }, // Smaller font
    },
  ],
}

const defaultTemplates = [
  DEFAULT_SALES_INVOICE_A4,
  // Add default templates for RepairTicket, PurchaseOrder, etc. here
]

module.exports = defaultTemplates
