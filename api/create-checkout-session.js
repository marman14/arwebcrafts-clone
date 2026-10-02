// Vercel Serverless Function: api/create-checkout-session.js
// Creates a secure Stripe Checkout Session for AR Webcrafts LLC services/invoices

const Stripe = require('stripe');

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
    const {
      serviceName = 'Custom WordPress Development Milestone',
      description = 'AR Webcrafts LLC Client Service Deposit / Milestone Payment',
      amount = 500,
      currency = 'usd',
      customerName = '',
      customerEmail = '',
      customerPhone = '',
      invoiceNumber = '',
      notes = ''
    } = req.body || {};

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount specified.' });
    }

    const unitAmountCents = Math.round(numericAmount * 100);

    // Determine the base origin
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'arwebcrafts-clone.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = process.env.SITE_URL || `${proto}://${host}`;

    const secretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe Secret Key is properly set in environment
    if (secretKey && !secretKey.includes('your_actual') && !secretKey.includes('Demo000000')) {
      const stripe = new Stripe(secretKey);

      const sessionPayload = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: serviceName,
                description: description || `Invoice Ref: ${invoiceNumber || 'N/A'}`
              },
              unit_amount: unitAmountCents
            },
            quantity: 1
          }
        ],
        success_url: `${origin}/checkout/receipt/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/transaction-failed/?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          company: 'AR Webcrafts LLC',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          invoice_number: invoiceNumber || 'N/A',
          service_name: serviceName,
          notes: notes.substring(0, 500)
        }
      };

      if (customerEmail && customerEmail.includes('@')) {
        sessionPayload.customer_email = customerEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionPayload);

      return res.status(200).json({
        id: session.id,
        url: session.url,
        mode: 'live_stripe'
      });
    }

    // Graceful Sandbox / Test Mode Simulation if live keys are not yet provided in Vercel environment
    // Generates a verified test receipt redirect so developers & clients can test the full UI flow
    const testSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const testSuccessUrl = `${origin}/checkout/receipt/?session_id=${testSessionId}&amount=${numericAmount.toFixed(2)}&currency=${currency.toUpperCase()}&service=${encodeURIComponent(serviceName)}&customer=${encodeURIComponent(customerName)}&invoice=${encodeURIComponent(invoiceNumber || 'INV-DEMO')}&mode=test_simulated`;

    return res.status(200).json({
      id: testSessionId,
      url: testSuccessUrl,
      mode: 'test_sandbox_ready',
      message: 'Running in Test Mode. Set STRIPE_SECRET_KEY in Vercel to route directly to live Stripe hosted checkout.'
    });
  } catch (error) {
    console.error('Create Checkout Session Error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while creating the checkout session.'
    });
  }
};
