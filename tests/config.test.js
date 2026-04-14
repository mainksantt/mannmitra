'use strict';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.resetModules();
});

describe('config defaults', () => {
  test('uses default values when env vars are missing', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_PATH;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_FROM;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.SESSION_SECRET;

    jest.resetModules();
    const config = require('../config');

    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.databasePath).toBe('./mannmitra.db');
    expect(config.email.user).toBe('');
    expect(config.email.pass).toBe('');
    expect(config.email.from).toBe('MannMitra <noreply@mannmitra.in>');
    expect(config.email.adminEmail).toBe('');
    expect(config.adminPassword).toBe('changeme123');
    expect(config.sessionSecret).toBe('default-secret-change-in-production');
  });
});

describe('config environment overrides', () => {
  test('reads values from environment variables', () => {
    process.env.PORT = '8080';
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_PATH = '/tmp/test.db';
    process.env.EMAIL_USER = 'user@example.com';
    process.env.EMAIL_PASS = 'pass123';
    process.env.EMAIL_FROM = 'MannMitra <support@mannmitra.in>';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_PASSWORD = 'supersecret';
    process.env.SESSION_SECRET = 'session-secret';

    jest.resetModules();
    const config = require('../config');

    expect(config.port).toBe(8080);
    expect(config.nodeEnv).toBe('production');
    expect(config.databasePath).toBe('/tmp/test.db');
    expect(config.email.user).toBe('user@example.com');
    expect(config.email.pass).toBe('pass123');
    expect(config.email.from).toBe('MannMitra <support@mannmitra.in>');
    expect(config.email.adminEmail).toBe('admin@example.com');
    expect(config.adminPassword).toBe('supersecret');
    expect(config.sessionSecret).toBe('session-secret');
  });
});
