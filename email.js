'use strict';

const nodemailer = require('nodemailer');
const config = require('./config');
const logger = require('./logger');

function createTransport() {
  if (!config.email.user || !config.email.pass) {
    logger.warn('Email credentials not set — using test account stub');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

let transporter = createTransport();

/**
 * Send a booking confirmation to the user.
 * @param {object} booking
 */
async function sendUserConfirmation(booking) {
  if (!transporter) return;
  const mailOptions = {
    from: config.email.from,
    to: booking.email,
    subject: '🙏 Your MannMitra Session Request — Confirmation',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:32px;">
        <h2 style="color:#2d6a4f;">Namaste, ${booking.name}! 🙏</h2>
        <p>We have received your session request. A trained counsellor will reach out to you at <strong>${booking.email}</strong> or <strong>${booking.phone}</strong> within 24 hours.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Preferred Time</td><td style="padding:8px;border:1px solid #eee;">${booking.preferredTime}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Your Message</td><td style="padding:8px;border:1px solid #eee;">${booking.message || 'Not provided'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Status</td><td style="padding:8px;border:1px solid #eee;">${booking.status}</td></tr>
        </table>
        <p style="background:#f0fdf4;padding:12px;border-radius:6px;color:#166534;">
          🆘 <strong>In crisis right now?</strong> Please call <strong>iCall: 9152987821</strong> or <strong>Vandrevala Foundation: 1860-2662-345</strong> (24×7).
        </p>
        <p style="color:#888;font-size:12px;margin-top:24px;">You received this email because you submitted a request on MannMitra. If this wasn't you, please ignore this email.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    logger.info('User confirmation email sent', { to: booking.email });
  } catch (err) {
    logger.error('Failed to send user confirmation email', { error: err.message });
  }
}

/**
 * Notify the admin / counsellor about a new booking.
 * @param {object} booking
 */
async function sendAdminNotification(booking) {
  if (!transporter || !config.email.adminEmail) return;
  const mailOptions = {
    from: config.email.from,
    to: config.email.adminEmail,
    subject: `📋 New Booking — ${booking.name} [${booking.status}]`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:32px;">
        <h2 style="color:#1e3a5f;">New Booking Received</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Name</td><td style="padding:8px;border:1px solid #eee;">${booking.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border:1px solid #eee;">${booking.email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border:1px solid #eee;">${booking.phone}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Preferred Time</td><td style="padding:8px;border:1px solid #eee;">${booking.preferredTime}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Message</td><td style="padding:8px;border:1px solid #eee;">${booking.message || 'Not provided'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666;">Submitted At</td><td style="padding:8px;border:1px solid #eee;">${booking.createdAt}</td></tr>
        </table>
        <p style="margin-top:24px;"><a href="${process.env.BASE_URL || 'http://localhost:3000'}/admin" style="background:#1e3a5f;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">View Admin Dashboard</a></p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    logger.info('Admin notification email sent', { to: config.email.adminEmail });
  } catch (err) {
    logger.error('Failed to send admin notification email', { error: err.message });
  }
}

module.exports = { sendUserConfirmation, sendAdminNotification, createTransport };
