'use strict';

const request = require('supertest');

function makeAdminApp() {
  const express = require('express');
  const adminRouter = require('../routes/admin');
  const errorHandler = require('../middleware/errorHandler');
  const app = express();
  app.use('/admin', adminRouter);
  app.use(errorHandler);
  return app;
}

describe('admin routes error handling', () => {
  test('serves dashboard HTML for authenticated requests', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth', () => ({
      requireAdminAuth: (_req, _res, next) => next(),
      adminLogin: jest.fn(),
      adminLogout: jest.fn(),
    }));
    const app = makeAdminApp();
    const res = await request(app).get('/admin/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Admin Dashboard');
  });

  test('returns 500 when getAllBookings throws', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth', () => ({
      requireAdminAuth: (_req, _res, next) => next(),
      adminLogin: jest.fn(),
      adminLogout: jest.fn(),
    }));
    jest.doMock('../database', () => ({
      getAllBookings: jest.fn(() => {
        throw new Error('db failure');
      }),
      updateBookingStatus: jest.fn(),
    }));
    const app = makeAdminApp();
    const res = await request(app).get('/admin/api/bookings');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 500 when updateBookingStatus throws', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth', () => ({
      requireAdminAuth: (_req, _res, next) => next(),
      adminLogin: jest.fn(),
      adminLogout: jest.fn(),
    }));
    jest.doMock('../database', () => ({
      getAllBookings: jest.fn(() => []),
      updateBookingStatus: jest.fn(() => {
        throw new Error('update failure');
      }),
    }));
    const app = makeAdminApp();
    const res = await request(app)
      .patch('/admin/api/bookings/abc/status')
      .send({ status: 'Pending' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 500 when export bookings throws', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth', () => ({
      requireAdminAuth: (_req, _res, next) => next(),
      adminLogin: jest.fn(),
      adminLogout: jest.fn(),
    }));
    jest.doMock('../database', () => ({
      getAllBookings: jest.fn(() => {
        throw new Error('export failure');
      }),
      updateBookingStatus: jest.fn(),
    }));
    const app = makeAdminApp();
    const res = await request(app).get('/admin/api/bookings/export.csv');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
