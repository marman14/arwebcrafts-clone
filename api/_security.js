// Shared Security Utility for AR Webcrafts LLC Serverless APIs
// Provides CORS hardening, CSRF origin verification, Rate Limiting, 
// Input Sanitization (XSS & SQL Injection defense), Honeypot bot protection, and PII masking.

'use strict';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?arwebcrafts\.com$/,
  /^https:\/\/arwebcrafts-clone\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+-marman14s-projects\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:[0-9]+)?$/,
  /^http:\/\/127\.0\.0\.1(:[0-9]+)?$/
];

// Sliding Window Memory Rate Limiter
const rateLimitBuckets = new Map();

function cleanOldBuckets(now) {
  if (rateLimitBuckets.size > 2000) {
    for (const [key, record] of rateLimitBuckets.entries()) {
      if (now - record.resetTime > 600000) {
        rateLimitBuckets.delete(key);
      }
    }
  }
}

function checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  cleanOldBuckets(now);

  const bucket = rateLimitBuckets.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > bucket.resetTime) {
    bucket.count = 1;
    bucket.resetTime = now + windowMs;
  } else {
    bucket.count += 1;
  }
  rateLimitBuckets.set(ip, bucket);

  if (bucket.count > maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetTime - now) / 1000));
    return { limited: true, retryAfter: retryAfterSec };
  }
  return { limited: false, retryAfter: 0 };
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((pat) => pat.test(origin));
}

function applySecurityHeaders(req, res) {
  const origin = req.headers['origin'] || '';
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same-origin or server-to-server
    res.setHeader('Access-Control-Allow-Origin', 'https://arwebcrafts.com');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}

function verifyCsrfAndOrigin(req) {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  // If Sec-Fetch-Site is cross-site for POST, reject
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite === 'cross-site' && req.method === 'POST') {
    return false;
  }

  if (origin) {
    return isOriginAllowed(origin);
  }

  if (referer) {
    try {
      const parsed = new URL(referer);
      return isOriginAllowed(parsed.origin);
    } catch {
      return false;
    }
  }

  // Allow requests where Host matches allowed domains, or in local development
  const host = (req.headers['host'] || '').toLowerCase();
  const isAllowedHost = /^(www\.)?arwebcrafts\.com$/i.test(host) ||
                        /^[a-z0-9-]+\.vercel\.app$/i.test(host) ||
                        host.includes('localhost') ||
                        host.includes('127.0.0.1');
  return isAllowedHost;
}

// SQL injection & XSS Sanitizer
function sanitizeInput(val, maxLength = 1000) {
  if (typeof val !== 'string') return '';
  let str = val.trim().slice(0, maxLength);

  // Strip dangerous HTML/script tags (XSS)
  str = str.replace(/<[^>]*>?/gm, '');

  // Strip null bytes and control characters
  str = str.replace(/[\0\x08\x09\x1a]/g, '');

  // Neutralize common SQL Injection constructs
  const sqlPatterns = /(\b(UNION|SELECT|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC|EXECUTE|WAITFOR|CAST|CONVERT|TRUNCATE)\b|\bOR\s+1\s*=\s*1\b|--|;)/gi;
  if (sqlPatterns.test(str)) {
    str = str.replace(sqlPatterns, ' ');
  }

  return str.trim();
}

