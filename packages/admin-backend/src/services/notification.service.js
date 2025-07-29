const nodemailer = require("nodemailer")
require("dotenv").config() // Ensure .env is loaded here if it's not already
const handlebars = require("handlebars")
class NotificationService {
  constructor() {
    // Create a reusable transporter object using the SMTP transport

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  /**
   * The main public method to trigger a notification based on an event.
   * @param {object} models - The tenant's compiled models.
   * @param {string} eventName - The namespaced event, e.g., 'repair.status_changed'.
   * @param {object} context - The data payload related to the event (e.g., the ticket object).
   */
  async triggerNotification(models, eventName, context) {
    const { NotificationTemplate } = models
    const templates = await NotificationTemplate.find({ eventName, isActive: true })

    for (const template of templates) {
      const recipient = this._getRecipient(template.recipientType, context)
      if (!recipient || (!recipient.email && !recipient.phone)) {
        console.warn(`No recipient found for template ${template.name}`)
        continue
      }

      const renderedSubject = handlebars.compile(template.subject || "")(context)
      const renderedBody = handlebars.compile(template.body)(context)

      if (template.channel === "email" && recipient.email) {
        await this._sendEmail({
          to: recipient.email,
          subject: renderedSubject,
          html: renderedBody,
          attachments: context.attachment ? [context.atachment] : [],
        })
      } else if (template.channel === "sms" && recipient.phone) {
        // SMS sending logic would be implemented here using a gateway like Twilio
        console.log(`[SMS Stub] To: ${recipient.phone}, Body: ${renderedBody}`)
      }
    }
  }

  /**
   * Determines the correct recipient object based on the template's target.
   * @private
   */
  _getRecipient(recipientType, context) {
    switch (recipientType) {
      case "customer":
        return context.ticket?.customerId
      case "assigned_technician":
        return context.ticket?.assignedTo
      // Add other roles like 'branch_manager' here in the future
      default:
        return null
    }
  }

  /**
   * Private helper to send an email.
   * @private
   */
  async _sendEmail({ to, subject, attachments = [] }) {
    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        content: att.content, // This should be a buffer
        contentType: "application/pdf",
      })),
    })
    console.log(`Email sent for event. Message ID: ${info.messageId}`)
    return info
  }

  /**
   * Sends an email.
   * @param {object} mailOptions - { to, subject, html }
   */
  async sendEmail({ to, subject, html }) {
    if (!to || !subject || !html) {
      throw new Error("To, subject, and html are required for sending email.")
    }

    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })

    console.log("Message sent: %s", info.messageId)
    return info
  }
}

module.exports = new NotificationService()
