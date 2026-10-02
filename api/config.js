// Vercel Serverless Function: api/config.js
// Provides the Stripe Publishable Key securely to the frontend client

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    console.error('Config API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
