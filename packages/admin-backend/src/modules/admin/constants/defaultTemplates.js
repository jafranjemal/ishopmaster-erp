// const { v4: uuidv4 } = require("uuid")

// // A4 dimensions in millimeters (210mm × 297mm)
// const A4_WIDTH_MM = 210
// const A4_HEIGHT_MM = 297

// const DEFAULT_SALES_INVOICE_A4Old = {
//   name: "Professional A4 Sales Invoice",
//   documentType: "SalesInvoice",
//   paperSize: "A4",
//   orientation: "portrait",
//   isDefault: true,
//   printArea: {
//     top: 15,
//     bottom: 20,
//     left: 15,
//     right: 15,
//   },
//   elements: [
//     // ===== HEADER SECTION =====
//     {
//       id: "header-logo",
//       type: "image",
//       position: { x: 15, y: 15 },
//       dimensions: { width: 25, height: 25 }, // Smaller logo for better proportion
//       content: { dataKey: "tenant.companyProfile.logoUrl" },
//     },
//     {
//       id: "company-name",
//       type: "text",
//       position: { x: 45, y: 15 },
//       dimensions: { width: 100, height: 10 },
//       content: { dataKey: "tenant.companyName" },
//       style: { fontSize: 14, fontWeight: "bold" }, // Slightly smaller font
//     },
//     {
//       id: "company-address",
//       type: "text",
//       position: { x: 45, y: 26 },
//       dimensions: { width: 100, height: 20 },
//       content: {
//         template:
//           "{{tenant.companyProfile.address.street}}\n{{tenant.companyProfile.address.city}}, {{tenant.companyProfile.address.state}}\n{{tenant.companyProfile.address.postalCode}}",
//       },
//       style: { fontSize: 8 }, // Smaller font
//     },
//     {
//       id: "company-contact",
//       type: "text",
//       position: { x: 45, y: 48 },
//       dimensions: { width: 100, height: 15 },
//       content: {
//         template: "Tel: {{tenant.companyProfile.phone}}\nEmail: {{tenant.companyProfile.email}}\nTax ID: {{tenant.companyProfile.taxId}}",
//       },
//       style: { fontSize: 8 }, // Smaller font
//     },
//     {
//       id: "invoice-title",
//       type: "text",
//       position: { x: 150, y: 15 },
//       dimensions: { width: 45, height: 10 },
//       content: { staticText: "TAX INVOICE" },
//       style: { fontSize: 16, fontWeight: "bold", textAlign: "right" }, // Smaller font
//     },
//     {
//       id: "invoice-number",
//       type: "text",
//       position: { x: 150, y: 30 },
//       dimensions: { width: 45, height: 6 },
//       content: { template: "Invoice #: {{invoice.invoiceId}}" },
//       style: { fontSize: 9, textAlign: "right", fontWeight: "bold" }, // Smaller font
//     },
//     {
//       id: "invoice-date",
//       type: "text",
//       position: { x: 150, y: 37 },
//       dimensions: { width: 45, height: 6 },
//       content: { template: "Date: {{formatDate invoice.createdAt}}" },
//       style: { fontSize: 9, textAlign: "right" }, // Smaller font
//     },
//     {
//       id: "due-date",
//       type: "text",
//       position: { x: 150, y: 44 },
//       dimensions: { width: 45, height: 6 },
//       content: { template: "Due Date: {{formatDate invoice.dueDate}}" },
//       style: { fontSize: 9, textAlign: "right" }, // Smaller font
//     },

//     // ===== BILLING SECTION =====
//     {
//       id: "bill-to-label",
//       type: "text",
//       position: { x: 15, y: 70 },
//       dimensions: { width: 30, height: 5 },
//       content: { staticText: "BILL TO:" },
//       style: { fontSize: 9, fontWeight: "bold" }, // Smaller font
//     },
//     {
//       id: "customer-info",
//       type: "text",
//       position: { x: 15, y: 75 },
//       dimensions: { width: 80, height: 25 },
//       content: {
//         template:
//           "{{customer.name}}\n{{customer.address.street}}\n{{customer.address.city}}, {{customer.address.state}}\n{{customer.address.postalCode}}\n{{customer.phone}}",
//       },
//       style: { fontSize: 9 }, // Smaller font
//     },

//     // ===== ITEMS TABLE =====
//     {
//       id: "items-table",
//       type: "table",
//       position: { x: 15, y: 105 },
//       dimensions: { width: 180, height: 120 },
//       style: { border: { width: 0.5 } },
//       tableContent: {
//         dataKey: "invoice.items",
//         columns: [
//           { header: "Description", dataKey: "description", width: 70, align: "left" }, // Wider description
//           { header: "Qty", dataKey: "quantity", width: 15, align: "center" },
//           { header: "Unit Price", dataKey: "unitPrice", width: 30, align: "right", format: "currency" },
//           { header: "Discount", dataKey: "lineDiscount.value", width: 25, align: "right", format: "currency" },
//           { header: "Total", dataKey: "finalPrice", width: 30, align: "right", format: "currency" },
//         ],
//       },
//     },

