// Vercel Serverless Function: api/create-payment-intent.js
// Creates a Stripe PaymentIntent for embedded card Elements on AR Webcrafts checkout pages

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
      amount = 500,
      currency = 'usd',
      customerName = '',
      customerEmail = '',
      invoiceNumber = '',
      serviceName = 'Custom WordPress Development Milestone',
      description = 'AR Webcrafts LLC Invoice Payment'
    } = req.body || {};

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount specified.' });
    }

    const unitAmountCents = Math.round(numericAmount * 100);
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (secretKey && !secretKey.includes('your_actual') && !secretKey.includes('Demo000000')) {
      const stripe = new Stripe(secretKey);

      const intent = await stripe.paymentIntents.create({
        amount: unitAmountCents,
        currency: currency.toLowerCase(),
        description: `${serviceName} - Invoice: ${invoiceNumber || 'N/A'}`,
        metadata: {
          company: 'AR Webcrafts LLC',
          customer_name: customerName,
          customer_email: customerEmail,
          invoice_number: invoiceNumber || 'N/A',
          service_name: serviceName
        },
        receipt_email: customerEmail && customerEmail.includes('@') ? customerEmail : undefined,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return res.status(200).json({
        clientSecret: intent.client_secret,
        id: intent.id,
        mode: 'live_stripe'
      });
    }

    // Graceful fallback for test/sandbox preview
    const fakeId = 'pi_test_' + Math.random().toString(36).substring(2, 15);
    return res.status(200).json({
      clientSecret: fakeId + '_secret_' + Math.random().toString(36).substring(2, 10),
      id: fakeId,
      mode: 'test_sandbox_ready',
      message: 'Running in Test Mode. Set STRIPE_SECRET_KEY in Vercel for live Stripe processing.'
    });
  } catch (error) {
    console.error('Create Payment Intent Error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while creating the payment intent.'
    });
  }
};
