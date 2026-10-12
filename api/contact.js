// Vercel Serverless Function: api/contact.js
// Handles general contact form and consultation requests across the AR Webcrafts website

const {
  applySecurityHeaders,
  verifyCsrfAndOrigin,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  isSpamSubmission,
  maskPii
} = require('./_security');

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

  // 2. IP Rate Limiting (max 5 submissions per 10 minutes per IP)
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`contact_${clientIp}`, 5, 10 * 60 * 1000);
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
      return res.status(200).json({
        success: true,
        message: 'Thank you! Your message has been received.',
        leadId: 'cnt_' + Math.random().toString(36).substring(2, 9)
      });
    }

    // 4. Sanitize and validate fields
    const name = sanitizeInput(
      rawData.name ||
      `${rawData['names[first_name]'] || ''} ${rawData['names[last_name]'] || ''}`.trim() ||
      rawData.first_name || '',
      100
    );
    const email = sanitizeInput(rawData.email || '', 120);
    const phone = sanitizeInput(rawData.phone || rawData.input_text || rawData.mobile || '', 30);
    const subject = sanitizeInput(rawData.subject || 'Website Inquiry', 150);
    const message = sanitizeInput(rawData.message || rawData.description || rawData.comments || '', 2000);
    const pageUrl = sanitizeInput(rawData.page_url || '', 255);

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

    const leadRecord = {
      timestamp: new Date().toISOString(),
      leadSource: pageUrl || 'AR Webcrafts Contact Form',
      name,
      subject,
      messagePreview: message.slice(0, 100),
      maskedPhone: phone ? maskPii(phone, 'phone') : 'Not provided',
      maskedEmail: maskPii(email, 'email'),
      clientIpMasked: maskPii(clientIp, 'text')
    };

    console.log('[AR Webcrafts Verified Contact Lead]:', JSON.stringify(leadRecord));

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
      leadId: 'cnt_' + Math.random().toString(36).substring(2, 9)
    });
  } catch (err) {
    console.error('Contact Form Error:', err.message);
    return res.status(500).json({
      error: 'An internal error occurred while processing your message. Please reach out via phone or email.'
    });
  }
};
