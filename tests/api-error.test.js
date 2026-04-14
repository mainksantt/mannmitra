'use strict';

const request = require('supertest');

function makeApiApp() {
  const express = require('express');
  const apiRouter = require('../routes/api');
  const errorHandler = require('../middleware/errorHandler');
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandler);
  return app;
}

const validBooking = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '9876543210',
};

describe('api route error handling', () => {
  test('bubbles errors from chat handler', async () => {
    jest.resetModules();
    const logger = require('../logger');
    jest.spyOn(logger, 'info').mockImplementation(() => {
      throw new Error('log failure');
    });
    const app = makeApiApp();
    const res = await request(app).post('/api/chat').send({ message: 'hello' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    logger.info.mockRestore();
  });

  test('returns 500 when insertBooking throws', async () => {
    jest.resetModules();
    jest.doMock('../database', () => ({
      insertBooking: jest.fn(() => {
        throw new Error('db failure');
      }),
      bookingExistsByEmail: jest.fn(),
      getAllBookings: jest.fn(),
    }));
    jest.doMock('../email', () => ({
      sendUserConfirmation: jest.fn().mockResolvedValue(undefined),
      sendAdminNotification: jest.fn().mockResolvedValue(undefined),
    }));
    const app = makeApiApp();
    const res = await request(app).post('/api/book').send(validBooking);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('logs email failures from booking requests', async () => {
    jest.resetModules();
    const errorSpy = jest.fn();
    jest.doMock('../logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: errorSpy,
    }));
    jest.doMock('../database', () => ({
      insertBooking: jest.fn(),
      bookingExistsByEmail: jest.fn(),
      getAllBookings: jest.fn(),
    }));
    jest.doMock('../email', () => ({
      sendUserConfirmation: jest.fn().mockRejectedValue(new Error('user fail')),
      sendAdminNotification: jest.fn().mockRejectedValue(new Error('admin fail')),
    }));
    const app = makeApiApp();
    const res = await request(app).post('/api/book').send(validBooking);
    expect(res.status).toBe(200);
    await new Promise(resolve => setImmediate(resolve));
    expect(errorSpy).toHaveBeenCalledWith('User confirmation email failed', { error: 'user fail' });
    expect(errorSpy).toHaveBeenCalledWith('Admin notification email failed', { error: 'admin fail' });
  });

  test('returns 500 when getAllBookings throws', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth', () => ({
      requireAdminAuth: (_req, _res, next) => next(),
    }));
    jest.doMock('../database', () => ({
      insertBooking: jest.fn(),
      bookingExistsByEmail: jest.fn(),
      getAllBookings: jest.fn(() => {
        throw new Error('db failure');
      }),
    }));
    const app = makeApiApp();
    const res = await request(app)
      .get('/api/bookings')
      .set('Accept', 'application/json');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
