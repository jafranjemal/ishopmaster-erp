/**
 * The definitive master list of all available data fields for document templates.
 * This acts as a "data dictionary" for the frontend visual builder.
 */
const documentDataFields = {
  SalesInvoice: [
    {
      group: "Invoice Details",
      fields: [
        { label: "Invoice Number", key: "invoice.invoiceId" },
        { label: "Invoice Date", key: "invoice.createdAt", format: "date" },
        { label: "Due Date", key: "invoice.dueDate", format: "date" },
      ],
    },
    {
      group: "Customer Details",
      fields: [
        { label: "Customer Name", key: "customer.name" },
        { label: "Customer Phone", key: "customer.phone" },
        { label: "Billing Address", key: "customer.billingAddress", template: "{{street}}\n{{city}}" },
      ],
    },
    {
      group: "Financials",
      fields: [
        { label: "Subtotal", key: "invoice.subTotal", format: "currency" },
        { label: "Total Tax", key: "invoice.totalTax", format: "currency" },
        { label: "Grand Total", key: "invoice.totalAmount", format: "currency" },
        { label: "Amount Paid", key: "invoice.amountPaid", format: "currency" },
        { label: "Balance Due", key: "invoice.balanceDue", format: "currency" },
      ],
    },
    {
      group: "Company Details",
      fields: [
        { label: "Company Name", key: "tenant.companyName" },
        { label: "Company Address", key: "tenant.address" },
      ],
    },
  ],
  RepairTicket: [
    // Define specific fields available for Repair Tickets here
  ],
}

module.exports = documentDataFields
