'use strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

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

describe('Email module', () => {
  let sendMail;
  let logger;
  let email;
  let nodemailer;

  function loadEmailModule({
    emailUser = 'test@gmail.com',
    emailPass = 'testpassword',
    adminEmail = 'admin@example.com',
    sendMailImpl = async () => ({ messageId: 'mock-id' }),
  } = {}) {
    jest.resetModules();
    process.env.EMAIL_USER = emailUser;
    process.env.EMAIL_PASS = emailPass;
    process.env.ADMIN_EMAIL = adminEmail;

    sendMail = jest.fn(sendMailImpl);
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({ sendMail })),
    }));
    jest.doMock('../logger', () => logger);

    email = require('../email');
    nodemailer = require('nodemailer');
  }

  test('createTransport returns null and logs warning when credentials are missing', () => {
    loadEmailModule({ emailUser: '', emailPass: '' });

    const transport = email.createTransport();
    expect(transport).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith('Email credentials not set — using test account stub');
  });

  test('createTransport builds a gmail transport when credentials are present', () => {
    loadEmailModule({ emailUser: 'mailer@example.com', emailPass: 'secret' });

    email.createTransport();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'mailer@example.com',
        pass: 'secret',
      },
    });
  });

  test('sendUserConfirmation sends mail and includes fallback text for empty message', async () => {
    loadEmailModule();

    await email.sendUserConfirmation({ ...mockBooking, message: '' });

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toBe('priya@example.com');
    expect(sendMail.mock.calls[0][0].html).toContain('Not provided');
    expect(logger.info).toHaveBeenCalledWith('User confirmation email sent', { to: 'priya@example.com' });
  });

  test('sendUserConfirmation logs errors from transporter.sendMail', async () => {
    loadEmailModule({
      sendMailImpl: async () => {
        throw new Error('smtp failure');
      },
    });

    await expect(email.sendUserConfirmation(mockBooking)).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith('Failed to send user confirmation email', { error: 'smtp failure' });
  });

  test('sendAdminNotification returns early when admin email is not configured', async () => {
    loadEmailModule({ adminEmail: '' });

    await email.sendAdminNotification(mockBooking);
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('sendAdminNotification sends admin mail and includes fallback text for empty message', async () => {
    loadEmailModule({ adminEmail: 'counsellor@example.com' });

    await email.sendAdminNotification({ ...mockBooking, message: '' });

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toBe('counsellor@example.com');
    expect(sendMail.mock.calls[0][0].html).toContain('Not provided');
    expect(logger.info).toHaveBeenCalledWith('Admin notification email sent', { bookingId: 'test-123' });
  });

  test('sendAdminNotification logs errors from transporter.sendMail', async () => {
    loadEmailModule({
      adminEmail: 'counsellor@example.com',
      sendMailImpl: async () => {
        throw new Error('admin smtp failure');
      },
    });

    await expect(email.sendAdminNotification(mockBooking)).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith('Failed to send admin notification email', { error: 'admin smtp failure' });
  });
});
