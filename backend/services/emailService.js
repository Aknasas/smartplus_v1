// backend/services/emailService.js
const nodemailer = require('nodemailer');
const emailTemplates = require('../utils/emailTemplates');

class EmailService {
  constructor() {
    // Configure your email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // Your password or app-specific password
      }
    });
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} userName - User's name
   * @param {string} resetToken - Password reset token
   */
  async sendPasswordResetEmail(to, userName, resetToken) {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const template = emailTemplates.passwordReset(userName, resetLink);

      const mailOptions = {
        from: `"Health Monitoring System" <${process.env.EMAIL_FROM || 'noreply@healthmonitor.com'}>`,
        to: to,
        subject: template.subject,
        html: template.html
      };

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          to,
          subject: template.subject,
          resetLink
        });
        return { success: true, preview: resetLink };
      }

      // In production, actually send the email
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {string} to - Recipient email
   * @param {string} userName - User's name
   */
  async sendWelcomeEmail(to, userName) {
    try {
      const loginLink = `${process.env.FRONTEND_URL}/login`;
      const template = emailTemplates.welcomeEmail(userName, loginLink);

      const mailOptions = {
        from: `"Health Monitoring System" <${process.env.EMAIL_FROM || 'welcome@healthmonitor.com'}>`,
        to: to,
        subject: template.subject,
        html: template.html
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Welcome email would be sent to:', to);
        return { success: true };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send health alert email
   * @param {string} to - Recipient email
   * @param {string} userName - User's name
   * @param {string} alertType - Type of alert
   * @param {object} metrics - Health metrics
   */
  async sendHealthAlert(to, userName, alertType, metrics) {
    try {
      const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
      const template = emailTemplates.healthAlert(userName, alertType, metrics, dashboardLink);

      const mailOptions = {
        from: `"Health Monitoring System" <${process.env.EMAIL_FROM || 'alerts@healthmonitor.com'}>`,
        to: to,
        subject: template.subject,
        html: template.html
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Health alert email would be sent to:', to);
        return { success: true };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Health alert email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending health alert:', error);
      throw error;
    }
  }

  /**
   * Send reminder email
   * @param {string} to - Recipient email
   * @param {string} userName - User's name
   * @param {string} reminderType - Type of reminder
   * @param {object} details - Reminder details
   */
  async sendReminder(to, userName, reminderType, details) {
    try {
      const template = emailTemplates.reminder(userName, reminderType, details);

      const mailOptions = {
        from: `"Health Monitoring System" <${process.env.EMAIL_FROM || 'reminders@healthmonitor.com'}>`,
        to: to,
        subject: template.subject,
        html: template.html
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Reminder email would be sent to:', to);
        return { success: true };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Reminder email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending reminder:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();