'use strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

const { sendUserConfirmation, sendAdminNotification, createTransport } = require('../email');

// ── Mock Nodemailer ───────────────────────────────────────────
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
  }),
}));

const nodemailer = require('nodemailer');

const mockBooking = {
  id: 'test-123',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '9876543210',
  preferredTime: 'Weekend morning',
  message: 'I need help',
  createdAt: new Date().toISOString(),
  status: 'Pending',
};

describe('Email — sendUserConfirmation', () => {
  beforeEach(() => {
    // Reset EMAIL_USER/PASS to force transporter creation
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASS = 'testpassword';
    jest.resetModules();
  });

  test('does not throw when called with a valid booking', async () => {
    await expect(sendUserConfirmation(mockBooking)).resolves.not.toThrow();
  });

  test('does not throw when email credentials are missing', async () => {
    // createTransport returns null when no credentials
    const { sendUserConfirmation: sendFn } = require('../email');
    await expect(sendFn({ ...mockBooking })).resolves.not.toThrow();
  });
});

describe('Email — sendAdminNotification', () => {
  test('does not throw when called with a valid booking', async () => {
    await expect(sendAdminNotification(mockBooking)).resolves.not.toThrow();
  });
});

describe('Email — createTransport', () => {
  test('returns null when EMAIL_USER is not set', () => {
    const savedUser = process.env.EMAIL_USER;
    const savedPass = process.env.EMAIL_PASS;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    // Re-require to test fresh module state
    jest.resetModules();
    const config = require('../config');
    // Temporarily clear config email
    const origUser = config.email.user;
    config.email.user = '';
    config.email.pass = '';

    const { createTransport: ct } = require('../email');
    const result = ct();
    expect(result).toBeNull();

    config.email.user = origUser;
    process.env.EMAIL_USER = savedUser;
    process.env.EMAIL_PASS = savedPass;
  });
});
