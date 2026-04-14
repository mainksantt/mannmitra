'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const Csrf = require('csrf');

const csrf = new Csrf();
const { requireAdminAuth, adminLogin, adminLogout } = require('../middleware/auth');
const { getAllBookings, updateBookingStatus } = require('../database');
const logger = require('../logger');

// ── GET /admin/login ───────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  const error = req.query.error === '1';
  const token = res.locals.csrfToken || '';
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Login — MannMitra</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1f3a;font-family:Arial,sans-serif}
    .card{background:#fff;border-radius:12px;padding:40px;width:340px;box-shadow:0 8px 32px rgba(0,0,0,.3)}
    h2{color:#1e3a5f;margin-bottom:24px;text-align:center}
    label{display:block;margin-bottom:6px;color:#555;font-size:14px}
    input{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:15px;margin-bottom:16px}
    button{width:100%;padding:12px;background:#1e3a5f;color:#fff;border:none;border-radius:6px;font-size:16px;cursor:pointer}
    button:hover{background:#2d5a8e}
    .error{background:#fee2e2;color:#b91c1c;padding:10px;border-radius:6px;margin-bottom:16px;font-size:14px;text-align:center}
  </style>
</head>
<body>
  <div class="card">
    <h2>🔒 Admin Login</h2>
    ${error ? '<div class="error">Incorrect password. Please try again.</div>' : ''}
    <form method="POST" action="/admin/login">
      <input type="hidden" name="_csrf" value="${token}">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autofocus placeholder="Enter admin password">
      <button type="submit">Login</button>
    </form>
  </div>
</body>
</html>`);
});

// ── CSRF validation middleware for admin form POSTs ───────────────────────────
function verifyCsrf(req, res, next) {
  const token = req.body._csrf;
  const secret = req.session && req.session.csrfSecret;
  if (!secret || !token || !csrf.verify(secret, token)) {
    logger.warn('CSRF validation failed', { ip: req.ip, url: req.originalUrl });
    return res.status(403).send('Invalid CSRF token. Please go back and try again.');
  }
  next();
}

// ── POST /admin/login ──────────────────────────────────────────────────────────
router.post('/login', express.urlencoded({ extended: false }), verifyCsrf, adminLogin);

// ── GET /admin/logout ──────────────────────────────────────────────────────────
router.get('/logout', adminLogout);

const { adminExportLimiter } = require('../middleware/rateLimit');

// ── All routes below require authentication ───────────────────────────────────
router.use(requireAdminAuth);

// ── GET /admin (dashboard) ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

// ── GET /admin/api/bookings ────────────────────────────────────────────────────
router.get('/api/bookings', (req, res, next) => {
  try {
    res.json(getAllBookings());
  } catch (err) {
    next(err);
  }
});

// ── PATCH /admin/api/bookings/:id/status ──────────────────────────────────────
router.patch('/api/bookings/:id/status', express.json(), (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Pending', 'Contacted', 'In Progress', 'Completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }
    const updated = updateBookingStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    logger.info('Booking status updated', { id, status });
    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
});

// ── GET /admin/api/bookings/export.csv ────────────────────────────────────────
router.get('/api/bookings/export.csv', adminExportLimiter, (req, res, next) => {
  try {
    const bookings = getAllBookings();
    const header = 'ID,Name,Email,Phone,Preferred Time,Message,Created At,Status';
    const rows = bookings.map(b =>
      [b.id, b.name, b.email, b.phone, b.preferredTime, b.message, b.createdAt, b.status]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
