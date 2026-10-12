// Vercel Serverless Function: api/webhook.js
// Handles incoming Stripe Webhooks securely for AR Webcrafts LLC

function getStripe(secretKey) {
  try {
    const Stripe = require('stripe');
    return new Stripe(secretKey);
  } catch (e) {
    return null;
  }
}
const { maskPii } = require('./_security');

// Helper to buffer the raw body for signature verification in serverless environments
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  let event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (webhookSecret && secretKey) {
      if (!signature) {
        return res.status(400).send('Webhook Error: Missing stripe-signature header.');
      }
      const stripe = getStripe(secretKey);
      if (stripe) {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } else {
        return res.status(500).send('Webhook Error: Stripe library not loaded.');
      }
    } else {
      // In local dev preview only when webhook secret is not yet provided
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).send('Webhook Error: Stripe Webhook Secret not configured on production server.');
      }
      try {
        event = JSON.parse(rawBody.toString('utf8'));
      } catch (e) {
        event = req.body || {};
      }
    }

    console.log(`[Stripe Webhook Verified] Event: ${event.type || 'unknown'}`);

    // Handle the specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`[Stripe Webhook] Checkout Session completed: ${session.id}`, {
          amount: session.amount_total,
          customer_email: maskPii(session.customer_email || session.customer_details?.email || '', 'email')
        });
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id}`, {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.warn(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`, {
          error: paymentIntent.last_payment_error?.message
        });
        break;
      }
      default:
        console.log(`[Stripe Webhook] Received unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true, event: event.type });
  } catch (err) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// Vercel config to disable body parsing so raw buffer can be verified
module.exports.config = {
  api: {
    bodyParser: false
  }
};

