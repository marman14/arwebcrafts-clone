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

  // Allow requests without Origin/Referer only in local development / direct CLI
  const host = req.headers['host'] || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
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

// Spam & Bot detection
function isSpamSubmission(data) {
  // 1. Honeypot check
  if (data.hp_website_check || data.confirm_hp || data.website_url) {
    return { isSpam: true, reason: 'Honeypot field was filled' };
  }

  // 2. Submission timing check (less than 1.2s since render)
  if (data.form_loaded_at) {
    const loadedAt = parseInt(data.form_loaded_at, 10);
    if (!isNaN(loadedAt) && Date.now() - loadedAt < 1200) {
      return { isSpam: true, reason: 'Form submitted faster than humanly possible' };
    }
  }

  // 3. Known casino / pharmacy / crypto spam signatures
  const spamKeywords = [
    /casino/i, /crypto(currency)?\s+giveaway/i, /viagra/i, /cialis/i,
    /slot\s+online/i, /poker\s+online/i, /baccarat/i, /telegram\s*:/i,
    /whatsapp\s*:\s*\+/i, /http:\/\/[a-z0-9-]+\.ru/i, /dating\s+site/i
  ];

  const contentToCheck = `${data.name || ''} ${data.business || ''} ${data.message || ''} ${data.reference || ''}`;
  for (const pattern of spamKeywords) {
    if (pattern.test(contentToCheck)) {
      return { isSpam: true, reason: 'Spam signature matched' };
    }
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