// Robust Multi-Layer Anti-Spam & Bot Detection Engine
function isSpamSubmission(data) {
  if (!data || typeof data !== 'object') {
    return { isSpam: true, reason: 'Invalid or empty submission payload' };
  }

  // 1. Multi-Field Honeypot Trap
  // Checks hidden honeypot fields.
  // These fields are completely invisible to humans (styled with position: absolute; left: -9999px; opacity: 0; pointer-events: none).
  // Real humans will NEVER fill them. Automated spam bots scanning the HTML DOM will blindly fill them.
  const honeypotValues = [
    data.hp_website_check,
    data.company_fax,
    data.website_address_confirm,
    data.confirm_hp,
    data.hp_check,
    data.bot_trap,
    data.phone_secondary,
    data.ak_hp_textarea
  ];

  for (const hp of honeypotValues) {
    if (typeof hp === 'string' && hp.trim().length > 0) {
      return { isSpam: true, reason: 'Honeypot trap triggered by automated bot' };
    }
  }

  // 2. Sub-Human Submission Timing Check (Time-to-Submit)
  // Humans take at least 2-3 seconds to read, fill, and submit a multi-field form.
  // Automated scripts and headless bots submit in under 1.2 seconds.
  const loadedAt = parseInt(data.form_loaded_at || data._ar_loaded_at, 10);
  if (!isNaN(loadedAt) && loadedAt > 0) {
    const elapsedMs = Date.now() - loadedAt;
    if (elapsedMs < 1200 && elapsedMs > 0) {
      return { isSpam: true, reason: `Sub-human submission speed (${elapsedMs}ms)` };
    }
  }

  // 3. Fake / Disposable / Malicious Burner Email Domain Filter
  const email = (data.email || '').toLowerCase().trim();
  if (email) {
    const disposableDomains = [
      'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
      'throwawaymail.com', 'sharklasers.com', 'yopmail.com', 'dispostable.com',
      'trashmail.com', 'getairmail.com', 'fakemailgenerator.com', 'temp-mail.org',
      'generator.email', 'disposablemail.com', 'crazymailing.com', 'nada.ltd',
      'trashmail.net', 'mytempemail.com', 'emailondeck.com', 'burnermail.io'
    ];
    const domain = email.split('@')[1];
    if (domain && disposableDomains.includes(domain)) {
      return { isSpam: true, reason: `Disposable spam email domain detected (@${domain})` };
    }
  }

  // 4. Excessive Link Spam Filter (SEO blast scripts frequently include 4+ URLs)
  const messageText = String(data.message || data.description || data.comments || '');
  const linkMatches = messageText.match(/https?:\/\/|www\./gi) || [];
  if (linkMatches.length >= 4) {
    return { isSpam: true, reason: `Excessive URL link density (${linkMatches.length} links found)` };
  }

  // 5. Signature Spam & Malicious Marketing Keywords
  const spamKeywords = [
    /\b(casino|cialis|viagra|porn|xxx)\b/i,
    /crypto(currency)?\s+giveaway/i,
    /slot\s+online/i, /poker\s+online/i, /baccarat/i,
    /http:\/\/[a-z0-9-]+\.ru/i,
    /buy\s+backlinks/i, /guest\s+post\s+outreach/i,
    /boost\s+your\s+domain\s+authority/i,
    /rank\s+#1\s+on\s+google/i,
    /da90\b/i,
    /telegram:\s*@/i
  ];

  const fullContent = `${data.name || ''} ${data.company || ''} ${data.business || ''} ${messageText}`;
  for (const pattern of spamKeywords) {
    if (pattern.test(fullContent)) {
      return { isSpam: true, reason: 'Spam signature pattern matched' };
    }
  }

  // 6. Non-English Script Blast Check (Cyrillic spam blasts in English agency forms)
  const cyrillicMatches = messageText.match(/[\u0400-\u04FF]/g) || [];
  if (cyrillicMatches.length > 25) {
    return { isSpam: true, reason: 'Automated foreign language spam blast detected' };
  }

  return { isSpam: false };
}

// Mask sensitive PII for logs
function maskPii(str, type = 'text') {
  if (!str || typeof str !== 'string') return '';
  if (type === 'email') {
    const parts = str.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : '***';
      return `${maskedName}@${parts[1]}`;
    }
  }
  if (type === 'phone') {
    const digits = str.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `***-***-${digits.slice(-4)}`;
    }
  }
  return str.length > 3 ? `${str.slice(0, 2)}***` : '***';
}

module.exports = {
  applySecurityHeaders,
  verifyCsrfAndOrigin,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  isSpamSubmission,
  maskPii
};
