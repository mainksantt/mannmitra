'use strict';

const config = require('../config');

/**
 * Middleware: protect admin routes with a simple session-based password.
 */
function requireAdminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  // For API calls return JSON; for page loads redirect to login
  const wantsJson =
    req.headers.accept && req.headers.accept.includes('application/json');
  if (wantsJson) {
    return res.status(401).json({ error: 'Unauthorized — please log in.' });
  }
  return res.redirect('/admin/login');
}

/**
 * Process admin login form submission.
 */
function adminLogin(req, res) {
  const { password } = req.body;
  if (password === config.adminPassword) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  return res.redirect('/admin/login?error=1');
}

/**
 * Destroy the admin session.
 */
function adminLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
}

module.exports = { requireAdminAuth, adminLogin, adminLogout };
