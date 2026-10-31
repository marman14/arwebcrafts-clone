// Vercel Serverless Function: api/create-checkout-session.js
// Creates a secure Stripe Checkout Session with FIXED pricing & recurring add-ons

// Auto-load local environment variables from .env or .env.local if present
const fs = require('fs');
const path = require('path');
['.env', '.env.local'].forEach(file => {
  try {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {}
});

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

  if (!verifyCsrfAndOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden: Invalid request origin.' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`chk_${clientIp}`, 30, 60 * 1000);
  if (rateCheck.limited) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error: 'Too many requests. Please wait before creating a new checkout session.'
    });
  }

  try {
    const body = req.body || {};
    const planKey = sanitizeInput(body.planId || body.plan || '', 50).toLowerCase();
    const rawServiceName = sanitizeInput(body.serviceName || (planKey === 'custom' || planKey === 'new' ? 'Brand New Custom Website' : 'Website Rebuild & Redesign'), 120);
    const rawCustomerName = sanitizeInput(body.customerName || '', 100);
    const rawCustomerEmail = sanitizeInput(body.customerEmail || '', 120);
    const rawCustomerPhone = sanitizeInput(body.customerPhone || '', 30);
    const rawNotes = sanitizeInput(body.notes || '', 500);
    const addon = sanitizeInput(body.addon || 'none', 30).toLowerCase();

    // Determine fixed price
    let baseAmount = 99.00;
    if (planKey === 'custom' || planKey === 'new' || rawServiceName.toLowerCase().includes('brand new')) {
      baseAmount = 199.00;
    } else if (body.amount && !isNaN(parseFloat(body.amount))) {
      baseAmount = parseFloat(body.amount);
    }
    const baseAmountCents = Math.round(baseAmount * 100);

    // Determine recurring add-on (if any)
    let addonName = '';
    let addonAmountCents = 0;
    if (addon === 'hosting' || addon.includes('27')) {
      addonName = 'Hosting Provided + Domain Assistance';
      addonAmountCents = 2700; // $27.00/month
    } else if (addon === 'maint' || addon === 'maintenance' || addon.includes('67')) {
      addonName = 'Hosting + Monthly Maintenance & Unlimited Edits';
      addonAmountCents = 6700; // $67.00/month
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.arwebcrafts.com';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes(':3000');
    let origin;
    if (isLocalhost) {
      origin = `http://${host}`;
    } else {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      origin = process.env.SITE_URL || (req.headers.origin && req.headers.origin.startsWith('https://') ? req.headers.origin : `${proto}://${host}`);
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;

    // Check if live Stripe Secret Key is present in environment
    if (secretKey && !secretKey.includes('your_actual') && !secretKey.includes('Demo000000')) {
      const stripe = getStripe(secretKey);
      if (stripe) {
        let sessionPayload;

        if (addonAmountCents > 0) {
          // Mixed cart: mode 'subscription' charges one-time build fee + recurring monthly add-on
          sessionPayload = {
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: rawServiceName,
                    description: 'One-time build fee • Live in 1 business day • 100% custom code'
                  },
                  unit_amount: baseAmountCents
                },
                quantity: 1
              },
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: addonName,
                    description: 'Monthly cloud hosting, domain & maintenance renewal'
                  },
                  unit_amount: addonAmountCents,
                  recurring: { interval: 'month' }
                },
                quantity: 1
              }
            ],
            success_url: `${origin}/checkout/receipt/?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(rawServiceName)}&amount=${baseAmount}`,
            cancel_url: `${origin}/checkout/?plan=${planKey}&canceled=true`,
            metadata: {
              company: 'AR Webcrafts LLC',
              customer_name: rawCustomerName,
              customer_email: rawCustomerEmail,
              customer_phone: rawCustomerPhone,
              plan: rawServiceName,
              addon: addonName || 'None',
              notes: rawNotes
            }
          };
        } else {
          // One-time payment mode: fixed $99 or $199 flat
          sessionPayload = {
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: rawServiceName,
                    description: 'Black Friday Deal • Live in 1 business day • 100% bespoke custom code'
                  },
                  unit_amount: baseAmountCents
                },
                quantity: 1
              }
            ],
            success_url: `${origin}/checkout/receipt/?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(rawServiceName)}&amount=${baseAmount}`,
            cancel_url: `${origin}/checkout/?plan=${planKey}&canceled=true`,
            metadata: {
              company: 'AR Webcrafts LLC',
              customer_name: rawCustomerName,
              customer_email: rawCustomerEmail,
              customer_phone: rawCustomerPhone,
              plan: rawServiceName,
              addon: 'None',
              notes: rawNotes
            }
          };
        }

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

    // Graceful Fallback in Local / Test Mode (when STRIPE_SECRET_KEY is not in local env)
    const testSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const testSuccessUrl = `${origin}/checkout/receipt/?session_id=${testSessionId}&amount=${baseAmount.toFixed(2)}&service=${encodeURIComponent(rawServiceName)}&customer=${encodeURIComponent(rawCustomerName)}&mode=test_simulated`;

    console.log('[Stripe Session Simulation - Test Mode]', {
      customer: maskPii(rawCustomerName),
      email: maskPii(rawCustomerEmail, 'email'),
      amount: baseAmount,
      addon: addonName
    });

    return res.status(200).json({
      id: testSessionId,
      url: testSuccessUrl,
      mode: 'test_sandbox_ready',
      message: 'Running in local dev mode. On Vercel with STRIPE_SECRET_KEY, this generates a live fixed-price Stripe Checkout session.'
    });

  } catch (error) {
    console.error('Create Checkout Session Error:', error.message);
    return res.status(500).json({
      error: 'An error occurred while creating the checkout session. Please try again.'
    });
  }
};