//     // ===== FINANCIAL SUMMARY =====
//     {
//       id: "subtotal",
//       type: "text",
//       position: { x: 140, y: 230 },
//       dimensions: { width: 30, height: 6 },
//       content: { staticText: "Subtotal:" },
//       style: { fontSize: 9, textAlign: "right" }, // Smaller font
//     },
//     {
//       id: "subtotal-value",
//       type: "text",
//       position: { x: 170, y: 230 },
//       dimensions: { width: 25, height: 6 },
//       content: { template: "{{formatCurrency invoice.subTotal}}" },
//       style: { fontSize: 9, textAlign: "right" }, // Smaller font
//     },
//     {
//       id: "tax-label",
//       type: "text",
//       position: { x: 140, y: 237 },
//       dimensions: { width: 30, height: 6 },
//       content: { staticText: "Tax:" },
//       style: { fontSize: 9, textAlign: "right" }, // Smaller font
//     },
//     {
//       id: "tax-value",
//       type: "text",
//       position: { x: 170, y: 237 },
//       dimensions: { width: 25, height: 6 },
//       content: { template: "{{formatCurrency invoice.totalTax}}" },
//       style: { fontSize: 9, textAlign: "right" }, // Smaller font
//     },
//     {
//       id: "total-label",
//       type: "text",
//       position: { x: 140, y: 250 },
//       dimensions: { width: 30, height: 8 },
//       content: { staticText: "TOTAL:" },
//       style: { fontSize: 11, fontWeight: "bold", textAlign: "right" }, // Adjusted font size
//     },
//     {
//       id: "total-value",
//       type: "text",
//       position: { x: 170, y: 250 },
//       dimensions: { width: 25, height: 8 },
//       content: { template: "{{formatCurrency invoice.totalAmount}}" },
//       style: { fontSize: 11, fontWeight: "bold", textAlign: "right" }, // Adjusted font size
//     },

//     // ===== TERMS & NOTES =====
//     {
//       id: "terms-label",
//       type: "text",
//       position: { x: 15, y: 230 },
//       dimensions: { width: 40, height: 5 },
//       content: { staticText: "Payment Terms:" },
//       style: { fontSize: 9, fontWeight: "bold" }, // Smaller font
//     },
//     {
//       id: "terms-value",
//       type: "text",
//       position: { x: 15, y: 235 },
//       dimensions: { width: 100, height: 15 },
//       content: { template: "Net {{customer.creditTerms}} days\nLate payments subject to 1.5% monthly interest" },
//       style: { fontSize: 8 }, // Smaller font
//     },

//     // ===== FOOTER SECTION =====
//     {
//       id: "footer-line",
//       type: "line",
//       position: { x: 15, y: 270 },
//       dimensions: { width: 180, height: 0 },
//       style: { border: { width: 0.3, color: "#000000" } },
//     },
//     {
//       id: "footer-thanks",
//       type: "text",
//       position: { x: 15, y: 275 },
//       dimensions: { width: 180, height: 5 },
//       content: { staticText: "Thank you for your business!" },
//       style: { fontSize: 9, textAlign: "center", fontWeight: "bold" }, // Smaller font
//     },
//     {
//       id: "footer-contact",
//       type: "text",
//       position: { x: 15, y: 280 },
//       dimensions: { width: 180, height: 5 },
//       content: { template: "Questions? {{tenant.companyProfile.phone}} | {{tenant.companyProfile.email}}" },
//       style: { fontSize: 8, textAlign: "center" }, // Smaller font
//     },
//   ],
// }

