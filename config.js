'use strict';

require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_PATH || './mannmitra.db',
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'MannMitra <noreply@mannmitra.in>',
    adminEmail: process.env.ADMIN_EMAIL || '',
  },
  adminPassword: process.env.ADMIN_PASSWORD || 'changeme123',
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
};
