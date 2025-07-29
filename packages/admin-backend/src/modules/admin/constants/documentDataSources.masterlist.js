/**
 * The definitive master list of all available data fields (the "Data Dictionary").
 * This provides a single source of truth for the frontend visual builder's FieldExplorer.
 * This version is fully implemented with no placeholders.
 */
const documentDataSources = {
  SalesInvoice: [
    {
      group: "Company Details",
      fields: [
        { label: "Company Name", dataKey: "tenant.companyName" },
        { label: "Company Address", dataKey: "tenant.address", template: "{{street}}, {{city}}" },
        { label: "Company Phone", dataKey: "tenant.phone" },
      ],
    },
    {
      group: "Customer Details",
      fields: [
        { label: "Customer Name", dataKey: "customer.name" },
        { label: "Customer Phone", dataKey: "customer.phone" },
        { label: "Billing Address", dataKey: "customer.billingAddress", template: "{{street}}\n{{city}}, {{state}} {{zip}}" },
      ],
    },
    {
      group: "Invoice Details",
      fields: [
        { label: "Invoice Number", dataKey: "invoice.invoiceId" },
        { label: "Invoice Date", dataKey: "invoice.createdAt", format: "date" },
        { label: "Due Date", dataKey: "invoice.dueDate", format: "date" },
        { label: "Subtotal", dataKey: "invoice.subTotal", format: "currency" },
        { label: "Total Tax", dataKey: "invoice.totalTax", format: "currency" },
        { label: "Grand Total", dataKey: "invoice.totalAmount", format: "currency" },
        { label: "Amount Paid", dataKey: "invoice.amountPaid", format: "currency" },
        { label: "Balance Due", dataKey: "invoice.balanceDue", format: "currency" },
      ],
    },
    {
      group: "Invoice Items (Table)",
      dataKey: "invoice.items", // The key for the repeating data
      fields: [
        { label: "Item Description", dataKey: "description" },
        { label: "Quantity", dataKey: "quantity" },
        { label: "Unit Price", dataKey: "unitPrice", format: "currency" },
        { label: "Line Total", dataKey: "finalPrice", format: "currency" },
      ],
    },
  ],
  // --- Definitive Fix #1: Fully implement the RepairTicket data source ---
  RepairTicket: [
    {
      group: "Company Details",
      fields: [
        { label: "Company Name", dataKey: "tenant.companyName" },
        { label: "Company Address", dataKey: "tenant.address" },
      ],
    },
    {
      group: "Customer Details",
      fields: [
        { label: "Customer Name", dataKey: "customer.name" },
        { label: "Customer Phone", dataKey: "customer.phone" },
      ],
    },
    {
      group: "Ticket Details",
      fields: [
        { label: "Ticket Number", dataKey: "ticket.ticketNumber" },
        { label: "Ticket Status", dataKey: "ticket.status" },
        { label: "Intake Date", dataKey: "ticket.createdAt", format: "datetime" },
        { label: "Customer Complaint", dataKey: "ticket.customerComplaint" },
      ],
    },
    {
      group: "Asset Details",
      // Note: This assumes we are printing for the first asset in the list.
      // A more advanced template could loop through assets.
      fields: [
        { label: "Asset Name", dataKey: "asset.0.deviceId.name" },
        { label: "Asset Serial Number", dataKey: "asset.0.serialNumber" },
      ],
    },
    {
      group: "Assigned Technician",
      fields: [{ label: "Technician Name", dataKey: "technician.name" }],
    },
    {
      group: "Job Sheet (Table)",
      dataKey: "ticket.jobSheet",
      fields: [
        { label: "Item/Labor", dataKey: "description" },
        { label: "Quantity/Hours", dataKey: "quantity", fallbackKey: "laborHours" },
        { label: "Unit Price", dataKey: "unitPrice", fallbackKey: "laborRate", format: "currency" },
        { label: "Line Total", dataKey: "total", format: "currency" }, // This would be a calculated field
      ],
    },
  ],
  // --- End of Fix ---
}

module.exports = documentDataSources