// const DEFAULT_SALES_INVOICE_A4 = [
//   {
//     name: "Professional Sales Invoice",
//     documentType: "SalesInvoice",
//     paperSize: "A4",
//     orientation: "portrait",
//     printArea: {
//       top: 15,
//       bottom: 15,
//       left: 15,
//       right: 15,
//     },
//     elements: [
//       {
//         id: "header-company-logo",
//         type: "image",
//         position: { x: 20, y: 15 },
//         dimensions: { width: 50, height: 20 },
//         style: {
//           border: { width: 0 },
//         },
//         content: {
//           staticText: "COMPANY_LOGO",
//         },
//       },
//       {
//         id: "header-company-name",
//         type: "text",
//         position: { x: 80, y: 15 },
//         dimensions: { width: 100, height: 10 },
//         style: {
//           fontSize: 16,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "{{company.name}}",
//         },
//       },
//       {
//         id: "header-company-address",
//         type: "text",
//         position: { x: 80, y: 25 },
//         dimensions: { width: 100, height: 20 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           template:
//             "{{company.address}}\n{{company.city}}, {{company.state}} {{company.zip}}\nPhone: {{company.phone}}\nEmail: {{company.email}}",
//         },
//       },
//       {
//         id: "document-title",
//         type: "text",
//         position: { x: 150, y: 15 },
//         dimensions: { width: 50, height: 10 },
//         style: {
//           fontSize: 18,
//           fontWeight: "bold",
//           textAlign: "right",
//           color: "#333333",
//         },
//         content: {
//           staticText: "INVOICE",
//         },
//       },
//       {
//         id: "invoice-number-label",
//         type: "text",
//         position: { x: 150, y: 25 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Invoice #:",
//         },
//       },
//       {
//         id: "invoice-number-value",
//         type: "text",
//         position: { x: 175, y: 25 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "invoiceNumber",
//         },
//       },
//       {
//         id: "date-label",
//         type: "text",
//         position: { x: 150, y: 30 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Date:",
//         },
//       },
//       {
//         id: "date-value",
//         type: "text",
//         position: { x: 175, y: 30 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "createdAt",
//           format: "date",
//         },
//       },
//       {
//         id: "customer-section-label",
//         type: "text",
//         position: { x: 20, y: 50 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "BILL TO:",
//         },
//       },
//       {
//         id: "customer-details",
//         type: "text",
//         position: { x: 20, y: 55 },
//         dimensions: { width: 80, height: 25 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           template:
//             "{{customer.name}}\n{{customer.address}}\n{{customer.city}}, {{customer.state}} {{customer.postalCode}}\nPhone: {{customer.phone}}\nEmail: {{customer.email}}",
//         },
//       },
//       {
//         id: "payment-status-label",
//         type: "text",
//         position: { x: 150, y: 50 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "PAYMENT STATUS:",
//         },
//       },
//       {
//         id: "payment-status-value",
//         type: "text",
//         position: { x: 180, y: 50 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//           color: "#FF0000",
//         },
//         content: {
//           dataKey: "paymentStatus",
//         },
//       },
//       {
//         id: "due-date-label",
//         type: "text",
//         position: { x: 150, y: 55 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Due Date:",
//         },
//       },
//       {
//         id: "due-date-value",
//         type: "text",
//         position: { x: 180, y: 55 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "dueDate",
//           format: "date",
//         },
//       },
//       {
//         id: "items-table-header",
//         type: "rectangle",
//         position: { x: 20, y: 85 },
//         dimensions: { width: 170, height: 7 },
//         style: {
//           backgroundColor: "#f0f0f0",
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//       },
//       {
//         id: "items-table-header-description",
//         type: "text",
//         position: { x: 20, y: 86 },
//         dimensions: { width: 70, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "DESCRIPTION",
//         },
//       },
//       {
//         id: "items-table-header-qty",
//         type: "text",
//         position: { x: 90, y: 86 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "center",
//         },
//         content: {
//           staticText: "QTY",
//         },
//       },
//       {
//         id: "items-table-header-unitprice",
//         type: "text",
//         position: { x: 110, y: 86 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "UNIT PRICE",
//         },
//       },
//       {
//         id: "items-table-header-discount",
//         type: "text",
//         position: { x: 140, y: 86 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "DISC",
//         },
//       },
//       {
//         id: "items-table-header-amount",
//         type: "text",
//         position: { x: 160, y: 86 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "AMOUNT",
//         },
//       },
//       {
//         id: "items-table-content",
//         type: "table",
//         position: { x: 20, y: 92 },
//         dimensions: { width: 170, height: 100 },
//         style: {
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//         tableContent: {
//           dataKey: "items",
//           columns: [
//             {
//               header: "Description",
//               dataKey: "description",
//               width: 40,
//               align: "left",
//             },
//             {
//               header: "Qty",
//               dataKey: "quantity",
//               width: 10,
//               align: "center",
//             },
//             {
//               header: "Unit Price",
//               dataKey: "unitPrice",
//               width: 20,
//               align: "right",
//               format: "currency",
//             },
//             {
//               header: "Disc",
//               dataKey: "lineDiscount.value",
//               width: 15,
//               align: "right",
//             },
//             {
//               header: "Amount",
//               dataKey: "finalPrice",
//               width: 15,
//               align: "right",
//               format: "currency",
//             },
//           ],
//         },
//       },
//       {
//         id: "subtotal-label",
//         type: "text",
//         position: { x: 140, y: 200 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Subtotal:",
//         },
//       },
//       {
//         id: "subtotal-value",
//         type: "text",
//         position: { x: 170, y: 200 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "subTotal",
//           format: "currency",
//         },
//       },
//       {
//         id: "discount-label",
//         type: "text",
//         position: { x: 140, y: 205 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Discount:",
//         },
//       },
//       {
//         id: "discount-value",
//         type: "text",
//         position: { x: 170, y: 205 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "totalGlobalDiscount",
//           format: "currency",
//         },
//       },
//       {
//         id: "tax-label",
//         type: "text",
//         position: { x: 140, y: 210 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Tax:",
//         },
//       },
//       {
//         id: "tax-value",
//         type: "text",
//         position: { x: 170, y: 210 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "totalTax",
//           format: "currency",
//         },
//       },
//       {
//         id: "total-label",
//         type: "text",
//         position: { x: 140, y: 220 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "TOTAL:",
//         },
//       },
//       {
//         id: "total-value",
//         type: "text",
//         position: { x: 170, y: 220 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "totalAmount",
//           format: "currency",
//         },
//       },
//       {
//         id: "amount-paid-label",
//         type: "text",
//         position: { x: 140, y: 225 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Amount Paid:",
//         },
//       },
//       {
//         id: "amount-paid-value",
//         type: "text",
//         position: { x: 170, y: 225 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "amountPaid",
//           format: "currency",
//         },
//       },
//       {
//         id: "balance-due-label",
//         type: "text",
//         position: { x: 140, y: 230 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Balance Due:",
//         },
//       },
//       {
//         id: "balance-due-value",
//         type: "text",
//         position: { x: 170, y: 230 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//           color: "#FF0000",
//         },
//         content: {
//           template: "{{totalAmount - amountPaid}}",
//           format: "currency",
//         },
//       },
//       {
//         id: "footer-notes",
//         type: "text",
//         position: { x: 20, y: 240 },
//         dimensions: { width: 170, height: 30 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           staticText:
//             "Thank you for your business!\nPayment is due within {{customer.creditTerms}} days.\nLate payments are subject to a 1.5% monthly finance charge.",
//         },
//       },
//       {
//         id: "footer-prepared-by",
//         type: "text",
//         position: { x: 20, y: 270 },
//         dimensions: { width: 60, height: 10 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           template: "Prepared by: {{soldBy.name}}",
//         },
//       },
//       {
//         id: "footer-date",
//         type: "text",
//         position: { x: 130, y: 270 },
//         dimensions: { width: 60, height: 10 },
//         style: {
//           fontSize: 8,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "createdAt",
//           format: "datetime",
//         },
//       },
//     ],
//   },
//   {
//     name: "Standard Repair Ticket",
//     documentType: "RepairTicket",
//     paperSize: "A5",
//     orientation: "portrait",
//     printArea: {
//       top: 10,
//       bottom: 10,
//       left: 10,
//       right: 10,
//     },
//     elements: [
//       {
//         id: "header-company-logo",
//         type: "image",
//         position: { x: 10, y: 10 },
//         dimensions: { width: 40, height: 15 },
//         style: {
//           border: { width: 0 },
//         },
//         content: {
//           staticText: "COMPANY_LOGO",
//         },
//       },
//       {
//         id: "header-company-name",
//         type: "text",
//         position: { x: 60, y: 10 },
//         dimensions: { width: 70, height: 8 },
//         style: {
//           fontSize: 14,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "{{company.name}}",
//         },
//       },
//       {
//         id: "header-company-address",
//         type: "text",
//         position: { x: 60, y: 18 },
//         dimensions: { width: 70, height: 15 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           template: "{{company.address}}\n{{company.city}}, {{company.state}}",
//         },
//       },
//       {
//         id: "document-title",
//         type: "text",
//         position: { x: 100, y: 10 },
//         dimensions: { width: 30, height: 8 },
//         style: {
//           fontSize: 16,
//           fontWeight: "bold",
//           textAlign: "right",
//           color: "#333333",
//         },
//         content: {
//           staticText: "REPAIR TICKET",
//         },
//       },
//       {
//         id: "ticket-number-label",
//         type: "text",
//         position: { x: 100, y: 18 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Ticket #:",
//         },
//       },
//       {
//         id: "ticket-number-value",
//         type: "text",
//         position: { x: 120, y: 18 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "ticketNumber",
//         },
//       },
//       {
//         id: "date-label",
//         type: "text",
//         position: { x: 100, y: 23 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Date:",
//         },
//       },
//       {
//         id: "date-value",
//         type: "text",
//         position: { x: 120, y: 23 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "createdAt",
//           format: "date",
//         },
//       },
//       {
//         id: "customer-section-label",
//         type: "text",
//         position: { x: 10, y: 35 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "CUSTOMER:",
//         },
//       },
//       {
//         id: "customer-details",
//         type: "text",
//         position: { x: 10, y: 40 },
//         dimensions: { width: 60, height: 15 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           template: "{{customer.name}}\n{{customer.phone}}\n{{customer.email}}",
//         },
//       },
//       {
//         id: "status-label",
//         type: "text",
//         position: { x: 100, y: 35 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "STATUS:",
//         },
//       },
//       {
//         id: "status-value",
//         type: "text",
//         position: { x: 120, y: 35 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           fontWeight: "bold",
//           textAlign: "left",
//           color: "#FF0000",
//         },
//         content: {
//           dataKey: "status",
//         },
//       },
//       {
//         id: "assigned-to-label",
//         type: "text",
//         position: { x: 100, y: 40 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Tech:",
//         },
//       },
//       {
//         id: "assigned-to-value",
//         type: "text",
//         position: { x: 120, y: 40 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "assignedTo.name",
//         },
//       },
//       {
//         id: "complaint-label",
//         type: "text",
//         position: { x: 10, y: 55 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "COMPLAINT:",
//         },
//       },
//       {
//         id: "complaint-value",
//         type: "text",
//         position: { x: 10, y: 60 },
//         dimensions: { width: 120, height: 20 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "customerComplaint",
//         },
//       },
//       {
//         id: "diagnosis-label",
//         type: "text",
//         position: { x: 10, y: 80 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "DIAGNOSIS:",
//         },
//       },
//       {
//         id: "diagnosis-value",
//         type: "text",
//         position: { x: 10, y: 85 },
//         dimensions: { width: 120, height: 20 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           staticText: "To be determined",
//         },
//       },
//       {
//         id: "parts-label",
//         type: "text",
//         position: { x: 10, y: 105 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "PARTS:",
//         },
//       },
//       {
//         id: "parts-table",
//         type: "table",
//         position: { x: 10, y: 110 },
//         dimensions: { width: 120, height: 40 },
//         style: {
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//         tableContent: {
//           dataKey: "jobSheet",
//           columns: [
//             {
//               header: "Description",
//               dataKey: "description",
//               width: 60,
//               align: "left",
//             },
//             {
//               header: "Qty",
//               dataKey: "quantity",
//               width: 20,
//               align: "center",
//             },
//             {
//               header: "Price",
//               dataKey: "unitPrice",
//               width: 20,
//               align: "right",
//               format: "currency",
//             },
//           ],
//         },
//       },
//       {
//         id: "labor-label",
//         type: "text",
//         position: { x: 10, y: 150 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "LABOR:",
//         },
//       },
//       {
//         id: "labor-table",
//         type: "table",
//         position: { x: 10, y: 155 },
//         dimensions: { width: 120, height: 20 },
//         style: {
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//         tableContent: {
//           dataKey: "jobSheet",
//           columns: [
//             {
//               header: "Description",
//               dataKey: "description",
//               width: 50,
//               align: "left",
//             },
//             {
//               header: "Hours",
//               dataKey: "laborHours",
//               width: 20,
//               align: "center",
//             },
//             {
//               header: "Rate",
//               dataKey: "laborRate",
//               width: 20,
//               align: "right",
//               format: "currency",
//             },
//             {
//               header: "Total",
//               dataKey: "finalPrice",
//               width: 20,
//               align: "right",
//               format: "currency",
//             },
//           ],
//         },
//       },
//       {
//         id: "total-label",
//         type: "text",
//         position: { x: 80, y: 175 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "ESTIMATE:",
//         },
//       },
//       {
//         id: "total-value",
//         type: "text",
//         position: { x: 110, y: 175 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           template: "{{jobSheet.reduce((sum, item) => sum + item.finalPrice, 0)}}",
//           format: "currency",
//         },
//       },
//       {
//         id: "footer-notes",
//         type: "text",
//         position: { x: 10, y: 185 },
//         dimensions: { width: 120, height: 15 },
//         style: {
//           fontSize: 7,
//           textAlign: "left",
//         },
//         content: {
//           staticText:
//             "1. Customer approval required before any repairs begin.\n2. A diagnostic fee may apply if repair is declined.\n3. Warranty: 90 days on parts and labor.",
//         },
//       },
//       {
//         id: "customer-signature-line",
//         type: "line",
//         position: { x: 10, y: 195 },
//         dimensions: { width: 60, height: 0 },
//         style: {
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//       },
//       {
//         id: "customer-signature-label",
//         type: "text",
//         position: { x: 10, y: 196 },
//         dimensions: { width: 60, height: 5 },
//         style: {
//           fontSize: 7,
//           textAlign: "center",
//         },
//         content: {
//           staticText: "Customer Signature",
//         },
//       },
//       {
//         id: "date-line",
//         type: "line",
//         position: { x: 80, y: 195 },
//         dimensions: { width: 60, height: 0 },
//         style: {
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//       },
//       {
//         id: "date-label-footer",
//         type: "text",
//         position: { x: 80, y: 196 },
//         dimensions: { width: 60, height: 5 },
//         style: {
//           fontSize: 7,
//           textAlign: "center",
//         },
//         content: {
//           staticText: "Date",
//         },
//       },
//     ],
//   },
//   {
//     name: "Standard Purchase Order",
//     documentType: "PurchaseOrder",
//     paperSize: "A4",
//     orientation: "portrait",
//     printArea: {
//       top: 15,
//       bottom: 15,
//       left: 15,
//       right: 15,
//     },
//     elements: [
//       {
//         id: "header-company-logo",
//         type: "image",
//         position: { x: 20, y: 15 },
//         dimensions: { width: 50, height: 20 },
//         style: {
//           border: { width: 0 },
//         },
//         content: {
//           staticText: "COMPANY_LOGO",
//         },
//       },
//       {
//         id: "header-company-name",
//         type: "text",
//         position: { x: 80, y: 15 },
//         dimensions: { width: 100, height: 10 },
//         style: {
//           fontSize: 16,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "{{company.name}}",
//         },
//       },
//       {
//         id: "header-company-address",
//         type: "text",
//         position: { x: 80, y: 25 },
//         dimensions: { width: 100, height: 20 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           template:
//             "{{company.address}}\n{{company.city}}, {{company.state}} {{company.zip}}\nPhone: {{company.phone}}\nEmail: {{company.email}}",
//         },
//       },
//       {
//         id: "document-title",
//         type: "text",
//         position: { x: 150, y: 15 },
//         dimensions: { width: 50, height: 10 },
//         style: {
//           fontSize: 18,
//           fontWeight: "bold",
//           textAlign: "right",
//           color: "#333333",
//         },
//         content: {
//           staticText: "PURCHASE ORDER",
//         },
//       },
//       {
//         id: "po-number-label",
//         type: "text",
//         position: { x: 150, y: 25 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "PO #:",
//         },
//       },
//       {
//         id: "po-number-value",
//         type: "text",
//         position: { x: 175, y: 25 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "poNumber",
//         },
//       },
//       {
//         id: "date-label",
//         type: "text",
//         position: { x: 150, y: 30 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Date:",
//         },
//       },
//       {
//         id: "date-value",
//         type: "text",
//         position: { x: 175, y: 30 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "orderDate",
//           format: "date",
//         },
//       },
//       {
//         id: "supplier-section-label",
//         type: "text",
//         position: { x: 20, y: 50 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "SUPPLIER:",
//         },
//       },
//       {
//         id: "supplier-details",
//         type: "text",
//         position: { x: 20, y: 55 },
//         dimensions: { width: 80, height: 25 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           template:
//             "{{supplier.name}}\n{{supplier.contactPerson}}\n{{supplier.address.street}}\n{{supplier.address.city}}, {{supplier.address.state}}\nPhone: {{supplier.phone}}\nEmail: {{supplier.email}}",
//         },
//       },
//       {
//         id: "delivery-section-label",
//         type: "text",
//         position: { x: 120, y: 50 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "DELIVER TO:",
//         },
//       },
//       {
//         id: "delivery-details",
//         type: "text",
//         position: { x: 120, y: 55 },
//         dimensions: { width: 80, height: 25 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           template:
//             "{{branch.name}}\n{{branch.address.street}}\n{{branch.address.city}}, {{branch.address.state}}\nAttn: {{createdBy.name}}",
//         },
//       },
//       {
//         id: "expected-date-label",
//         type: "text",
//         position: { x: 150, y: 50 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Expected:",
//         },
//       },
//       {
//         id: "expected-date-value",
//         type: "text",
//         position: { x: 175, y: 50 },
//         dimensions: { width: 25, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "left",
//         },
//         content: {
//           dataKey: "expectedDeliveryDate",
//           format: "date",
//         },
//       },
//       {
//         id: "items-table-header",
//         type: "rectangle",
//         position: { x: 20, y: 85 },
//         dimensions: { width: 170, height: 7 },
//         style: {
//           backgroundColor: "#f0f0f0",
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//       },
//       {
//         id: "items-table-header-itemno",
//         type: "text",
//         position: { x: 20, y: 86 },
//         dimensions: { width: 15, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "center",
//         },
//         content: {
//           staticText: "ITEM #",
//         },
//       },
//       {
//         id: "items-table-header-description",
//         type: "text",
//         position: { x: 35, y: 86 },
//         dimensions: { width: 60, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "left",
//         },
//         content: {
//           staticText: "DESCRIPTION",
//         },
//       },
//       {
//         id: "items-table-header-qty",
//         type: "text",
//         position: { x: 95, y: 86 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "center",
//         },
//         content: {
//           staticText: "QTY",
//         },
//       },
//       {
//         id: "items-table-header-unitprice",
//         type: "text",
//         position: { x: 115, y: 86 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "UNIT PRICE",
//         },
//       },
//       {
//         id: "items-table-header-amount",
//         type: "text",
//         position: { x: 145, y: 86 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "AMOUNT",
//         },
//       },
//       {
//         id: "items-table-header-received",
//         type: "text",
//         position: { x: 175, y: 86 },
//         dimensions: { width: 15, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "center",
//         },
//         content: {
//           staticText: "REC",
//         },
//       },
//       {
//         id: "items-table-content",
//         type: "table",
//         position: { x: 20, y: 92 },
//         dimensions: { width: 170, height: 100 },
//         style: {
//           border: {
//             width: 1,
//             color: "#000000",
//           },
//         },
//         tableContent: {
//           dataKey: "items",
//           columns: [
//             {
//               header: "Item #",
//               dataKey: "productVariantId",
//               width: 10,
//               align: "center",
//             },
//             {
//               header: "Description",
//               dataKey: "description",
//               width: 35,
//               align: "left",
//             },
//             {
//               header: "Qty",
//               dataKey: "quantityOrdered",
//               width: 10,
//               align: "center",
//             },
//             {
//               header: "Unit Price",
//               dataKey: "costPrice",
//               width: 20,
//               align: "right",
//               format: "currency",
//             },
//             {
//               header: "Amount",
//               dataKey: "totalCost",
//               width: 20,
//               align: "right",
//               format: "currency",
//             },
//             {
//               header: "Rec",
//               dataKey: "quantityReceived",
//               width: 5,
//               align: "center",
//             },
//           ],
//         },
//       },
//       {
//         id: "subtotal-label",
//         type: "text",
//         position: { x: 140, y: 200 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Subtotal:",
//         },
//       },
//       {
//         id: "subtotal-value",
//         type: "text",
//         position: { x: 170, y: 200 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "subTotal",
//           format: "currency",
//         },
//       },
//       {
//         id: "tax-label",
//         type: "text",
//         position: { x: 140, y: 205 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Tax:",
//         },
//       },
//       {
//         id: "tax-value",
//         type: "text",
//         position: { x: 170, y: 205 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "taxes",
//           format: "currency",
//         },
//       },
//       {
//         id: "shipping-label",
//         type: "text",
//         position: { x: 140, y: 210 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 10,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Shipping:",
//         },
//       },
//       {
//         id: "shipping-value",
//         type: "text",
//         position: { x: 170, y: 210 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 10,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "shippingCosts",
//           format: "currency",
//         },
//       },
//       {
//         id: "total-label",
//         type: "text",
//         position: { x: 140, y: 220 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           staticText: "TOTAL:",
//         },
//       },
//       {
//         id: "total-value",
//         type: "text",
//         position: { x: 170, y: 220 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 12,
//           fontWeight: "bold",
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "totalAmount",
//           format: "currency",
//         },
//       },
//       {
//         id: "currency-label",
//         type: "text",
//         position: { x: 140, y: 225 },
//         dimensions: { width: 30, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "right",
//         },
//         content: {
//           staticText: "Currency:",
//         },
//       },
//       {
//         id: "currency-value",
//         type: "text",
//         position: { x: 170, y: 225 },
//         dimensions: { width: 20, height: 5 },
//         style: {
//           fontSize: 8,
//           textAlign: "right",
//         },
//         content: {
//           dataKey: "transactionCurrency",
//         },
//       },
//       {
//         id: "footer-notes",
//         type: "text",
//         position: { x: 20, y: 240 },
//         dimensions: { width: 170, height: 30 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           staticText:
//             "1. All goods must be delivered in good condition.\n2. Any discrepancies must be reported within 48 hours of delivery.\n3. Payment terms: Net 30 days from date of invoice.",
//         },
//       },
//       {
//         id: "footer-prepared-by",
//         type: "text",
//         position: { x: 20, y: 270 },
//         dimensions: { width: 60, height: 10 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           template: "Prepared by: {{createdBy.name}}",
//         },
//       },
//       {
//         id: "footer-approved-by",
//         type: "text",
//         position: { x: 100, y: 270 },
//         dimensions: { width: 60, height: 10 },
//         style: {
//           fontSize: 8,
//           textAlign: "left",
//         },
//         content: {
//           staticText: "Approved by: ________________",
//         },
//       },
//     ],
//   },
// ]

