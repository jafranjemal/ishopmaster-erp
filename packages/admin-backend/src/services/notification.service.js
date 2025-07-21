const nodemailer = require("nodemailer");
require("dotenv").config(); // Ensure .env is loaded here if it's not already

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
    });
  }

  /**
   * Sends an email.
   * @param {object} mailOptions - { to, subject, html }
   */
  async sendEmail({ to, subject, html }) {
    if (!to || !subject || !html) {
      throw new Error("To, subject, and html are required for sending email.");
    }

    console.log("SMTP config", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });

    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  }
}

module.exports = new NotificationService();
