/**
 * The definitive, complete master list of default notification templates for the iShopMaster ERP.
 * This is a "batteries-included" library that is seeded for every new tenant,
 * providing a professional, brand-aware communication suite out of the box.
 */
const defaultNotificationTemplates = [
  // ====================================================================
  // Marketing & CRM Module
  // ====================================================================
  {
    name: "Customer - Welcome & Discount Offer",
    eventName: "customer.created.welcome",
    channel: "email",
    recipientType: "customer",
    subject: "Welcome to {{tenant.companyName}}! Here's a Gift For You.",
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{tenant.companyName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 20px 0; border: 1px solid #dddddd; border-radius: 5px;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 20px 0; border-bottom: 1px solid #dddddd;">
                            <img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width: 150px; margin-bottom: 10px;">
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 30px 20px;">
                            <h1 style="font-size: 24px; color: #333333;">Welcome, {{customer.name}}!</h1>
                            <p>Thank you for joining us! We're thrilled to have you as a customer at <strong>{{tenant.companyName}}</strong>.</p>
                            <p>As a special welcome gift, please enjoy a discount on your next purchase with this unique code:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; border: 1px dashed #cccccc; padding: 10px 20px; color: #007bff;">{{coupon.code}}</span>
                            </div>
                            <p>We look forward to serving you!</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 20px; border-top: 1px solid #dddddd; font-size: 12px; color: #888888;">
                            <p style="margin: 0;"><strong>{{tenant.companyName}}</strong></p>
                            <p style="margin: 0;">{{tenant.companyProfile.address.street}}, {{tenant.companyProfile.address.city}}</p>
                            <p style="margin: 0;">Phone: {{tenant.companyProfile.phone}} | Email: {{tenant.companyProfile.email}}</p>
                            <p style="margin: 10px 0 0;">
                                <a href="{{tenant.companyProfile.socialHandles.facebook}}" style="color: #007bff; text-decoration: none;">Facebook</a> |
                                <a href="{{tenant.companyProfile.socialHandles.x_twitter}}" style="color: #007bff; text-decoration: none;">Twitter</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
    isActive: true,
  },
  {
    name: "Marketing - New Promotion Announcement",
    eventName: "marketing.new_offer",
    channel: "email",
    recipientType: "customer",
    subject: "🎉 Special Offer from {{tenant.companyName}}: {{offer.title}}!",
    body: `
<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;margin:20px 0;border:1px solid #ddd;border-radius:5px;"><tr><td align="center" style="padding:20px 0;border-bottom:1px solid #ddd;"><img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width:150px;margin-bottom:10px;"></td></tr><tr><td style="padding:30px 20px;"><h1 style="font-size:24px;color:#333;">Hi {{customer.name}},</h1><p>Don't miss out on our latest promotion: <strong>{{offer.title}}</strong>!</p><p>{{offer.details}}</p><div style="text-align:center;margin:30px 0;"><a href="{{offer.url}}" style="background-color:#28a745;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;">Learn More & Shop Now</a></div><p>This offer is for a limited time only. We hope to see you soon!</p></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #ddd;font-size:12px;color:#888;"><p style="margin:0;"><strong>{{tenant.companyName}}</strong></p><p style="margin:0;">{{tenant.companyProfile.address.street}}, {{tenant.companyProfile.address.city}}</p><p style="margin:0;">Phone: {{tenant.companyProfile.phone}} | Email: {{tenant.companyProfile.email}}</p><p style="margin:10px 0 0;"><a href="{{tenant.companyProfile.socialHandles.facebook}}" style="color:#007bff;text-decoration:none;">Facebook</a> | <a href="{{tenant.companyProfile.socialHandles.x_twitter}}" style="color:#007bff;text-decoration:none;">Twitter</a></p></td></tr></table></td></tr></table></body></html>`,
    isActive: true,
  },
  {
    name: "Customer - Birthday Greeting & Coupon",
    eventName: "customer.birthday_greeting",
    channel: "sms",
    recipientType: "customer",
    body: `Happy Birthday, {{customer.name}}! To celebrate, here is a special discount code just for you: {{coupon.code}}. We hope you have a great day! - {{tenant.companyName}}`,
    isActive: true,
  },
  {
    name: "Customer - Coupon Expiration Reminder",
    eventName: "coupon.expiring_soon",
    channel: "email",
    recipientType: "customer",
    subject: "Don't Miss Out! Your Discount Coupon is Expiring Soon",
    body: `
<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;margin:20px 0;border:1px solid #ddd;border-radius:5px;"><tr><td align="center" style="padding:20px 0;border-bottom:1px solid #ddd;"><img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width:150px;margin-bottom:10px;"></td></tr><tr><td style="padding:30px 20px;"><h1 style="font-size:24px;color:#333;">Hi {{customer.name}},</h1><p>This is a friendly reminder that your discount coupon <strong>{{coupon.code}}</strong> ({{coupon.discount}}) is expiring on <strong>{{coupon.expiryDate}}</strong>.</p><p>Don't let it go to waste! Visit us in-store or online to use it on your next purchase.</p></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #ddd;font-size:12px;color:#888;"><p style="margin:0;"><strong>{{tenant.companyName}}</strong></p><p style="margin:0;">{{tenant.companyProfile.address.street}}, {{tenant.companyProfile.address.city}}</p><p style="margin:0;">Phone: {{tenant.companyProfile.phone}} | Email: {{tenant.companyProfile.email}}</p><p style="margin:10px 0 0;"><a href="{{tenant.companyProfile.socialHandles.facebook}}" style="color:#007bff;text-decoration:none;">Facebook</a> | <a href="{{tenant.companyProfile.socialHandles.x_twitter}}" style="color:#007bff;text-decoration:none;">Twitter</a></p></td></tr></table></td></tr></table></body></html>`,
    isActive: true,
  },

  // ====================================================================
  // Sales & CRM Module
  // ====================================================================
  {
    name: "Customer - Quotation Ready",
    eventName: "sales.quotation.created",
    channel: "email",
    recipientType: "customer",
    subject: "Your Quotation #{{quote.id}} from {{tenant.companyName}}",
    body: `
<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;margin:20px 0;border:1px solid #ddd;border-radius:5px;"><tr><td align="center" style="padding:20px 0;border-bottom:1px solid #ddd;"><img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width:150px;margin-bottom:10px;"></td></tr><tr><td style="padding:30px 20px;"><h1 style="font-size:24px;color:#333;">Quotation #{{quote.id}}</h1><p>Hi {{customer.name}},</p><p>As requested, here is your quotation for a total of <strong>{{quote.grandTotal}}</strong>. This quote is valid until {{quote.expiryDate}}.</p><p>You can view the full details online by clicking the link below:</p><div style="text-align:center;margin:30px 0;"><a href="{{quote.url}}" style="background-color:#007bff;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;">View Quotation</a></div><p>Thank you!</p></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #ddd;font-size:12px;color:#888;"><p style="margin:0;"><strong>{{tenant.companyName}}</strong></p><p style="margin:0;">{{tenant.companyProfile.address.street}}, {{tenant.companyProfile.address.city}}</p><p style="margin:0;">Phone: {{tenant.companyProfile.phone}} | Email: {{tenant.companyProfile.email}}</p><p style="margin:10px 0 0;"><a href="{{tenant.companyProfile.socialHandles.facebook}}" style="color:#007bff;text-decoration:none;">Facebook</a> | <a href="{{tenant.companyProfile.socialHandles.x_twitter}}" style="color:#007bff;text-decoration:none;">Twitter</a></p></td></tr></table></td></tr></table></body></html>`,
    isActive: true,
  },
  {
    name: "Customer - Final Invoice",
    eventName: "sales.invoice.created",
    channel: "email",
    recipientType: "customer",
    subject: "Your Invoice #{{invoice.invoiceId}} from {{tenant.companyName}}",
    body: `
<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;margin:20px 0;border:1px solid #ddd;border-radius:5px;"><tr><td align="center" style="padding:20px 0;border-bottom:1px solid #ddd;"><img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width:150px;margin-bottom:10px;"></td></tr><tr><td style="padding:30px 20px;"><h1 style="font-size:24px;color:#333;">Invoice #{{invoice.invoiceId}}</h1><p>Hi {{customer.name}},</p><p>Thank you for your business. Your invoice for <strong>{{invoice.grandTotal}}</strong> is attached. You can also view it online using the link below.</p><div style="text-align:center;margin:30px 0;"><a href="{{invoice.url}}" style="background-color:#17a2b8;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;">View Invoice</a></div></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #ddd;font-size:12px;color:#888;"><p style="margin:0;"><strong>{{tenant.companyName}}</strong></p><p style="margin:0;">{{tenant.companyProfile.address.street}}, {{tenant.companyProfile.address.city}}</p><p style="margin:0;">Phone: {{tenant.companyProfile.phone}} | Email: {{tenant.companyProfile.email}}</p><p style="margin:10px 0 0;"><a href="{{tenant.companyProfile.socialHandles.facebook}}" style="color:#007bff;text-decoration:none;">Facebook</a> | <a href="{{tenant.companyProfile.socialHandles.x_twitter}}" style="color:#007bff;text-decoration:none;">Twitter</a></p></td></tr></table></td></tr></table></body></html>`,
    isActive: true,
  },
  {
    name: "Customer - Payment Received Confirmation",
    eventName: "sales.payment.received",
    channel: "sms",
    recipientType: "customer",
    body: `Thank you, {{customer.name}}. We have received your payment of {{payment.amount}} for invoice #{{invoice.invoiceId}}. Your new balance is {{invoice.balanceDue}}. - {{tenant.companyName}}`,
    isActive: true,
  },

  // ====================================================================
  // Service & Repair Module
  // ====================================================================
  {
    name: "Customer - Repair Ready for Pickup",
    eventName: "repair.status_changed.pickup_pending",
    channel: "sms",
    recipientType: "customer",
    body: `Hi {{customer.name}}, your repair for ticket #{{ticket.ticketId}} is complete and ready for pickup at our {{branch.name}} branch. The final amount due is {{invoice.grandTotal}}. Thank you, {{tenant.companyName}}.`,
    isActive: true,
  },
  {
    name: "Technician - New Job Assignment",
    eventName: "repair.technician.assigned",
    channel: "email",
    recipientType: "assigned_technician",
    subject: "New Job Assigned to You: Ticket #{{ticket.ticketId}}",
    body: `
<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;margin:20px 0;border:1px solid #ddd;border-radius:5px;"><tr><td align="center" style="padding:20px 0;border-bottom:1px solid #ddd;"><img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width:150px;margin-bottom:10px;"></td></tr><tr><td style="padding:30px 20px;"><h1 style="font-size:24px;color:#333;">New Job: #{{ticket.ticketId}}</h1><p>Hi {{technician.name}},</p><p>You have been assigned a new repair ticket <strong>#{{ticket.ticketId}}</strong> for customer <strong>{{customer.name}}</strong>.</p><p>Please review the details in your technician dashboard.</p></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #ddd;font-size:12px;color:#888;"><p style="margin:0;">This is an automated notification from <strong>{{tenant.companyName}}</strong>.</p></td></tr></table></td></tr></table></body></html>`,
    isActive: false,
  },

  // ====================================================================
  // HR & Payroll Module (Internal)
  // ====================================================================
  {
    name: "Employee - Payslip Generated",
    eventName: "hr.payslip.generated",
    channel: "email",
    recipientType: "employee",
    subject: "Your Payslip for {{payslip.period}} is Ready",
    body: `
<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;margin:20px 0;border:1px solid #ddd;border-radius:5px;"><tr><td align="center" style="padding:20px 0;border-bottom:1px solid #ddd;"><img src="{{tenant.companyProfile.logoUrl}}" alt="{{tenant.companyName}} Logo" style="max-width:150px;margin-bottom:10px;"></td></tr><tr><td style="padding:30px 20px;"><h1 style="font-size:24px;color:#333;">Payslip Ready</h1><p>Hi {{employee.name}},</p><p>Your payslip for the period <strong>{{payslip.period}}</strong> has been generated. Your net pay is <strong>{{payslip.netPay}}</strong>.</p><p>You can view the full details in the employee self-service portal.</p></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #ddd;font-size:12px;color:#888;"><p style="margin:0;">This is an automated notification from <strong>{{tenant.companyName}}</strong>.</p></td></tr></table></td></tr></table></body></html>`,
    isActive: true,
  },
];

module.exports = defaultNotificationTemplates;