// const defaultTemplates = DEFAULT_SALES_INVOICE_A4
// // const defaultTemplates = [
// //   DEFAULT_SALES_INVOICE_A4,
// //   // Add default templates for RepairTicket, PurchaseOrder, etc. here
// // ]

// module.exports = defaultTemplates

const { v4: uuidv4 } = require("uuid")

// Helper for mm to points conversion (1mm = 2.83465 points)
const mmToPoints = (mm) => mm * 2.83465

// Common company header elements
const COMPANY_HEADER = [
  {
    id: uuidv4(),
    type: "text",
    position: { x: mmToPoints(15), y: mmToPoints(15) },
    dimensions: { width: mmToPoints(80), height: mmToPoints(8) },
    content: {
      staticText: "{{tenant.companyName}}",
      dataKey: "tenant.companyName",
    },
    style: {
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: "Helvetica-Bold",
    },
  },
  {
    id: uuidv4(),
    type: "text",
    position: { x: mmToPoints(15), y: mmToPoints(25) },
    dimensions: { width: mmToPoints(80), height: mmToPoints(6) },
    content: {
      template: "{{tenant.address}}\n{{tenant.city}}, {{tenant.state}} {{tenant.postalCode}}",
    },
    style: { fontSize: 10 },
  },
  {
    id: uuidv4(),
    type: "text",
    position: { x: mmToPoints(15), y: mmToPoints(40) },
    dimensions: { width: mmToPoints(80), height: mmToPoints(5) },
    content: {
      template: "Phone: {{tenant.phone}}\nEmail: {{tenant.email}}",
    },
    style: { fontSize: 9 },
  },
]

