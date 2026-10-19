// Notification Dispatcher for AR Webcrafts LLC
// Sends immediate email notifications upon verified form submissions.

'use strict';

const NOTIFICATION_EMAIL = 'contact@arwebcrafts.com';

async function sendEmailNotification(lead) {
  const subject = `[New Lead - ${lead.pageTitle || 'AR Webcrafts'}] ${lead.name} (${lead.service || 'Inquiry'})`;

  const emailBody = {
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
    'Submission Time': lead.timestamp,
    'Security Status': 'Verified (Honeypot + Rate Limit + Sanitization Passed)'
  };

  try {
    // Dispatch strictly and exclusively to contact@arwebcrafts.com via FormSubmit headless AJAX API
    const response = await fetch(`https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.arwebcrafts.com',
        'Referer': 'https://www.arwebcrafts.com/'
      },
      body: JSON.stringify(emailBody),
      signal: AbortSignal.timeout(15000) // 15s timeout guard
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      console.log(`[Notification Success] Email gateway responded for ${NOTIFICATION_EMAIL}:`, result);
      return { sent: true, recipient: NOTIFICATION_EMAIL, details: result };
    } else {
      console.warn(`[Notification Warning] Gateway returned ${response.status}:`, result);
      return { sent: false, error: result.message || 'Gateway error', recipient: NOTIFICATION_EMAIL };
    }
  } catch (err) {
    console.error(`[Notification Error] Could not dispatch email notification: ${err.message}`);
    return { sent: false, error: err.message, recipient: NOTIFICATION_EMAIL };
  }
}

module.exports = {
  sendEmailNotification,
  NOTIFICATION_EMAIL
};

