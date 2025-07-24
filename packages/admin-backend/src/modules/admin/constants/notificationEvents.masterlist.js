/**
 * The definitive master list of all notification-triggering events in the iShopMaster ERP.
 * This provides a single source of truth for developers and a selectable list for admins.
 *
 * Structure:
 * - eventName: A unique, machine-readable identifier (module.entity.action).
 * - description: A human-readable explanation for the admin UI.
 * - variables: A list of available placeholders for the template editor's "Toolbox".
 */
const notificationEvents = [
  // ====================================================================
  // Service & Repair Module
  // ====================================================================
  {
    eventName: "repair.status_changed.diagnosing",
    description: 'Triggered when a repair ticket moves to the "Diagnosing" status.',
    variables: ["ticket.ticketId", "customer.name", "device.name"],
  },
  {
    eventName: "repair.status_changed.approval_pending",
    description: "Triggered when a repair quote is generated and sent to the customer.",
    variables: ["ticket.ticketId", "customer.name", "quote.grandTotal", "quote.url"],
  },
  {
    eventName: "repair.status_changed.repair_active",
    description: "Triggered when a customer approves a quote and the repair begins.",
    variables: ["ticket.ticketId", "customer.name"],
  },
  {
    eventName: "repair.status_changed.pickup_pending",
    description: "Triggered when a repair has passed QC and is ready for pickup.",
    variables: ["ticket.ticketId", "customer.name", "invoice.grandTotal", "branch.name"],
  },
  {
    eventName: "repair.technician.assigned",
    description: "Triggered when a technician is assigned to a repair ticket.",
    variables: ["ticket.ticketId", "customer.name", "technician.name"],
  },
  {
    eventName: "repair.post_service.follow_up",
    description: "Triggered by a scheduled job a few days after a repair is closed.",
    variables: ["ticket.ticketId", "customer.name", "branch.name"],
  },

  // ====================================================================
  // Sales & CRM Module
  // ====================================================================
  {
    eventName: "sales.quotation.created",
    description: "Triggered when a new quotation is created for a customer.",
    variables: ["quote.id", "quote.grandTotal", "customer.name", "quote.expiryDate"],
  },
  {
    eventName: "sales.invoice.created",
    description: "Triggered when a final invoice is generated (e.g., after a sale).",
    variables: ["invoice.invoiceId", "invoice.grandTotal", "customer.name", "invoice.url"],
  },
  {
    eventName: "sales.payment.received",
    description: "Triggered when a payment is successfully recorded against an invoice.",
    variables: ["invoice.invoiceId", "payment.amount", "customer.name", "invoice.balanceDue"],
  },
  {
    eventName: "sales.payment.reminder",
    description: "Triggered by a scheduled job for overdue invoices.",
    variables: ["invoice.invoiceId", "invoice.balanceDue", "customer.name", "invoice.dueDate"],
  },
  {
    eventName: "customer.created.welcome",
    description: "Triggered when a new customer record is created.",
    variables: ["customer.name", "branch.name", "coupon.code"],
  },

  // ====================================================================
  // Procurement & Supplier Module
  // ====================================================================
  {
    eventName: "procurement.po.sent",
    description: "Triggered when a new Purchase Order is sent to a supplier.",
    variables: ["po.poNumber", "supplier.name", "po.grandTotal"],
  },
  {
    eventName: "procurement.payment.made",
    description: "Triggered when a payment is made to a supplier.",
    variables: ["payment.amount", "supplier.name", "payment.reference"],
  },

  // ====================================================================
  // Inventory & Warehouse Module
  // ====================================================================
  {
    eventName: "inventory.stock.low_alert",
    description: "Triggered when a product variant's stock level drops below its reorder point.",
    variables: ["variant.name", "variant.sku", "branch.name", "stock.currentQuantity", "stock.reorderPoint"],
  },
  {
    eventName: "inventory.transfer.dispatched",
    description: "Triggered when a stock transfer is dispatched from the source branch.",
    variables: ["transfer.id", "sourceBranch.name", "destinationBranch.name"],
  },
  {
    eventName: "inventory.transfer.received",
    description: "Triggered when a stock transfer is marked as received by the destination branch.",
    variables: ["transfer.id", "sourceBranch.name", "destinationBranch.name"],
  },

  // ====================================================================
  // HR & Payroll Module (Internal Notifications)
  // ====================================================================
  {
    eventName: "hr.leave.request_submitted",
    description: "Triggered when an employee submits a new leave request (notifies manager).",
    variables: ["employee.name", "leave.type", "leave.startDate", "leave.endDate"],
  },
  {
    eventName: "hr.leave.status_changed",
    description: "Triggered when a manager approves or rejects a leave request (notifies employee).",
    variables: ["employee.name", "leave.status", "leave.type"],
  },
  {
    eventName: "hr.payslip.generated",
    description: "Triggered when a payroll run is completed (notifies employee).",
    variables: ["employee.name", "payslip.period", "payslip.netPay"],
  },
  // ====================================================================
  // ✅ NEW: Marketing & Promotions Events
  // ====================================================================
  {
    eventName: "marketing.new_offer",
    description: "Triggered manually by an admin to announce a new promotion or sale.",
    variables: ["tenant.companyName", "offer.title", "offer.details", "offer.url"],
  },
  {
    eventName: "customer.birthday_greeting",
    description: "Triggered by a scheduled job on a customer's birthday.",
    variables: ["customer.name", "tenant.companyName", "coupon.code"],
  },
  {
    eventName: "coupon.expiring_soon",
    description: "Triggered by a scheduled job for active, unused coupons that are about to expire.",
    variables: ["customer.name", "coupon.code", "coupon.expiryDate", "coupon.discount"],
  },
];

module.exports = notificationEvents;
