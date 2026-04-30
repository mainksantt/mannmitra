'use strict';

const path = require('path');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// Vercel and other serverless platforms have a read-only filesystem;
// skip file transports to avoid EROFS crashes.
const isServerless = process.env.VERCEL === '1' || process.env.SERVERLESS === '1';
const logsDir = path.join(__dirname, 'logs');

const loggerTransports = [];

if (!isServerless) {
  loggerTransports.push(
    // Daily rotating file for all logs
    new transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    // Separate file for errors only
    new transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      zippedArchive: true,
    })
  );
}

// Always log to console (required on serverless where file logging is unavailable)
loggerTransports.push(
  new transports.Console({
    format: process.env.NODE_ENV !== 'production'
      ? format.combine(format.colorize(), format.simple())
      : format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
  })
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: loggerTransports,
});

module.exports = logger;
