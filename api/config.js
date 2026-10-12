// Vercel Serverless Function: api/config.js
// Provides the Stripe Publishable Key securely to the frontend client

const { applySecurityHeaders } = require('./_security');

module.exports = async (req, res) => {
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Please use GET.' });
  }

  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    const isConfigured = Boolean(publishableKey && !publishableKey.includes('your_actual'));

    return res.status(200).json({
      publishableKey: isConfigured ? publishableKey : '',
      isConfigured: isConfigured,
      isLive: publishableKey.startsWith('pk_live_'),
      mode: publishableKey.startsWith('pk_live_') ? 'live' : 'test',
      company: 'AR Webcrafts LLC'
    });
  } catch (error) {
    console.error('Config API Error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve configuration.' });
  }
};

