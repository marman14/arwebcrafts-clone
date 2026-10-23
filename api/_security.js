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

// Heuristic Gibberish String Detector
// Catches automated bot strings (e.g. 'wARBhBuZnkELpXMnVGoV', 'Lcvaicspbm')
function isGibberishString(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (s.length < 4) return false;

  // 1. Pure digits or punctuation in name/company
  if (/^[0-9\s\-_+()]+$/.test(s)) return true;

  // 2. Check individual words
  const words = s.split(/\s+/);
  for (const w of words) {
    const letters = w.replace(/[^a-zA-Z]/g, '');
    if (letters.length >= 8) {
      // Mixed-case alternating chaos (e.g. 'wARBhBuZnkELpXMnVGoV')
      const upper = (letters.match(/[A-Z]/g) || []).length;
      const lower = (letters.match(/[a-z]/g) || []).length;
      if (upper >= 3 && lower >= 3) {
        let transitions = 0;
        for (let i = 0; i < letters.length - 1; i++) {
          const isCurrUpper = letters[i] >= 'A' && letters[i] <= 'Z';
          const isNextUpper = letters[i + 1] >= 'A' && letters[i + 1] <= 'Z';
          if (isCurrUpper !== isNextUpper) transitions++;
        }
        if (transitions >= 5) return true;
      }

      // 5+ consecutive consonants (e.g. 'Lcvaicspbm')
      if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(letters)) return true;

      // High consonant-to-letter ratio (> 85%) on words longer than 7 letters
      const vowels = (letters.match(/[aeiouy]/gi) || []).length;
      const consonantRatio = (letters.length - vowels) / letters.length;
      if (consonantRatio > 0.85 && letters.length >= 8) return true;
    }
  }

  return false;
}

// Check for pure numeric / code-like inquiry details (e.g. '7694127162')
function isNumericOnlyMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  const trimmed = msg.trim();
  if (!trimmed) return false;
  // If message contains 6+ characters and consists solely of digits/hyphens/spaces
  return /^[0-9\s\-_+()]{6,}$/.test(trimmed);
}

// Check for abusive Gmail dot-trick burner patterns (e.g. 'ta.t.e.ziw4.23@gmail.com')
function isDotAbuseEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const [username, domain] = parts;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // 3 or more dots in username
    const dotCount = (username.match(/\./g) || []).length;
    if (dotCount >= 3) return true;
    // Single-character dot segments (e.g. .t.e.)
    if (/\.[a-z0-9]\.[a-z0-9]\./.test(username)) return true;
  }
  return false;
}

// Check for automated headless scraping/script User-Agents
function isAutomatedBotAgent(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return true;
  const ua = userAgent.toLowerCase();
  const botSignatures = [
    'curl', 'python', 'requests', 'aiohttp', 'urllib', 'wget', 'httpie',
    'go-http-client', 'postman', 'headlesschrome', 'phantomjs', 'puppeteer',
    'playwright', 'selenium', 'scrapy', 'insomnia', 'apache-httpclient'
  ];
  return botSignatures.some(sig => ua.includes(sig));
}

// Robust Multi-Layer Anti-Spam & Bot Detection Engine
function isSpamSubmission(data, req) {
  if (!data || typeof data !== 'object') {
    return { isSpam: true, reason: 'Invalid or empty submission payload' };
  }

  // 1. User-Agent Bot Screening
  const userAgent = (req && req.headers ? req.headers['user-agent'] : '') || '';
  if (isAutomatedBotAgent(userAgent)) {
    return { isSpam: true, reason: 'Automated script / headless User-Agent detected' };
  }

  // 2. Multi-Field Honeypot Trap
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

  // 3. Gibberish Name / Company Detection (Blocks 'wARBhBuZnkELpXMnVGoV' and 'Lcvaicspbm')
  const clientName = String(data.name || data.author || '').trim();
  if (isGibberishString(clientName)) {
    return { isSpam: true, reason: 'Random gibberish string detected in name field' };
  }

  const companyName = String(data.company || data.agency || data.business || '').trim();
  if (isGibberishString(companyName)) {
    return { isSpam: true, reason: 'Random gibberish string detected in company field' };
  }

  // 4. Numeric-Only Inquiry Details / Message Defense (Blocks '7694127162')
  const rawMessage = String(data.message || data.description || data.comments || data.project_details || '').trim();
  if (isNumericOnlyMessage(rawMessage)) {
    return { isSpam: true, reason: 'Purely numeric gibberish inquiry details' };
  }

  // 5. Abusive Gmail Dot-Trick / Disposable Burner Email Filter
  const email = (data.email || '').toLowerCase().trim();
  if (email) {
    if (isDotAbuseEmail(email)) {
      return { isSpam: true, reason: 'Automated Gmail dot-trick burner address detected' };
    }

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

  // 6. Sub-Human Submission Timing & Browser Handshake Check
  // Legitimate users take at least 1.8 seconds to fill out an inquiry form.
  // Direct headless API calls omit the loaded timestamp or submit in milliseconds.
  const loadedAt = parseInt(data.form_loaded_at || data._ar_loaded_at, 10);
  const hasCaptchaToken = Boolean(data['cf-turnstile-response'] || data['g-recaptcha-response'] || data._ar_token);

  if (!isNaN(loadedAt) && loadedAt > 0) {
    const elapsedMs = Date.now() - loadedAt;
    if (elapsedMs < 1800 && elapsedMs > 0) {
      return { isSpam: true, reason: `Sub-human submission speed (${elapsedMs}ms)` };
    }
  } else if (!hasCaptchaToken && !data.is_newsletter) {
    // If no load timestamp AND no security token is present, it's a raw script invocation
    return { isSpam: true, reason: 'Direct automated submission without browser handshake' };
  }

  // 7. Excessive Link Spam Filter (SEO blast scripts frequently include 4+ URLs)
  const messageText = String(data.message || data.description || data.comments || '');
  const linkMatches = messageText.match(/https?:\/\/|www\./gi) || [];
  if (linkMatches.length >= 4) {
    return { isSpam: true, reason: `Excessive URL link density (${linkMatches.length} links found)` };
  }

  // 8. Signature Spam & Malicious Marketing Keywords
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

  // 9. Non-English Script Blast Check
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
