const getOverdueInvoiceReminderTemplate = (customerName, invoices) => {
  const subject = `Payment Reminder: You have overdue invoices`;

  let invoiceListHtml = "<ul>";
  invoices.forEach((inv) => {
    invoiceListHtml += `<li>Invoice #${inv.invoiceId} - Due: ${new Date(inv.dueDate).toLocaleDateString()} - Amount: ${inv.totalAmount}</li>`;
  });
  invoiceListHtml += "</ul>";

  const html = `
        <p>Hi ${customerName},</p>
        <p>This is a friendly reminder that the following invoices are past their due date:</p>
        ${invoiceListHtml}
        <p>Please arrange for payment at your earliest convenience.</p>
        <p>Thank you,</p>
        <p>The iShopMaster Team</p>
    `;

  return { subject, html };
};

module.exports = { getOverdueInvoiceReminderTemplate };
