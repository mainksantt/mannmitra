'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const ConnectSQLite3 = require('connect-sqlite3')(session);

const Csrf = require('csrf');
const csrf = new Csrf();

const config = require('./config');
const { getDb } = require('./database');
const logger = require('./logger');
const errorHandler = require('./middleware/errorHandler');
const { healthLimiter } = require('./middleware/rateLimit');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const wisdomRouter = require('./routes/wisdom');

const app = express();

// ── Security headers (helmet) ──────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(cors());

// ── Body parsers ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ────────────────────────────────────────────────────────────────
app.get('/health', healthLimiter, (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({ status: 'error' });
  }
});

// ── Session ────────────────────────────────────────────────────────────────────
const sessionStore = new ConnectSQLite3({
  db: config.databasePath.replace(/^\.\//, ''),
  table: 'sessions',
});

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
    },
    name: 'mm_sid',
  })
);

// ── CSRF protection for admin form submissions ─────────────────────────────────
app.use(async (req, res, next) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = await csrf.secret();
  }
  res.locals.csrfToken = csrf.create(req.session.csrfSecret);
  next();
});

// ── Request logger ─────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info('Request', { method: req.method, url: req.originalUrl, ip: req.ip });
  next();
});

// ── Static files ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);
app.use('/api/wisdom', wisdomRouter);
app.use('/admin', adminRouter);

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server (only when not imported by tests) ────────────────────────────
if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`MannMitra server running on http://localhost:${config.port}`);
  });
}

module.exports = app;
