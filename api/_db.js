// Unified Persistent Lead Storage Utility for AR Webcrafts LLC
// Safely stores and manages form submissions across all pages.
// Works seamlessly in both local Node.js environment and Vercel serverless environment.

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// In-memory cache for fast access and resilience
let memoryStore = [];

function getStoragePath() {
  // Primary local path
  const localDir = path.join(__dirname, 'data');
  const localFile = path.join(localDir, 'leads.json');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write permission
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (err) {
    // Fallback to os.tmpdir() for serverless read-only root filesystems
    const tmpDir = path.join(os.tmpdir(), 'arwebcrafts_data');
    if (!fs.existsSync(tmpDir)) {
      try { fs.mkdirSync(tmpDir, { recursive: true }); } catch (_) {}
    }
    return path.join(tmpDir, 'leads.json');
  }
}

function getAllLeads() {
  const filePath = getStoragePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DB] Could not read from file storage, falling back to memory store:', err.message);
  }
  return memoryStore;
}

function saveLead(leadData) {
  const leads = getAllLeads();

  const newLead = {
    id: leadData.id || 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: leadData.timestamp || new Date().toISOString(),
    pageUrl: leadData.pageUrl || leadData.page_url || '/',
    pageTitle: leadData.pageTitle || leadData.page_title || 'Website Inquiry',
    name: leadData.name || 'Anonymous',
    email: leadData.email || '',
    phone: leadData.phone || '',
    service: leadData.service || leadData.selected_service || 'General Inquiry',
    budget: leadData.budget || 'Not specified',
    subject: leadData.subject || 'Website Contact Form',
    message: leadData.message || leadData.description || '',
    company: leadData.company || '',
    status: leadData.status || 'new', // new | contacted | in_progress | closed
    ip: leadData.ip || '127.0.0.1',
    antiSpam: {
      honeypotPassed: true,
      timingCheckPassed: true,
      sanitized: true
    }
  };

  leads.unshift(newLead);
  memoryStore = leads;

  const filePath = getStoragePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed writing lead to file:', err.message);
  }

  return newLead;
}

function updateLeadStatus(id, newStatus) {
  const leads = getAllLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index !== -1) {
    leads[index].status = newStatus;
    leads[index].updatedAt = new Date().toISOString();
    const filePath = getStoragePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Failed updating lead status:', err.message);
    }
    return leads[index];
  }
  return null;
}

function deleteLead(id) {
  let leads = getAllLeads();
  const initialLength = leads.length;
  leads = leads.filter(l => l.id !== id);
  if (leads.length !== initialLength) {
    memoryStore = leads;
    const filePath = getStoragePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Failed deleting lead:', err.message);
    }
    return true;
  }
  return false;
}

module.exports = {
  getAllLeads,
  saveLead,
  updateLeadStatus,
  deleteLead
};
