// Vercel Serverless Function: api/submit-demo.js
// Handles free trade contractor demo requests from /offer/

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    const {
      name = '',
      phone = '',
      email = '',
      business = '',
      trade = '',
      city = '',
      contact_method = 'Phone call',
      reference = ''
    } = data;

    // Validate required fields
    if (!name.trim() || !phone.trim() || !email.trim() || !business.trim() || !city.trim()) {
      return res.status(400).json({
        error: 'Missing required fields. Please ensure name, phone, email, business name, and city are provided.'
      });
    }

    const leadRecord = {
      timestamp: new Date().toISOString(),
      leadSource: 'AR Webcrafts Contractor Offer (/offer/)',
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      business: business.trim(),
      trade: trade.trim() || 'Contractor',
      city: city.trim(),
      contact_method: contact_method.trim(),
      reference: reference.trim() || 'None provided',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    };

    console.log('[AR Webcrafts New Lead - Contractor Demo Request]:', JSON.stringify(leadRecord, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Demo request received successfully. We will reach out to confirm before building.',
      leadId: 'demo_' + Math.random().toString(36).substring(2, 9)
    });
  } catch (err) {
    console.error('Submit Demo Error:', err);
    return res.status(500).json({
      error: 'An internal error occurred while saving demo request: ' + err.message
    });
  }
};
