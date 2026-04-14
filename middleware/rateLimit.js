'use strict';

const rateLimit = require('express-rate-limit');
const logger = require('../logger');

/**
 * Rate limiter for /api/chat — 50 requests per minute per IP.
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    logger.warn('Chat rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      error: 'Too many requests — please slow down and try again in a minute.',
    });
  },
});

/**
 * Rate limiter for /api/book — 5 submissions per hour per IP.
 */
const bookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    logger.warn('Booking rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      error: 'Too many booking attempts — please try again in an hour.',
    });
  },
});

/**
 * Rate limiter for admin export — 20 exports per hour per IP.
 */
const adminExportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    logger.warn('Admin export rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      error: 'Too many export requests — please try again later.',
    });
  },
});

/**
 * Rate limiter for /api/wisdom — 100 requests per minute per IP.
 */
const wisdomLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    logger.warn('Wisdom rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      error: 'Too many requests — please slow down and try again in a minute.',
    });
  },
});

/**
 * Rate limiter for /health - 600 requests per minute per IP.
 */
const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    logger.warn('Health check rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      error: 'Too many requests — please try again shortly.',
    });
  },
});

module.exports = { chatLimiter, bookLimiter, adminExportLimiter, wisdomLimiter, healthLimiter };
