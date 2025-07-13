const mongoose = require("mongoose");
const notificationService = require("./notification.service");
const { getOverdueInvoiceReminderTemplate } = require("../utils/email-templates/dunning.templates");

class DunningService {
  /**
   * Finds all overdue invoices and sends reminder emails to customers.
   */
  async sendReminders(models) {
    const { SalesInvoice, Customer } = models;
    const today = new Date();

    const overdueInvoices = await SalesInvoice.find({
      status: { $in: ["partially_paid", "unpaid"] },
      dueDate: { $lt: today }, // Assuming SalesInvoice has a dueDate field
    }).populate("customerId");

    if (overdueInvoices.length === 0) {
      console.log("Dunning Service: No overdue invoices found.");
      return;
    }

    // Group invoices by customer
    const invoicesByCustomer = overdueInvoices.reduce((acc, inv) => {
      const customerId = inv.customerId._id.toString();
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: inv.customerId,
          invoices: [],
        };
      }
      acc[customerId].invoices.push(inv);
      return acc;
    }, {});

    // Send one email per customer with all their overdue invoices
    for (const customerId in invoicesByCustomer) {
      const { customer, invoices } = invoicesByCustomer[customerId];
      if (customer && customer.email) {
        const emailTemplate = getOverdueInvoiceReminderTemplate(customer.name, invoices);
        try {
          await notificationService.sendEmail({
            to: customer.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
          // Update the customer's dunning status
          await Customer.findByIdAndUpdate(customerId, { dunningStatus: "first_reminder" });
          console.log(`Dunning email sent to ${customer.name}`);
        } catch (error) {
          console.error(`Failed to send dunning email to ${customer.email}:`, error);
        }
      }
    }
  }
}

module.exports = new DunningService();
