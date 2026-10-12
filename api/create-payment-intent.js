// Vercel Serverless Function: api/create-payment-intent.js
// Creates a Stripe PaymentIntent for embedded card Elements on AR Webcrafts checkout pages

function getStripe(secretKey) {
  try {
    const Stripe = require('stripe');
    return new Stripe(secretKey);
  } catch (e) {
    return null;
  }
}
const {
  applySecurityHeaders,
  verifyCsrfAndOrigin,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
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

  // 1. CSRF & Origin Verification
  if (!verifyCsrfAndOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden: Invalid request origin.' });
  }

  // 2. IP Rate Limiting (max 15 requests per minute)
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`pi_${clientIp}`, 15, 60 * 1000);
  if (rateCheck.limited) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error: 'Too many requests. Please wait before creating a new payment.'
    });
  }

  try {
    const body = req.body || {};
    const rawServiceName = sanitizeInput(body.serviceName || 'Custom WordPress Development Milestone', 120);
    const rawDescription = sanitizeInput(body.description || 'AR Webcrafts LLC Invoice Payment', 250);
    const rawCustomerName = sanitizeInput(body.customerName || '', 100);
    const rawCustomerEmail = sanitizeInput(body.customerEmail || '', 120);
    const rawInvoiceNumber = sanitizeInput(body.invoiceNumber || '', 50);
    const currency = sanitizeInput(body.currency || 'usd', 5).toLowerCase();

    const numericAmount = parseFloat(body.amount);
    if (isNaN(numericAmount) || numericAmount < 1.00 || numericAmount > 50000.00) {
      return res.status(400).json({
        error: 'Invalid payment amount specified. Amount must be between $1.00 and $50,000.00 USD.'
      });
    }

    const unitAmountCents = Math.round(numericAmount * 100);
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (secretKey && !secretKey.includes('your_actual') && !secretKey.includes('Demo000000')) {
      const stripe = getStripe(secretKey);
      if (stripe) {
        const intent = await stripe.paymentIntents.create({
          amount: unitAmountCents,
          currency: currency || 'usd',
          description: `${rawServiceName} - Invoice: ${rawInvoiceNumber || 'N/A'}`,
          metadata: {
            company: 'AR Webcrafts LLC',
            customer_name: rawCustomerName,
            customer_email: rawCustomerEmail,
            invoice_number: rawInvoiceNumber || 'N/A',
            service_name: rawServiceName
          },
          receipt_email: rawCustomerEmail && rawCustomerEmail.includes('@') ? rawCustomerEmail : undefined,
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
    }

    // Graceful fallback for test/sandbox preview
    const fakeId = 'pi_test_' + Math.random().toString(36).substring(2, 15);
    console.log('[PaymentIntent - Test Sandbox Created]', {
      customer: maskPii(rawCustomerName),
      amount: numericAmount
    });

    return res.status(200).json({
      clientSecret: fakeId + '_secret_' + Math.random().toString(36).substring(2, 10),
      id: fakeId,
      mode: 'test_sandbox_ready',
      message: 'Running in Test Mode. Set STRIPE_SECRET_KEY in Vercel for live Stripe processing.'
    });
  } catch (error) {
    console.error('Create Payment Intent Error:', error.message);
    return res.status(500).json({
      error: 'An error occurred while creating the payment intent. Please try again.'
    });
  }
};

