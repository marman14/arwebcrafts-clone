// Notification Dispatcher for AR Webcrafts LLC
// Sends immediate email notifications upon verified form submissions.

'use strict';

const PRIMARY_EMAIL = 'arman@arwebcrafts.com';
const SECONDARY_EMAIL = 'contact@arwebcrafts.com';

async function sendEmailNotification(lead) {
  const subject = `[New Lead - ${lead.pageTitle || 'AR Webcrafts'}] ${lead.name} (${lead.service || 'Inquiry'})`;

  const emailBody = {
    _subject: subject,
    _replyto: lead.email,
    _cc: SECONDARY_EMAIL,
    _template: 'table',
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
    // Dispatch via FormSubmit headless AJAX API to avoid third-party redirect
    const response = await fetch(`https://formsubmit.co/ajax/${PRIMARY_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailBody),
      signal: AbortSignal.timeout(5000) // 5s timeout guard
    });

    if (response.ok) {
      console.log(`[Notification Success] Email delivered for lead: ${lead.name} (${lead.email})`);
      return { sent: true };
    } else {
      const errText = await response.text();
      console.warn(`[Notification Warning] Gateway returned ${response.status}: ${errText}`);
      return { sent: false, error: errText };
    }
  } catch (err) {
    console.error(`[Notification Error] Could not dispatch email notification: ${err.message}`);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  sendEmailNotification,
  PRIMARY_EMAIL,
  SECONDARY_EMAIL
};
