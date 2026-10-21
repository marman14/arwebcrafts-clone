// Hostinger SMTP Notification Dispatcher for AR Webcrafts LLC
// Directly authenticates with Hostinger Outgoing Mail Server (smtp.hostinger.com)
// Strictly delivers lead notifications to contact@arwebcrafts.com

'use strict';

const nodemailer = require('nodemailer');

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'contact@arwebcrafts.com';
const SMTP_USER = process.env.SMTP_USER || 'contact@arwebcrafts.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_PORT === '587' ? false : true;

function getTransporter() {
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 15000
  });
}

/**
 * Normalizes raw service / interest strings into short, clean descriptors for the subject line.
 * E.g., "Scale Teams & Speed Delivery with Staff Augmentation" -> "Staff Augmentation"
 */
function formatCleanService(rawService) {
  if (!rawService) return 'General Inquiry';
  const s = String(rawService).trim();

  if (/staff augmentation/i.test(s)) return 'Staff Augmentation';
  if (/woocommerce/i.test(s)) return 'WooCommerce Custom Development';
  if (/plugin/i.test(s)) return 'WordPress Plugin Development';
  if (/learndash/i.test(s)) return 'LearnDash Customization';
  if (/speed|optimization|core web/i.test(s)) return 'Speed Optimization';
  if (/maintenance/i.test(s)) return 'WordPress Maintenance';
  if (/api|cloud|integration/i.test(s)) return 'API & Integrations';
  if (/newsletter/i.test(s)) return 'Newsletter Subscription';
  if (/saas|web app/i.test(s)) return 'SaaS & Web App Solutions';
  if (/hire/i.test(s)) return 'Dedicated Developer';

  // Clean up any pipe, colon, or dashes if raw string has long SEO suffixes
  const clean = s.split(/[|:-]/)[0].trim();
  return clean.length <= 40 ? clean : clean.substring(0, 40).trim();
}

