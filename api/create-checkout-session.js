// Vercel Serverless Function: api/create-checkout-session.js
// Creates a secure Stripe Checkout Session for AR Webcrafts LLC services/invoices

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

  // 2. IP Rate Limiting (max 15 checkout sessions per minute to block card testing bots)
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`chk_${clientIp}`, 15, 60 * 1000);
  if (rateCheck.limited) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error: 'Too many requests. Please wait before creating a new checkout session.'
    });
  }

  try {
    const body = req.body || {};
    const rawServiceName = sanitizeInput(body.serviceName || 'Custom WordPress Development Milestone', 120);
    const rawDescription = sanitizeInput(body.description || 'AR Webcrafts LLC Client Service Deposit / Milestone Payment', 250);
    const rawCustomerName = sanitizeInput(body.customerName || '', 100);
    const rawCustomerEmail = sanitizeInput(body.customerEmail || '', 120);
    const rawCustomerPhone = sanitizeInput(body.customerPhone || '', 30);
    const rawInvoiceNumber = sanitizeInput(body.invoiceNumber || '', 50);
    const rawNotes = sanitizeInput(body.notes || '', 500);
    const currency = sanitizeInput(body.currency || 'usd', 5).toLowerCase();

    const numericAmount = parseFloat(body.amount);
    if (isNaN(numericAmount) || numericAmount < 1.00 || numericAmount > 50000.00) {
      return res.status(400).json({
        error: 'Invalid payment amount specified. Amount must be between $1.00 and $50,000.00 USD.'
      });
    }

    const unitAmountCents = Math.round(numericAmount * 100);

    // Determine the base origin
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.arwebcrafts.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = process.env.SITE_URL || `${proto}://${host}`;

    const secretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe Secret Key is properly set in environment
    if (secretKey && !secretKey.includes('your_actual') && !secretKey.includes('Demo000000')) {
      const stripe = getStripe(secretKey);
      if (stripe) {
        const sessionPayload = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: currency || 'usd',
              product_data: {
                name: rawServiceName,
                description: rawDescription || `Invoice Ref: ${rawInvoiceNumber || 'N/A'}`
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
          customer_name: rawCustomerName,
          customer_email: rawCustomerEmail,
          customer_phone: rawCustomerPhone,
          invoice_number: rawInvoiceNumber || 'N/A',
          service_name: rawServiceName,
          notes: rawNotes
        }
      };

      if (rawCustomerEmail && rawCustomerEmail.includes('@')) {
        sessionPayload.customer_email = rawCustomerEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionPayload);

      return res.status(200).json({
        id: session.id,
        url: session.url,
        mode: 'live_stripe'
      });
      }
    }

    // Graceful Sandbox / Test Mode Simulation if live keys are not yet provided in Vercel environment
    const testSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const testSuccessUrl = `${origin}/checkout/receipt/?session_id=${testSessionId}&amount=${numericAmount.toFixed(2)}&currency=${currency.toUpperCase()}&service=${encodeURIComponent(rawServiceName)}&customer=${encodeURIComponent(rawCustomerName)}&invoice=${encodeURIComponent(rawInvoiceNumber || 'INV-DEMO')}&mode=test_simulated`;

    console.log('[Stripe Session Created - Test Mode]', {
      customer: maskPii(rawCustomerName),
      email: maskPii(rawCustomerEmail, 'email'),
      amount: numericAmount
    });

    return res.status(200).json({
      id: testSessionId,
      url: testSuccessUrl,
      mode: 'test_sandbox_ready',
      message: 'Running in Test Mode. Set STRIPE_SECRET_KEY in Vercel to route directly to live Stripe hosted checkout.'
    });
  } catch (error) {
    console.error('Create Checkout Session Error:', error.message);
    return res.status(500).json({
      error: 'An error occurred while creating the checkout session. Please try again.'
    });
  }
};

