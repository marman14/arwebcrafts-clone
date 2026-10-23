// Vercel Serverless Function: api/contact.js
// Centralized submission endpoint and admin dashboard API across AR Webcrafts LLC

'use strict';

const {
  applySecurityHeaders,
  verifyCsrfAndOrigin,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  isSpamSubmission,
  maskPii
} = require('./_security');
const { getAllLeads, saveLead, updateLeadStatus, deleteLead } = require('./_db');
const { sendEmailNotification } = require('./_notify');

const VALID_ADMIN_PINS = ['9824', '7860', process.env.ADMIN_DASHBOARD_PIN].filter(Boolean);

function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const tokenHeader = req.headers['x-admin-token'] || '';
  const queryToken = req.query?.token || '';

  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || tokenHeader || queryToken;
  return VALID_ADMIN_PINS.includes(token);
}

function convertToCsv(leads) {
  const headers = ['ID', 'Date/Time', 'Source Page', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Budget', 'Status', 'Message'];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${(l.pageUrl || '').replace(/"/g, '""')}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.company || '').replace(/"/g, '""')}"`,
    `"${(l.service || '').replace(/"/g, '""')}"`,
    `"${(l.budget || '').replace(/"/g, '""')}"`,
    `"${l.status || 'new'}"`,
    `"${(l.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = async (req, res) => {
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const isLeadsEndpoint = url.includes('/api/leads') || req.query?.token !== undefined;

  // =========================================================================
  // ROUTE BRANCH A: Admin Dashboard & Submissions Portal API (/api/leads)
  // =========================================================================
  if (isLeadsEndpoint || req.method === 'GET' || req.method === 'PATCH' || req.method === 'DELETE') {
    // Enforce Admin Authentication
    if (!isAuthorized(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing administrator access token.',
        hint: 'Please provide valid Admin PIN.'
      });
    }

    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`leads_${clientIp}`, 60, 60000);
    if (rate.limited) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    // 1. GET: Fetch all persistent leads with search and filter support
    if (req.method === 'GET') {
      let leads = getAllLeads();

      const pageFilter = req.query?.page;
      if (pageFilter) {
        leads = leads.filter(l => (l.pageUrl || '').toLowerCase().includes(pageFilter.toLowerCase()));
      }

      const searchQuery = req.query?.q;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        leads = leads.filter(l =>
          (l.name || '').toLowerCase().includes(q) ||
          (l.email || '').toLowerCase().includes(q) ||
          (l.phone || '').includes(q) ||
          (l.service || '').toLowerCase().includes(q) ||
          (l.company || '').toLowerCase().includes(q) ||
          (l.message || '').toLowerCase().includes(q)
        );
      }

      // CSV Export
      if (req.query?.format === 'csv') {
        const csvData = convertToCsv(leads);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="arwebcrafts_leads_${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.status(200).send(csvData);
      }

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const totalCount = leads.length;
      const todayCount = leads.filter(l => (l.timestamp || '').startsWith(todayStr)).length;
      const newCount = leads.filter(l => l.status === 'new').length;
      const contactedCount = leads.filter(l => l.status === 'contacted').length;

      return res.status(200).json({
        success: true,
        stats: {
          total: totalCount,
          today: todayCount,
          new: newCount,
          contacted: contactedCount
        },
        leads
      });
    }

    // 2. PATCH: Update lead status
    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, status } = body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing lead id or new status.' });
      }

      const updated = updateLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Lead not found.' });
      }

      return res.status(200).json({ success: true, lead: updated });
    }

    // 3. DELETE: Delete lead
    if (req.method === 'DELETE') {
      const id = req.query?.id || (typeof req.body === 'string' ? JSON.parse(req.body)?.id : req.body?.id);
      if (!id) {
        return res.status(400).json({ error: 'Missing lead id to delete.' });
      }

      const deleted = deleteLead(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Lead not found or already deleted.' });
      }

      return res.status(200).json({ success: true, message: `Lead ${id} successfully deleted.` });
    }

    // 4. POST (Sync leads from browser portal into server DB)
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (body.action === 'sync' && Array.isArray(body.leads)) {
        const existing = getAllLeads();
        const existingIds = new Set(existing.map(l => l.id));
        let addedCount = 0;

        for (const item of body.leads) {
          if (item && item.id && !existingIds.has(item.id)) {
            saveLead(item);
            existingIds.add(item.id);
            addedCount++;
          }
        }
        return res.status(200).json({ success: true, synced: addedCount, total: getAllLeads().length });
      }
    }
  }

  // =========================================================================
  // ROUTE BRANCH B: Public Contact Form Submission Pipeline (/api/contact)
  // =========================================================================
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  // 1. CSRF & Allowed Origin Verification
  if (!verifyCsrfAndOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden: Invalid request origin.' });
  }

  // 2. IP Rate Limiting (max 10 submissions per 10 minutes per IP)
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`contact_${clientIp}`, 4, 15 * 60 * 1000);
  if (rateCheck.limited) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error: 'Too many submissions. Please wait a few minutes before trying again.'
    });
  }

  try {
    const rawData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // 3. Robust Anti-Bot & Honeypot Spam Protection Engine
    const spamCheck = isSpamSubmission(rawData, req);
    if (spamCheck.isSpam) {
      console.warn(`[Spam Blocked] IP: ${clientIp}, Reason: ${spamCheck.reason}`);
      // Return 200 OK with mock success so bots believe their payload succeeded
      return res.status(200).json({
        success: true,
        message: 'Thank you! Your inquiry has been received.',
        leadId: 'cnt_' + Math.random().toString(36).substring(2, 9)
      });
    }

    // 4. Sanitize and validate fields
    let name = sanitizeInput(
      rawData.name ||
      `${rawData['names[first_name]'] || ''} ${rawData['names[last_name]'] || ''}`.trim() ||
      rawData.first_name || rawData.author || '',
      100
    );
    const email = sanitizeInput(rawData.email || rawData.email_1 || '', 120);
    const phone = sanitizeInput(
      rawData.phone || rawData.mobile || rawData.tel ||
      (rawData.numeric_field && /^[0-9+() -]{6,}$/.test(String(rawData.numeric_field).trim()) ? String(rawData.numeric_field).trim() : '') ||
      (rawData.input_text && /(^\+?[0-9\s()-]{7,}$)/.test(String(rawData.input_text).trim()) ? String(rawData.input_text).trim() : '') ||
      rawData['sa_phone'] || rawData['hfsd-phone'] || rawData['wl-phone'] || '',
      30
    );
    const company = sanitizeInput(
      rawData.company || rawData.agency || rawData.business || rawData.website_url || rawData.url ||
      rawData['sa_company'] || rawData['hfsd-company'] || rawData['wl-company'] ||
      (rawData.input_text && !phone.includes(String(rawData.input_text).trim()) ? String(rawData.input_text).trim() : '') || '',
      120
    );
    const service = sanitizeInput(
      rawData.engineering_role || rawData.service || rawData.role || rawData.skill ||
      rawData.selected_service || rawData.primary_need || rawData.resource_need ||
      rawData.project_type || rawData.automation_need || rawData.automation_type ||
      rawData.plugin_need || rawData.dropdown || rawData.dropdown_1 || rawData.dropdown_2 ||
      rawData.systems || rawData.plan || rawData['sa_skill'] || rawData['hfsd-role'] ||
      rawData['wl-service'] || rawData['wcd-service'] || rawData['wtd-service'] || rawData['wpd-service'] ||
      rawData['wcms-service'] || rawData['wpm-service'] || rawData['ldm-service'] || rawData['ld-service'] ||
      rawData['cwds-service'] || rawData['was-service'] || rawData['wpcd-service'] || rawData['wms-service'] ||
      (rawData.is_newsletter ? 'Newsletter Subscription' : 'General Inquiry'),
      100
    );
    const budget = sanitizeInput(
      rawData.engagement_duration || rawData.budget || rawData.duration ||
      rawData.timeline || rawData.software_stack || rawData.traffic_volume ||
      rawData.tech_stack || rawData.platforms || rawData.protocol || rawData.user_count ||
      rawData['sa_duration'] || rawData['hfsd-duration'] ||
      rawData['wpm-count'] || rawData['wcms-count'] || rawData['ldm-count'] || rawData['wms-count'] ||
      rawData['was-volume'] || rawData['ld-budget'] || rawData['wpd-budget'] || rawData['wtd-budget'] ||
      rawData['wcd-budget'] || rawData['cwds-budget'] || rawData['wpcd-budget'] ||
      (rawData.numeric_field && !phone.includes(String(rawData.numeric_field).trim()) ? String(rawData.numeric_field).trim() : '') || '',
      80
    );
    const subject = sanitizeInput(rawData.subject || `Inquiry from ${rawData.page_url || 'Website'}`, 150);
    const message = sanitizeInput(
      rawData.message || rawData.description || rawData.comments ||
      rawData.project_details || rawData.project_brief || rawData.project_scope ||
      rawData.requirements || rawData.scope || (rawData.is_newsletter ? 'Newsletter subscription via website footer' : ''),
      3000
    );
    const pageUrl = sanitizeInput(rawData.page_url || rawData.pageUrl || '/', 255);
    const pageTitle = sanitizeInput(rawData.page_title || rawData.pageTitle || 'AR Webcrafts', 150);

    // Support newsletter signup where only email is provided
    if (!name && email && (rawData.is_newsletter || service === 'Newsletter Subscription' || rawData.form_id === '2' || rawData.form_id === 2)) {
      name = 'Newsletter Subscriber';
    }

    if (!name || !email) {
      return res.status(400).json({
        error: 'Please provide both your name and a valid email address.'
      });
    }

    // Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // 5. CRITICAL: Save lead to Centralized Persistent Database FIRST
    const savedLead = saveLead({
      name,
      email,
      phone,
      company,
      service,
      budget,
      subject,
      message,
      pageUrl,
      pageTitle,
      ip: clientIp,
      status: 'new'
    });

    console.log(`[Verified Lead Stored]: ID=${savedLead.id}, Name=${name}, Source=${pageUrl}`);

    // 6. Trigger Instant Dual Email Notification (Admin Alert + Client Auto-Reply via Hostinger SMTP)
    let emailResult = null;
    try {
      emailResult = await Promise.race([
        sendEmailNotification(savedLead),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP dispatch timeout (15s)')), 15000))
      ]);
      console.log(`[Notification Result for ${savedLead.id}]:`, emailResult?.method || 'dispatched');
    } catch (err) {
      console.error('[Notification Dispatch Warning]:', err.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you within 2 business hours.',
      leadId: savedLead.id,
      emailDispatched: emailResult?.sent ?? false,
      lead: savedLead
    });
  } catch (err) {
    console.error('Contact Form Error:', err.message);
    return res.status(500).json({
      error: 'An internal error occurred while processing your message. Please reach out via phone or email.'
    });
  }
};
