// backend/utils/emailTemplates.js

/**
 * Email Templates for different scenarios
 * Each template returns an object with subject and HTML body
 */

const emailTemplates = {
  /**
   * Password Reset Email Template
   * @param {string} userName - User's first name or full name
   * @param {string} resetLink - Password reset link with token
   * @param {string} expiryTime - Token expiry time (default: 1 hour)
   */
  passwordReset: (userName, resetLink, expiryTime = '1 hour') => ({
    subject: 'Reset Your Password - Health Monitoring System',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
          .warning {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 20px;
            padding: 10px;
            background: #fde8e8;
            border-radius: 5px;
          }
          .link-text {
            word-break: break-all;
            color: #667eea;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your password for your Health Monitoring System account. 
            If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Your Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p class="link-text">${resetLink}</p>
            
            <div class="warning">
              ⚠️ This link will expire in <strong>${expiryTime}</strong>. 
              If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </div>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>Never share this link with anyone</li>
              <li>Choose a strong password that you don't use elsewhere</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
            
            <p>Best regards,<br>
            <strong>Health Monitoring System Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Health Monitoring System. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  /**
   * Welcome Email Template for new users
   * @param {string} userName - User's first name
   * @param {string} loginLink - Link to login page
   */
  welcomeEmail: (userName, loginLink) => ({
    subject: 'Welcome to Health Monitoring System!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Health Monitoring System</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .feature-box {
            background: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Welcome to Health Monitoring System!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <p>Thank you for joining the Health Monitoring System! We're excited to have you on board.</p>
            
            <div class="feature-box">
              <h3>🎯 What you can do:</h3>
              <ul>
                <li>Track your vital signs in real-time</li>
                <li>Set health goals and monitor progress</li>
                <li>Receive alerts for abnormal readings</li>
                <li>Share data with your healthcare providers</li>
                <li>Set medication and appointment reminders</li>
              </ul>
            </div>
            
            <p>To get started, click the button below to log in:</p>
            
            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Log In to Your Account</a>
            </div>
            
            <p><strong>Quick Tips:</strong></p>
            <ul>
              <li>Complete your profile for personalized experience</li>
              <li>Add emergency contacts for safety</li>
              <li>Set up your health targets</li>
              <li>Download our mobile app for on-the-go tracking</li>
            </ul>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>The Health Monitoring System Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Health Monitoring System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  /**
   * Health Alert Email Template
   * @param {string} userName - User's name
   * @param {string} alertType - Type of alert (high heart rate, low SpO2, etc.)
   * @param {object} metrics - Health metrics details
   * @param {string} dashboardLink - Link to view details
   */
  healthAlert: (userName, alertType, metrics, dashboardLink) => ({
    subject: `⚠️ Health Alert: ${alertType} Detected`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health Alert Notification</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .alert-box {
            background: #fde8e8;
            border: 2px solid #e74c3c;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .metric {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #e74c3c;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #e74c3c;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Health Alert</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <div class="alert-box">
              <h3 style="color: #e74c3c; margin-top: 0;">${alertType}</h3>
              <p>Our system has detected an abnormal reading that requires your attention.</p>
            </div>
            
            <h3>📊 Current Reading:</h3>
            <div class="metric">
              <p><strong>Metric:</strong> ${metrics.type}</p>
              <p><strong>Value:</strong> ${metrics.value} ${metrics.unit}</p>
              <p><strong>Time:</strong> ${metrics.time}</p>
              <p><strong>Normal Range:</strong> ${metrics.normalRange}</p>
            </div>
            
            <p><strong>Recommended Actions:</strong></p>
            <ul>
              <li>Take another measurement in 5-10 minutes</li>
              <li>Rest and stay calm</li>
              <li>Contact your healthcare provider if symptoms persist</li>
              <li>In case of emergency, call emergency services immediately</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${dashboardLink}" class="button">View Detailed Report</a>
            </div>
            
            <p>Stay safe,<br>
            <strong>Health Monitoring System</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Health Monitoring System</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  /**
   * Reminder Email Template
   * @param {string} userName - User's name
   * @param {string} reminderType - Type of reminder (medication, appointment, etc.)
   * @param {object} details - Reminder details
   */
  reminder: (userName, reminderType, details) => ({
    subject: `⏰ Reminder: ${reminderType}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder Notification</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .reminder-box {
            background: #e8f4fd;
            border: 2px solid #3498db;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Friendly Reminder</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <div class="reminder-box">
              <h3 style="color: #3498db;">${reminderType}</h3>
              <p><strong>${details.message}</strong></p>
              <p>⏱️ Time: ${details.time}</p>
              ${details.notes ? `<p>📝 Notes: ${details.notes}</p>` : ''}
            </div>
            
            <p>Stay healthy!<br>
            <strong>Health Monitoring System</strong></p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

module.exports = emailTemplates;