// Vercel Serverless Function: api/submit-demo.js
// Handles free trade contractor demo requests from /offer/ with full security defense

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

  // 2. IP Rate Limiting (max 5 requests per 10 minutes per IP)
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`demo_${clientIp}`, 5, 10 * 60 * 1000);
  if (rateCheck.limited) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error: 'Too many requests. Please wait before submitting another demo request.'
    });
  }

  try {
    const rawData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // 3. Spam & Honeypot Detection
    const spamCheck = isSpamSubmission(rawData);
    if (spamCheck.isSpam) {
      // Return 200 OK with mock success so bots believe their payload succeeded
      return res.status(200).json({
        success: true,
        message: 'Demo request received successfully.',
        leadId: 'demo_' + Math.random().toString(36).substring(2, 9)
      });
    }

    // 4. Sanitize and validate inputs (Prevent XSS and SQL Injection)
    const name = sanitizeInput(rawData.name || '', 100);
    const phone = sanitizeInput(rawData.phone || '', 30);
    const email = sanitizeInput(rawData.email || '', 120);
    const business = sanitizeInput(rawData.business || '', 150);
    const trade = sanitizeInput(rawData.trade || 'Contractor', 80);
    const city = sanitizeInput(rawData.city || '', 100);
    const contactMethod = sanitizeInput(rawData.contact_method || 'Phone call', 50);
    const reference = sanitizeInput(rawData.reference || '', 255);

    // Validate required fields
    if (!name || !phone || !email || !business || !city) {
      return res.status(400).json({
        error: 'Missing required fields. Please ensure name, phone, email, business name, and city are provided.'
      });
    }

    // Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Validate phone digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit phone number.' });
    }

    const leadRecord = {
      timestamp: new Date().toISOString(),
      leadSource: 'AR Webcrafts Contractor Offer (/offer/)',
      name,
      business,
      trade,
      city,
      contactMethod,
      reference: reference || 'None provided',
      maskedPhone: maskPii(phone, 'phone'),
      maskedEmail: maskPii(email, 'email'),
      clientIpMasked: maskPii(clientIp, 'text')
    };

    console.log('[AR Webcrafts Verified Lead - Contractor Demo Request]:', JSON.stringify(leadRecord));

    return res.status(200).json({
      success: true,
      message: 'Demo request received successfully. We will reach out to confirm before building.',
      leadId: 'demo_' + Math.random().toString(36).substring(2, 9)
    });
  } catch (err) {
    console.error('Submit Demo Error:', err.message);
    return res.status(500).json({
      error: 'An internal error occurred while processing your demo request. Please try again or call us.'
    });
  }
};

