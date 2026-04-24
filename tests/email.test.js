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

function loadEmailModule({
  configOverrides = {},
  sendMailImpl = jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
} = {}) {
  jest.resetModules();

  const baseConfig = {
    email: {
      user: 'test@gmail.com',
      pass: 'testpassword',
      from: 'MannMitra <noreply@mannmitra.in>',
      adminEmail: 'admin@mannmitra.in',
    },
  };
  const mockConfig = {
    ...baseConfig,
    ...configOverrides,
    email: {
      ...baseConfig.email,
      ...(configOverrides.email || {}),
    },
  };

  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const sendMail = sendMailImpl;
  const createTransport = jest.fn(() => ({ sendMail }));
  const nodemailer = { createTransport };

  jest.doMock('../config', () => mockConfig);
  jest.doMock('../logger', () => logger);
  jest.doMock('nodemailer', () => nodemailer);

  // eslint-disable-next-line global-require
  const email = require('../email');

  return {
    ...email,
    config: mockConfig,
    logger,
    nodemailer,
    sendMail,
  };
}

describe('Email module', () => {
  test('createTransport returns null and logs warning when credentials are missing', () => {
    const { createTransport, nodemailer, logger } = loadEmailModule({
      configOverrides: { email: { user: '', pass: '' } },
    });

    const result = createTransport();

    expect(result).toBeNull();
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Email credentials not set — using test account stub');
  });

  test('createTransport builds nodemailer transport when credentials are present', () => {
    const { createTransport, nodemailer } = loadEmailModule();

    const result = createTransport();

    expect(result).toBeTruthy();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'test@gmail.com', pass: 'testpassword' },
    });
  });

  test('sendUserConfirmation sends email and logs success', async () => {
    const { sendUserConfirmation, sendMail, logger } = loadEmailModule();

    await sendUserConfirmation(mockBooking);

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0]).toMatchObject({
      to: mockBooking.email,
      from: expect.stringContaining('noreply'),
      subject: expect.stringContaining('Confirmation'),
    });
    expect(logger.info).toHaveBeenCalledWith('User confirmation email sent', { to: mockBooking.email });
  });

  test('sendUserConfirmation logs failure when transporter throws', async () => {
    const failingSendMail = jest.fn().mockRejectedValue(new Error('smtp failed'));
    const { sendUserConfirmation, logger } = loadEmailModule({ sendMailImpl: failingSendMail });

    await sendUserConfirmation(mockBooking);

    expect(logger.error).toHaveBeenCalledWith('Failed to send user confirmation email', {
      error: 'smtp failed',
    });
  });

  test('sendAdminNotification returns early when admin email is missing', async () => {
    const { sendAdminNotification, sendMail } = loadEmailModule({
      configOverrides: { email: { adminEmail: '' } },
    });

    const result = await sendAdminNotification(mockBooking);

    expect(result).toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('sendAdminNotification warns and returns null when credentials are missing', async () => {
    const { sendAdminNotification, logger, sendMail, config } = loadEmailModule();
    config.email.user = '';
    config.email.pass = '';

    const result = await sendAdminNotification(mockBooking);

    expect(result).toBeNull();
    expect(sendMail).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Email credentials not set — using test account stub');
  });
});