function buildHtmlTemplate(lead) {
  const name = lead.name || 'Anonymous Inquiry';
  const email = lead.email || 'Not provided';
  const phone = lead.phone || 'Not provided';
  const company = lead.company || 'Not provided';
  const service = lead.service || 'General Inquiry';
  const budget = lead.budget || 'Not specified';
  const message = (lead.message || 'No additional message provided').replace(/\n/g, '<br>');
  const pageUrl = lead.pageUrl || '/';
  const timestamp = lead.timestamp || new Date().toISOString();

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #071527; margin: 0; padding: 24px; color: #E2E8F0; }
      .container { max-width: 600px; margin: 0 auto; background: #0A192F; border: 1px solid rgba(200, 157, 75, 0.35); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #011B39 0%, #071527 100%); padding: 24px; border-bottom: 2px solid #C89D4B; text-align: center; }
      .header h1 { margin: 0 0 6px 0; font-size: 20px; color: #FFFFFF; letter-spacing: 0.5px; }
      .header p { margin: 0; font-size: 13px; color: #C89D4B; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
      .content { padding: 24px; }
      .lead-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
      td.label { width: 34%; font-weight: 600; color: #94A3B8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
      td.value { color: #FFFFFF; font-size: 14px; }
      td.value a { color: #00E5FF; text-decoration: none; font-weight: 600; }
      .message-box { background: rgba(1, 27, 57, 0.6); border-left: 3px solid #C89D4B; padding: 14px 18px; border-radius: 4px; margin: 16px 0; color: #F1F5F9; font-size: 14px; line-height: 1.6; }
      .footer { background: #011427; padding: 18px 24px; text-align: center; font-size: 13px; color: #94A3B8; border-top: 1px solid rgba(255, 255, 255, 0.08); }
      .badge { display: inline-block; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ADE80; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Website Inquiry</h1>
        <p>AR Webcrafts LLC Lead Notification</p>
      </div>
      <div class="content">
        <div style="margin-bottom: 16px; text-align: right;">
          <span class="badge">&#10004; Verified Submission</span>
        </div>
        <div class="lead-card">
          <table>
            <tr>
              <td class="label">Client Name</td>
              <td class="value"><strong>${name}</strong></td>
            </tr>
            <tr>
              <td class="label">Email Address</td>
              <td class="value"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td class="label">Phone</td>
              <td class="value">${phone !== 'Not provided' ? `<a href="tel:${phone}">${phone}</a>` : phone}</td>
            </tr>
            <tr>
              <td class="label">Company / Agency</td>
              <td class="value">${company}</td>
            </tr>
            <tr>
              <td class="label">Service / Interest</td>
              <td class="value"><span style="color:#C89D4B; font-weight:600;">${service}</span></td>
            </tr>
            <tr>
              <td class="label">Budget Range</td>
              <td class="value">${budget}</td>
            </tr>
            <tr>
              <td class="label">Source Page</td>
              <td class="value">${pageUrl}</td>
            </tr>
            <tr>
              <td class="label">Timestamp</td>
              <td class="value">${timestamp}</td>
            </tr>
          </table>
        </div>

        <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">
          Project Details / Client Message:
        </div>
        <div class="message-box">
          ${message}
        </div>
      </div>
      <div class="footer">
        &copy; AR Webcrafts LLC. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

async function sendEmailNotification(lead) {
  const clientName = (lead.name || 'Anonymous').trim();
  const serviceInterest = formatCleanService(lead.service);
  const subject = `New Lead: ${clientName} - ${serviceInterest}`;
  const htmlBody = buildHtmlTemplate(lead);

  const transporter = getTransporter();

  // Primary Path: Direct Hostinger SMTP via Nodemailer
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"AR Webcrafts Website" <${SMTP_USER}>`,
        to: NOTIFICATION_EMAIL,
        replyTo: lead.email,
        subject: subject,
        html: htmlBody
      });

      console.log(`[Hostinger SMTP Success] Message sent to ${NOTIFICATION_EMAIL}. MessageId: ${info.messageId}`);
      return { sent: true, method: 'hostinger_smtp', recipient: NOTIFICATION_EMAIL, messageId: info.messageId };
    } catch (smtpErr) {
      console.error(`[Hostinger SMTP Error] Failed: ${smtpErr.message}. Attempting fallback gateway...`);
    }
  } else {
    console.warn('[Hostinger SMTP Notice] SMTP_PASS environment variable is not yet configured. Using fallback gateway.');
  }

  // Backup Path: FormSubmit AJAX API so no leads are lost while SMTP_PASS is being configured
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.arwebcrafts.com',
        'Referer': 'https://www.arwebcrafts.com/'
      },
      body: JSON.stringify({
        _subject: subject,
        _replyto: lead.email,
        _template: 'table',
        _captcha: 'false',
        'Lead Name': lead.name,
        'Email Address': lead.email,
        'Phone Number': lead.phone || 'Not provided',
        'Service / Interest': lead.service || 'General Inquiry',
        'Source Page': lead.pageUrl || '/',
        'Company / Agency': lead.company || 'Not provided',
        'Estimated Budget': lead.budget || 'Not specified',
        'Client Message': lead.message || 'No additional message provided',
        'Submission Time': lead.timestamp
      }),
      signal: AbortSignal.timeout(12000)
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      console.log(`[Fallback Notification Success] Email delivered to ${NOTIFICATION_EMAIL}:`, result);
      return { sent: true, method: 'fallback_gateway', recipient: NOTIFICATION_EMAIL };
    } else {
      console.warn(`[Fallback Warning] Gateway returned ${response.status}`);
      return { sent: false, error: result.message || 'Gateway error', recipient: NOTIFICATION_EMAIL };
    }
  } catch (err) {
    console.error(`[Notification Error] Both SMTP and fallback failed: ${err.message}`);
    return { sent: false, error: err.message, recipient: NOTIFICATION_EMAIL };
  }
}

module.exports = {
  sendEmailNotification,
  getTransporter,
  formatCleanService,
  NOTIFICATION_EMAIL,
  SMTP_CONFIG: {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    user: SMTP_USER
  }
};
