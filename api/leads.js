// Vercel Serverless Function: api/leads.js
// Provides secure API for Centralized Submission Dashboard, lead retrieval, CSV export, and status management.

'use strict';

const { applySecurityHeaders, verifyCsrfAndOrigin, checkRateLimit, getClientIp } = require('./_security');
const { getAllLeads, updateLeadStatus, deleteLead } = require('./_db');

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

  if (req.method === 'GET') {
    let leads = getAllLeads();

    // Query filter by page
    const pageFilter = req.query?.page;
    if (pageFilter) {
      leads = leads.filter(l => (l.pageUrl || '').toLowerCase().includes(pageFilter.toLowerCase()));
    }

    // Query search
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

    // Export format check
    if (req.query?.format === 'csv') {
      const csvData = convertToCsv(leads);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="arwebcrafts_leads_${new Date().toISOString().slice(0, 10)}.csv"`);
      return res.status(200).send(csvData);
    }

    // Compute metrics
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

  if (req.method === 'PATCH' || req.method === 'POST') {
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

  return res.status(405).json({ error: 'Method not allowed.' });
};
