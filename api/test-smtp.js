// Vercel Serverless Function: api/test-smtp.js
// Hostinger SMTP Connection & Authentication Diagnostic Tool

'use strict';

const nodemailer = require('nodemailer');
const { applySecurityHeaders } = require('./_security');

module.exports = async (req, res) => {
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const pin = query.pin || (req.body && req.body.pin) || '';

  // Security PIN check to prevent unauthorized diagnostic pings
  if (pin !== '9824' && pin !== '7860') {
    return res.status(403).json({
      error: 'Access Denied: Please provide valid security PIN (?pin=9824)',
      service: 'AR Webcrafts Hostinger SMTP Diagnostics'
    });
  }

  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_PORT === '587' ? false : true;
  const user = process.env.SMTP_USER || 'contact@arwebcrafts.com';
  const pass = query.pass || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';

  const diagnostic = {
    timestamp: new Date().toISOString(),
    server: 'Vercel Serverless Function',
    smtpHost: host,
    smtpPort: port,
    smtpSecure: secure ? 'SSL (Port 465)' : 'TLS (Port 587)',
    smtpUser: user,
    passwordConfigured: Boolean(pass),
    connectionStatus: 'pending'
  };

  if (!pass) {
    diagnostic.connectionStatus = 'unconfigured';
    diagnostic.instructions = 'SMTP_PASS environment variable is not yet set in Vercel. Set SMTP_PASS in Vercel Dashboard -> Settings -> Environment Variables, or pass ?pin=9824&pass=YOUR_PASSWORD to test.';
    return res.status(200).json(diagnostic);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 8000
    });

    // Verify SMTP connection and auth credentials with Hostinger
    await transporter.verify();

    diagnostic.connectionStatus = 'SUCCESS';
    diagnostic.message = `Successfully authenticated with Hostinger SMTP server (${host}:${port}) for ${user}!`;

    // If send=true is requested, send an actual test email
    if (query.send === 'true' || query.send === true) {
      const info = await transporter.sendMail({
        from: `"AR Webcrafts Diagnostic" <${user}>`,
        to: user,
        subject: `[Diagnostic] Hostinger SMTP Test - ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: sans-serif; background: #071527; color: #FFFFFF; padding: 24px; border-radius: 8px;">
            <h2 style="color: #C89D4B;">Hostinger SMTP Operational</h2>
            <p>Your website on Vercel has successfully connected to Hostinger SMTP and delivered this email to <strong>${user}</strong>.</p>
            <p><strong>Host:</strong> ${host}:${port}<br><strong>User:</strong> ${user}<br><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      });
      diagnostic.testEmailSent = true;
      diagnostic.messageId = info.messageId;
    }

    return res.status(200).json(diagnostic);
  } catch (err) {
    diagnostic.connectionStatus = 'FAILED';
    diagnostic.error = err.message;
    diagnostic.troubleshooting = 'Check whether the mailbox password for ' + user + ' is exact, or if Hostinger requires an Application Password or unlocking.';
    return res.status(500).json(diagnostic);
  }
};
