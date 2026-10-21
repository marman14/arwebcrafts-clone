// Vercel Serverless Function: api/leads.js
// Proxies to unified contact/leads handler sharing the exact same memory and persistence store.

'use strict';

const contactHandler = require('./contact');

module.exports = async (req, res) => {
  return contactHandler(req, res);
};
