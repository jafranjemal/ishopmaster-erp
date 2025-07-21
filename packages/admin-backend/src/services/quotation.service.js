const mongoose = require("mongoose");
const { getQuoteApprovalTemplate } = require("../utils/email-templates/quote.templates");
const notificationService = require("./notification.service");
const serviceCostingService = require("./serviceCosting.service");

class QuotationService {
  async generateQuoteFromTicket(models, { ticketId, userId, terms, expiryDays = 7 }, session) {
    const { RepairTicket, RepairQuote } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    const calculatedQuote = await serviceCostingService.calculateQuoteTotals(models, { ticket });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const lastQuote = await RepairQuote.findOne({ repairTicketId: ticketId }).sort({ version: -1 }).session(session);
    const newVersion = lastQuote ? lastQuote.version + 1 : 1;
    const quoteNumber = `${ticket.ticketNumber}-Q${newVersion}`;
    if (lastQuote) {
      console.log("lastQuote  status: superseded", lastQuote);
      await RepairQuote.updateMany(
        { repairTicketId: ticketId, status: "pending_approval" },
        { $set: { status: "superseded" } },
        { session }
      );
    }

    const [newQuote] = await RepairQuote.create(
      [
        {
          repairTicketId: ticketId,
          version: newVersion,
          quoteNumber: quoteNumber, // Use the generated number
          ...calculatedQuote,
          termsAndConditions: terms,
          expiryDate,
          status: "pending_approval",
          createdBy: userId,
        },
      ],
      { session }
    );

    console.log("ticket ", ticket.status);

    // Only update status if transitioning from diagnosing
    if (ticket.status === "diagnosing") {
      ticket.status = "quote_pending";
    } else {
      console.log(`Ticket already in ${ticket.status} state. No status change needed.`);
    }

    await ticket.save({ session });

    return newQuote;
  }

  async approveQuote(models, { quoteId, signature }, session) {
    const { RepairQuote, RepairTicket } = models;
    const quote = await RepairQuote.findById(quoteId).session(session);
    if (!quote || quote.status !== "pending_approval") {
      throw new Error("Quote not found or cannot be approved.");
    }

    quote.status = "approved";
    quote.customerSignature = signature;
    quote.approvedAt = new Date();

    const ticket = await RepairTicket.findById(quote.repairTicketId).session(session);
    // Logic to check if parts are available, then move to 'in_progress' or 'awaiting_parts'
    ticket.status = "repair_active";

    await Promise.all([quote.save({ session }), ticket.save({ session })]);
    return quote;
  }

  /**
   * Sends the quote to the customer and moves the ticket to 'approval_pending'.
   */
  async sendQuoteToCustomer(models, { quoteId, tenant }, session) {
    const { RepairQuote, RepairTicket } = models;
    const quote = await RepairQuote.findById(quoteId)
      .populate({
        path: "repairTicketId",
        populate: { path: "customerId" },
      })
      .session(session);

    if (!quote) throw new Error("Quotation not found.");
    const ticket = quote.repairTicketId;
    const customer = ticket.customerId;
    if (!customer || !customer.email) throw new Error("Customer email not found.");

    //const portalBaseUrl = process.env.FRONTEND_PORTAL_BASE_URL.replace("://", `://${tenant.subdomain}.`);
    const portalBaseUrl = process.env.FRONTEND_PORTAL_BASE_URL;
    const quoteUrl = `${portalBaseUrl}/portal/quotes/${quote._id}`;
    console.log("sendQuoteToCustomer => quoteUrl ", quoteUrl);

    const emailTemplate = getQuoteApprovalTemplate(customer.name, quote, tenant);

    await notificationService.sendEmail({
      to: customer.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    quote.status = "pending_approval";
    ticket.status = "approval_pending";
    await Promise.all([quote.save({ session }), ticket.save({ session })]);

    return { message: `Quote sent successfully to ${customer.email}` };
  }
}
module.exports = new QuotationService();
