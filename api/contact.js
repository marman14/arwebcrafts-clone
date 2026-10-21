// Vercel Serverless Function: api/contact.js
// Centralized submission endpoint for all contact, consultation, and service inquiry forms across AR Webcrafts LLC

'use strict';

const {
  applySecurityHeaders,
  verifyCsrfAndOrigin,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  isSpamSubmission,
  maskPii
} = require('./_security');
const { saveLead } = require('./_db');
const { sendEmailNotification } = require('./_notify');

module.exports = async (req, res) => {
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  // 1. CSRF & Allowed Origin Verification
  if (!verifyCsrfAndOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden: Invalid request origin.' });
  }

  // 2. IP Rate Limiting (max 8 submissions per 10 minutes per IP)
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`contact_${clientIp}`, 8, 10 * 60 * 1000);
  if (rateCheck.limited) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error: 'Too many submissions. Please wait a few minutes before trying again.'
    });
  }

  try {
    const rawData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // 3. Spam & Honeypot Detection
    const spamCheck = isSpamSubmission(rawData);
    if (spamCheck.isSpam) {
      console.warn(`[Spam Blocked] IP: ${clientIp}, Reason: ${spamCheck.reason}`);
      // Return 200 OK with mock success so bots believe their payload succeeded
      return res.status(200).json({
        success: true,
        message: 'Thank you! Your inquiry has been received.',
        leadId: 'cnt_' + Math.random().toString(36).substring(2, 9)
      });
    }

    // 4. Sanitize and validate fields
    let name = sanitizeInput(
      rawData.name ||
      `${rawData['names[first_name]'] || ''} ${rawData['names[last_name]'] || ''}`.trim() ||
      rawData.first_name || '',
      100
    );
    const email = sanitizeInput(rawData.email || '', 120);
    const phone = sanitizeInput(rawData.phone || rawData.input_text || rawData.mobile || '', 30);
    const company = sanitizeInput(
      rawData.company || rawData.agency || rawData.business || rawData.website_url || rawData.url || '',
      120
    );
    const service = sanitizeInput(
      rawData.service || rawData.interest || rawData.selected_service ||
      rawData.primary_need || rawData.resource_need || rawData.project_type ||
      rawData.automation_need || rawData.automation_type || rawData.plugin_need ||
      rawData.dropdown || rawData.systems || (rawData.is_newsletter ? 'Newsletter Subscription' : 'Custom Development'),
      100
    );
    const budget = sanitizeInput(
      rawData.budget || rawData.timeline || rawData.traffic_volume ||
      rawData.tech_stack || rawData.platforms || rawData.protocol || rawData.user_count || '',
      80
    );
    const subject = sanitizeInput(rawData.subject || `Inquiry from ${rawData.page_url || 'Website'}`, 150);
    const message = sanitizeInput(
      rawData.message || rawData.description || rawData.comments ||
      rawData.project_details || rawData.project_brief || rawData.project_scope ||
      rawData.requirements || rawData.scope || (rawData.is_newsletter ? 'Newsletter subscription via website footer' : ''),
      3000
    );
    const pageUrl = sanitizeInput(rawData.page_url || rawData.pageUrl || '/', 255);
    const pageTitle = sanitizeInput(rawData.page_title || rawData.pageTitle || 'AR Webcrafts', 150);

    // Support newsletter signup where only email is provided
    if (!name && email && (rawData.is_newsletter || service === 'Newsletter Subscription' || rawData.form_id === '2' || rawData.form_id === 2)) {
      name = 'Newsletter Subscriber';
    }

    if (!name || !email) {
      return res.status(400).json({
        error: 'Please provide both your name and a valid email address.'
      });
    }

    // Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // 5. Save lead to Centralized Persistent Database
    const savedLead = saveLead({
      name,
      email,
      phone,
      company,
      service,
      budget,
      subject,
      message,
      pageUrl,
      pageTitle,
      ip: clientIp,
      status: 'new'
    });

    console.log(`[Verified Lead Stored]: ID=${savedLead.id}, Name=${name}, Source=${pageUrl}`);

    // 6. Trigger Instant Email Notification (safely bounded so client never lags)
    try {
      await Promise.race([
        sendEmailNotification(savedLead),
        new Promise(resolve => setTimeout(resolve, 8000))
      ]);
    } catch (err) {
      console.error('[Notification Dispatch Warning]:', err.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you within 2 business hours.',
      leadId: savedLead.id
    });
  } catch (err) {
    console.error('Contact Form Error:', err.message);
    return res.status(500).json({
      error: 'An internal error occurred while processing your message. Please reach out via phone or email.'
    });
  }
};
