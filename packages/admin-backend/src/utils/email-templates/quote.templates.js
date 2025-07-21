const getQuoteApprovalTemplate = (customerName, quote, tenant) => {
  const subject = `Action Required: Your Repair Quotation #${quote.quoteNumber} is Ready`;

  // This URL must be constructed using the tenant's subdomain and the portal base URL from .env
  const portalUrl = `http://${tenant.subdomain}.localhost:5174/portal/quotes/${quote._id}`;

  const html = `
        <p>Hi ${customerName},</p>
        <p>Your quotation for repair ticket #${quote.repairTicketId.ticketNumber} is ready for your review and approval.</p>
        <p><strong>Total Amount: ${quote.grandTotal}</strong></p>
        <p>This quote is valid until ${new Date(quote.expiryDate).toLocaleDateString()}.</p>
        <p>Please review the details and approve the work by clicking the link below:</p>
        <p><a href="${portalUrl}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">View and Approve Quote</a></p>
        <p>Thank you,</p>
        <p>The iShopMaster Team</p>
    `;
  return { subject, html };
};
module.exports = { getQuoteApprovalTemplate };