// ======================
// SALES INVOICE TEMPLATES
// ======================

// A4 Sales Invoice (210mm x 297mm)
const SALES_INVOICE_A4 = {
  name: "Professional A4 Sales Invoice",
  documentType: "SalesInvoice",
  paperSize: "A4",
  orientation: "portrait",
  isDefault: true,
  renderEngine: "pdfkit",

  reportHeaderElements: [
    ...COMPANY_HEADER,
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(150), y: mmToPoints(15) },
      dimensions: { width: mmToPoints(50), height: mmToPoints(10) },
      content: { staticText: "TAX INVOICE" },
      style: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "right",
        fontFamily: "Helvetica-Bold",
      },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(150), y: mmToPoints(30) },
      dimensions: { width: mmToPoints(50), height: mmToPoints(6) },
      content: {
        template: "Invoice #: {{invoiceId}}\nDate: {{formatDate createdAt 'DD/MM/YYYY'}}",
      },
      style: { textAlign: "right", fontSize: 10 },
    },
  ],

  pageHeaderElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(80) },
      dimensions: { width: mmToPoints(30), height: mmToPoints(5) },
      content: { staticText: "BILL TO:" },
      style: { fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(90) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(15) },
      content: {
        template: "{{customer.name}}\n{{customer.address}}\n{{customer.city}}, {{customer.state}} {{customer.postalCode}}",
      },
    },
    {
      id: uuidv4(),
      type: "line",
      position: { x: mmToPoints(15), y: mmToPoints(115) },
      dimensions: { width: mmToPoints(180), height: 1 },
      style: { stroke: "#000000", strokeWidth: 0.5 },
    },
    // Table Headers
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(120) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(5) },
      content: { staticText: "DESCRIPTION" },
      style: { fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(120) },
      dimensions: { width: mmToPoints(20), height: mmToPoints(5) },
      content: { staticText: "QTY" },
      style: { fontWeight: "bold", textAlign: "center" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(130), y: mmToPoints(120) },
      dimensions: { width: mmToPoints(25), height: mmToPoints(5) },
      content: { staticText: "UNIT PRICE" },
      style: { fontWeight: "bold", textAlign: "right" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(160), y: mmToPoints(120) },
      dimensions: { width: mmToPoints(25), height: mmToPoints(5) },
      content: { staticText: "TOTAL" },
      style: { fontWeight: "bold", textAlign: "right" },
    },
  ],

  detailElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: 0 },
      dimensions: { width: mmToPoints(80), height: mmToPoints(8) },
      content: { dataKey: "items[].description" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: 0 },
      dimensions: { width: mmToPoints(20), height: mmToPoints(8) },
      content: { dataKey: "items[].quantity" },
      style: { textAlign: "center" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(130), y: 0 },
      dimensions: { width: mmToPoints(25), height: mmToPoints(8) },
      content: { dataKey: "items[].unitPrice", format: "currency" },
      style: { textAlign: "right" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(160), y: 0 },
      dimensions: { width: mmToPoints(25), height: mmToPoints(8) },
      content: { dataKey: "items[].finalPrice", format: "currency" },
      style: { textAlign: "right", fontWeight: "bold" },
    },
  ],

  pageFooterElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(270) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(5) },
      content: { template: "Page {{pageNumber}} of {{pageCount}}" },
      style: { fontSize: 9, textAlign: "center" },
    },
  ],

  reportFooterElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(130), y: mmToPoints(20) },
      dimensions: { width: mmToPoints(50), height: mmToPoints(30) },
      content: {
        template:
          "SUBTOTAL: {{formatCurrency subTotal}}\n" +
          "{{#if globalDiscount}}DISCOUNT: -{{formatCurrency totalGlobalDiscount}}\n{{/if}}" +
          "{{#each additionalCharges}}{{description}}: {{formatCurrency amount}}\n{{/each}}" +
          "TAX: {{formatCurrency totalTax}}\n" +
          "TOTAL: {{formatCurrency totalAmount}}",
      },
      style: { textAlign: "right", fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(60) },
      dimensions: { width: mmToPoints(180), height: mmToPoints(10) },
      content: { staticText: "Payment Terms: Net 30 days" },
      style: { fontSize: 10 },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(75) },
      dimensions: { width: mmToPoints(180), height: mmToPoints(5) },
      content: { dataKey: "notes" },
      style: { fontStyle: "italic", fontSize: 9 },
    },
  ],
}

