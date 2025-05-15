/**
 * Email Service
 * 
 * A service for sending transactional emails for various purposes.
 * This service uses a configurable email provider (defaults to Nodemailer with SMTP).
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  },
  from: process.env.EMAIL_FROM || 'FinDoc Analyzer <noreply@findoc-analyzer.com>'
};

// Create a reusable transporter object
let transporter;

// Initialize the email transporter
function initTransporter() {
  if (transporter) return;
  
  transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body
 * @param {string} options.from - Sender email (optional, uses default if not provided)
 * @param {Object} options.context - Additional context for templates
 * @returns {Promise<Object>} - Send info
 */
async function sendEmail(options) {
  try {
    // Initialize transporter if it doesn't exist
    initTransporter();
    
    // Prepare mail options
    const mailOptions = {
      from: options.from || emailConfig.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
}

/**
 * Send a feedback notification to administrators
 * @param {Object} feedback - The feedback object
 * @param {Array<string>} adminEmails - List of admin emails
 * @returns {Promise<Object>} - Send info
 */
async function sendFeedbackNotification(feedback, adminEmails) {
  const subject = `New Feedback: ${feedback.subject}`;
  
  const text = `
New feedback has been submitted:

Type: ${feedback.type}
Subject: ${feedback.subject}
${feedback.rating ? `Rating: ${feedback.rating}/5` : ''}
Status: ${feedback.status}
Submitted: ${new Date(feedback.created_at).toLocaleString()}

Content:
${feedback.content}

View in admin dashboard: ${process.env.APP_URL}/admin/feedback
`;

  const html = `
<h2>New Feedback Submitted</h2>
<p><strong>Type:</strong> ${feedback.type}</p>
<p><strong>Subject:</strong> ${feedback.subject}</p>
${feedback.rating ? `<p><strong>Rating:</strong> ${feedback.rating}/5</p>` : ''}
<p><strong>Status:</strong> <span style="color: ${
    feedback.status === 'pending' ? '#f6ad55' : 
    feedback.status === 'in_progress' ? '#4299e1' : 
    feedback.status === 'resolved' ? '#48bb78' : 
    feedback.status === 'rejected' ? '#f56565' : '#718096'
  };">${feedback.status}</span></p>
<p><strong>Submitted:</strong> ${new Date(feedback.created_at).toLocaleString()}</p>

<h3>Content:</h3>
<div style="padding: 15px; border-left: 4px solid #e2e8f0; margin-bottom: 20px;">
  <p>${feedback.content.replace(/\n/g, '<br>')}</p>
</div>

<p><a href="${process.env.APP_URL}/admin/feedback" style="display: inline-block; padding: 10px 20px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a></p>
`;

  return sendEmail({
    to: adminEmails.join(', '),
    subject,
    text,
    html
  });
}

/**
 * Send a feedback response notification to the user
 * @param {Object} feedback - The feedback object
 * @param {Object} response - The response object
 * @param {string} userEmail - The user's email
 * @returns {Promise<Object>} - Send info
 */
async function sendFeedbackResponseNotification(feedback, response, userEmail) {
  if (!userEmail) {
    logger.warn('No user email provided for feedback response notification');
    return null;
  }
  
  const subject = `Response to your feedback: ${feedback.subject}`;
  
  const text = `
Dear User,

We've responded to your feedback: "${feedback.subject}".

Response:
${response.content}

You can view the full conversation in the app.

Thank you for your feedback!
The FinDoc Analyzer Team
`;

  const html = `
<h2>We've Responded to Your Feedback</h2>
<p>Dear User,</p>
<p>We've responded to your feedback: <strong>"${feedback.subject}"</strong>.</p>

<h3>Our Response:</h3>
<div style="padding: 15px; border-left: 4px solid #4299e1; margin-bottom: 20px; background-color: #ebf8ff;">
  <p>${response.content.replace(/\n/g, '<br>')}</p>
</div>

<p>You can view the full conversation in the app.</p>

<p><a href="${process.env.APP_URL}/feedback" style="display: inline-block; padding: 10px 20px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 5px;">View Your Feedback</a></p>

<p>Thank you for your feedback!</p>
<p>The FinDoc Analyzer Team</p>
`;

  return sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
}

/**
 * Send a feedback status update notification to the user
 * @param {Object} feedback - The updated feedback object
 * @param {string} userEmail - The user's email
 * @returns {Promise<Object>} - Send info
 */
async function sendFeedbackStatusUpdateNotification(feedback, userEmail) {
  if (!userEmail) {
    logger.warn('No user email provided for feedback status update notification');
    return null;
  }
  
  const subject = `Update on your feedback: ${feedback.subject}`;
  
  const statusText = 
    feedback.status === 'in_progress' ? 'being reviewed' :
    feedback.status === 'resolved' ? 'resolved' :
    feedback.status === 'rejected' ? 'closed' :
    feedback.status;
  
  const text = `
Dear User,

The status of your feedback "${feedback.subject}" has been updated to ${statusText}.

${feedback.admin_notes ? `Admin Notes: ${feedback.admin_notes}` : ''}

You can view the details in the app.

Thank you for your feedback!
The FinDoc Analyzer Team
`;

  const html = `
<h2>Your Feedback Status Has Been Updated</h2>
<p>Dear User,</p>
<p>The status of your feedback <strong>"${feedback.subject}"</strong> has been updated to <strong>${statusText}</strong>.</p>

${feedback.admin_notes ? `
<h3>Admin Notes:</h3>
<div style="padding: 15px; border-left: 4px solid #e2e8f0; margin-bottom: 20px; background-color: #f7fafc;">
  <p>${feedback.admin_notes.replace(/\n/g, '<br>')}</p>
</div>
` : ''}

<p>You can view the details in the app.</p>

<p><a href="${process.env.APP_URL}/feedback" style="display: inline-block; padding: 10px 20px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 5px;">View Your Feedback</a></p>

<p>Thank you for your feedback!</p>
<p>The FinDoc Analyzer Team</p>
`;

  return sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
}

// Export methods
module.exports = {
  sendEmail,
  sendFeedbackNotification,
  sendFeedbackResponseNotification,
  sendFeedbackStatusUpdateNotification
};