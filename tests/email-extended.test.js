'use strict';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const mockBooking = {
  id: 'test-456',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '9876543210',
  preferredTime: 'Weekend morning',
  message: 'I need help',
  createdAt: new Date().toISOString(),
  status: 'Pending',
};

function setupEmailModule({ sendMailImpl, adminEmail = 'admin@example.com' }) {
  jest.resetModules();
  process.env.EMAIL_USER = 'test@gmail.com';
  process.env.EMAIL_PASS = 'testpassword';
  process.env.ADMIN_EMAIL = adminEmail;
  const nodemailer = require('nodemailer');
  nodemailer.createTransport.mockReturnValue({ sendMail: sendMailImpl });
  const logger = require('../logger');
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  const email = require('../email');
  return { email, logger };
}

describe('email error handling', () => {
  test('logs failures when user confirmation email fails', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('smtp fail'));
    const { email, logger } = setupEmailModule({ sendMailImpl: sendMail });
    await email.sendUserConfirmation(mockBooking);
    expect(logger.error).toHaveBeenCalledWith('Failed to send user confirmation email', {
      error: 'smtp fail',
    });
  });

  test('sends admin notification when admin email is configured', async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: 'ok' });
    const { email } = setupEmailModule({ sendMailImpl: sendMail });
    await email.sendAdminNotification(mockBooking);
    expect(sendMail).toHaveBeenCalled();
    const args = sendMail.mock.calls[0][0];
    expect(args.to).toBe('admin@example.com');
  });

  test('logs failures when admin notification fails', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('admin fail'));
    const { email, logger } = setupEmailModule({ sendMailImpl: sendMail });
    await email.sendAdminNotification(mockBooking);
    expect(logger.error).toHaveBeenCalledWith('Failed to send admin notification email', {
      error: 'admin fail',
    });
  });
});