// A5 Sales Invoice (148mm x 210mm)
const SALES_INVOICE_A5 = {
  ...SALES_INVOICE_A4,
  name: "Compact A5 Sales Invoice",
  paperSize: "A5",
  reportHeaderElements: [
    ...COMPANY_HEADER.map((el) => ({
      ...el,
      position: { ...el.position, x: mmToPoints(10) },
    })),
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(15) },
      dimensions: { width: mmToPoints(40), height: mmToPoints(8) },
      content: { staticText: "INVOICE" },
      style: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "right",
        fontFamily: "Helvetica-Bold",
      },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(25) },
      dimensions: { width: mmToPoints(40), height: mmToPoints(6) },
      content: {
        template: "#{{invoiceId}}\n{{formatDate createdAt 'DD/MM/YY'}}",
      },
      style: { textAlign: "right", fontSize: 9 },
    },
  ],
  pageHeaderElements: [
    // Compact layout with adjusted positions
  ],
  // Other elements adjusted for A5 size...
}

// ======================
// REPAIR TICKET TEMPLATES
// ======================

// A4 Repair Ticket (210mm x 297mm)
const REPAIR_TICKET_A4 = {
  name: "Professional A4 Repair Ticket",
  documentType: "RepairTicket",
  paperSize: "A4",
  orientation: "portrait",
  isDefault: true,
  renderEngine: "pdfkit",

  reportHeaderElements: [
    ...COMPANY_HEADER,
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(150), y: mmToPoints(15) },
      dimensions: { width: mmToPoints(50), height: mmToPoints(10) },
      content: { staticText: "REPAIR TICKET" },
      style: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "right",
        fontFamily: "Helvetica-Bold",
      },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(150), y: mmToPoints(30) },
      dimensions: { width: mmToPoints(50), height: mmToPoints(15) },
      content: {
        template: "Ticket #: {{ticketNumber}}\n" + "Status: {{status}}\n" + "Created: {{formatDate createdAt 'DD/MM/YYYY'}}",
      },
      style: { textAlign: "right", fontSize: 10 },
    },
  ],

  pageHeaderElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(70) },
      dimensions: { width: mmToPoints(30), height: mmToPoints(5) },
      content: { staticText: "CUSTOMER:" },
      style: { fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(80) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(15) },
      content: {
        template: "{{customer.name}}\n{{customer.phone}}\n{{customer.email}}",
      },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(70) },
      dimensions: { width: mmToPoints(30), height: mmToPoints(5) },
      content: { staticText: "ASSET:" },
      style: { fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(80) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(15) },
      content: {
        template: "{{assets.0.model}}\nSerial: {{assets.0.serialNumber}}",
      },
    },
    {
      id: uuidv4(),
      type: "line",
      position: { x: mmToPoints(15), y: mmToPoints(105) },
      dimensions: { width: mmToPoints(180), height: 1 },
      style: { stroke: "#000000", strokeWidth: 0.5 },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(110) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(5) },
      content: { staticText: "CUSTOMER COMPLAINT:" },
      style: { fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(120) },
      dimensions: { width: mmToPoints(180), height: mmToPoints(20) },
      content: { dataKey: "customerComplaint" },
      style: { fontStyle: "italic" },
    },
    // Table Headers
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(150) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(5) },
      content: { staticText: "REPAIR DETAILS" },
      style: { fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(150) },
      dimensions: { width: mmToPoints(20), height: mmToPoints(5) },
      content: { staticText: "QTY" },
      style: { fontWeight: "bold", textAlign: "center" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(130), y: mmToPoints(150) },
      dimensions: { width: mmToPoints(25), height: mmToPoints(5) },
      content: { staticText: "PRICE" },
      style: { fontWeight: "bold", textAlign: "right" },
    },
  ],

  detailElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: 0 },
      dimensions: { width: mmToPoints(80), height: mmToPoints(8) },
      content: { dataKey: "jobSheet[].description" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: 0 },
      dimensions: { width: mmToPoints(20), height: mmToPoints(8) },
      content: { dataKey: "jobSheet[].quantity" },
      style: { textAlign: "center" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(130), y: 0 },
      dimensions: { width: mmToPoints(25), height: mmToPoints(8) },
      content: {
        template: "{{#if (eq itemType 'labor')}}{{multiply laborHours laborRate}}{{else}}{{unitPrice}}{{/if}}",
        format: "currency",
      },
      style: { textAlign: "right" },
    },
  ],

  reportFooterElements: [
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(130), y: mmToPoints(20) },
      dimensions: { width: mmToPoints(50), height: mmToPoints(20) },
      content: {
        template:
          "SUBTOTAL: {{formatCurrency jobSheetTotal}}\n" + "TAX: {{formatCurrency taxAmount}}\n" + "TOTAL: {{formatCurrency totalAmount}}",
      },
      style: { textAlign: "right", fontWeight: "bold" },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(15), y: mmToPoints(50) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(20) },
      content: {
        template:
          "QC STATUS: {{qcResult.status}}\n" +
          "Checked by: {{qcResult.checkedBy.name}}\n" +
          "On: {{formatDate qcResult.checkedAt 'DD/MM/YYYY'}}",
      },
      style: { fontSize: 10 },
    },
    {
      id: uuidv4(),
      type: "text",
      position: { x: mmToPoints(100), y: mmToPoints(50) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(20) },
      content: {
        staticText: "Customer Signature:",
        style: { fontWeight: "bold" },
      },
    },
    {
      id: uuidv4(),
      type: "image",
      position: { x: mmToPoints(100), y: mmToPoints(60) },
      dimensions: { width: mmToPoints(80), height: mmToPoints(30) },
      content: { dataKey: "customerSignature" },
    },
  ],
}

// A5 Repair Ticket (148mm x 210mm)
const REPAIR_TICKET_A5 = {
  ...REPAIR_TICKET_A4,
  name: "Compact A5 Repair Ticket",
  paperSize: "A5",
  // Adjusted positions and dimensions for A5...
}

// Export all templates

const defaultTemplates = [SALES_INVOICE_A4, SALES_INVOICE_A5, REPAIR_TICKET_A4, REPAIR_TICKET_A5]

module.exports = defaultTemplates
