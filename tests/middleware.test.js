'use strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

// ── sanitize.js — stripTags ───────────────────────────────────────────────────

// stripTags is not exported directly; test it via the exported validation chains
// by sending requests, but we can also reach it via a small internal require trick.
// Since it's a module-internal function we test its behaviour through the API.

// For pure unit coverage we re-implement the module contract here using the same
// logic path tested through the validation middleware in api.test.js.  The tests
// below focus on the standalone helper behaviour.

const { chatValidation, bookingValidation, handleValidationErrors } = require('../middleware/sanitize');

// Build a tiny express app to exercise the middleware in isolation
const express = require('express');

function makeApp(validation) {
  const app = express();
  app.use(express.json());
  app.post('/test', validation, handleValidationErrors, (req, res) => {
    res.json({ body: req.body });
  });
  return app;
}

const request = require('supertest');

describe('sanitize — chatValidation', () => {
  const chatApp = makeApp(chatValidation);

  test('strips HTML tags from message', async () => {
    const res = await request(chatApp)
      .post('/test')
      .send({ message: '<b>bold</b> text' });

    expect(res.status).toBe(200);
    expect(res.body.body.message).toBe('bold text');
  });

  test('strips nested/partial HTML tags', async () => {
    const res = await request(chatApp)
      .post('/test')
      .send({ message: '<<b>script>' });

    expect(res.status).toBe(200);
    expect(res.body.body.message).not.toMatch(/<[^>]*>/);
  });

  test('passes through plain text unchanged', async () => {
    const res = await request(chatApp)
      .post('/test')
      .send({ message: 'plain text message' });

    expect(res.status).toBe(200);
    expect(res.body.body.message).toBe('plain text message');
  });

  test('rejects empty message with 422', async () => {
    const res = await request(chatApp)
      .post('/test')
      .send({ message: '' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  test('rejects message over 2000 characters with 422', async () => {
    const res = await request(chatApp)
      .post('/test')
      .send({ message: 'x'.repeat(2001) });

    expect(res.status).toBe(422);
  });

  test('accepts message of exactly 2000 characters', async () => {
    const res = await request(chatApp)
      .post('/test')
      .send({ message: 'x'.repeat(2000) });

    expect(res.status).toBe(200);
  });
});

describe('sanitize — bookingValidation', () => {
  const bookApp = makeApp(bookingValidation);

  const validPayload = {
    name: 'Valid Name',
    email: 'valid@example.com',
    phone: '9876543210',
  };

  test('accepts a valid booking payload', async () => {
    const res = await request(bookApp).post('/test').send(validPayload);
    expect(res.status).toBe(200);
  });

  test('strips HTML from name', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, name: '<em>Test</em> User' });

    expect(res.status).toBe(200);
    expect(res.body.body.name).toBe('Test User');
  });

  test('rejects name shorter than 2 characters', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, name: 'A' });

    expect(res.status).toBe(422);
  });

  test('rejects name longer than 100 characters', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, name: 'A'.repeat(101) });

    expect(res.status).toBe(422);
  });

  test('rejects invalid email', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, email: 'not-an-email' });

    expect(res.status).toBe(422);
  });

  test('accepts phone with +91 prefix', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, phone: '+919876543210' });

    expect(res.status).toBe(200);
  });

  test('rejects phone starting with digit < 6', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, phone: '5876543210' });

    expect(res.status).toBe(422);
  });

  test('rejects phone shorter than 10 digits', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, phone: '987654' });

    expect(res.status).toBe(422);
  });

  test('rejects booking message over 1000 characters', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, message: 'x'.repeat(1001) });

    expect(res.status).toBe(422);
  });

  test('accepts optional preferredTime and strips HTML from it', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, preferredTime: '<b>Morning</b>' });

    expect(res.status).toBe(200);
    expect(res.body.body.preferredTime).toBe('Morning');
  });

  test('rejects preferredTime over 200 characters', async () => {
    const res = await request(bookApp)
      .post('/test')
      .send({ ...validPayload, preferredTime: 'x'.repeat(201) });

    expect(res.status).toBe(422);
  });
});

// ── errorHandler ──────────────────────────────────────────────────────────────

const errorHandler = require('../middleware/errorHandler');

describe('errorHandler middleware', () => {
  function makeErrorApp(errFactory) {
    const app = express();
    app.get('/boom', (req, res, next) => {
      next(errFactory());
    });
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => errorHandler(err, req, res, next));
    return app;
  }

  test('responds with 500 when error has no status', async () => {
    const app = makeErrorApp(() => new Error('generic error'));
    const res = await request(app).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('uses err.status when present', async () => {
    const app = makeErrorApp(() => {
      const e = new Error('custom status');
      e.status = 418;
      return e;
    });
    const res = await request(app).get('/boom');
    expect(res.status).toBe(418);
  });

  test('uses err.statusCode when err.status is absent', async () => {
    const app = makeErrorApp(() => {
      const e = new Error('statusCode error');
      e.statusCode = 503;
      return e;
    });
    const res = await request(app).get('/boom');
    expect(res.status).toBe(503);
  });

  test('exposes error message in non-production environment', async () => {
    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const app = makeErrorApp(() => new Error('detailed message'));
    const res = await request(app).get('/boom');
    expect(res.body.error).toBe('detailed message');
    process.env.NODE_ENV = savedEnv;
  });

  test('hides error details in production environment', async () => {
    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const app = makeErrorApp(() => new Error('secret details'));
    const res = await request(app).get('/boom');
    expect(res.body.error).not.toContain('secret details');
    process.env.NODE_ENV = savedEnv;
  });
});

// ── rateLimit handlers ─────────────────────────────────────────────────────────

const { chatLimiter, bookLimiter, adminExportLimiter, wisdomLimiter } = require('../middleware/rateLimit');

function makeRateLimitedApp(limiter) {
  const app = express();
  app.use(express.json());
  app.post('/limit', limiter, (req, res) => res.json({ ok: true }));
  app.get('/limit', limiter, (req, res) => res.json({ ok: true }));
  return app;
}

describe('rateLimit middleware handlers', () => {
  test('chatLimiter returns 429 and expected message after exceeding limit', async () => {
    const app = makeRateLimitedApp(chatLimiter);
    for (let i = 0; i < 50; i += 1) {
      const okRes = await request(app).post('/limit').send({ message: 'hello' });
      expect(okRes.status).toBe(200);
    }

    const limitedRes = await request(app).post('/limit').send({ message: 'hello' });
    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.error).toContain('Too many requests');
  });

  test('bookLimiter returns 429 and expected message after exceeding limit', async () => {
    const app = makeRateLimitedApp(bookLimiter);
    for (let i = 0; i < 5; i += 1) {
      const okRes = await request(app).post('/limit').send({ name: 'a' });
      expect(okRes.status).toBe(200);
    }

    const limitedRes = await request(app).post('/limit').send({ name: 'a' });
    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.error).toContain('booking attempts');
  });

  test('adminExportLimiter returns 429 and expected message after exceeding limit', async () => {
    const app = makeRateLimitedApp(adminExportLimiter);
    for (let i = 0; i < 20; i += 1) {
      const okRes = await request(app).get('/limit');
      expect(okRes.status).toBe(200);
    }

    const limitedRes = await request(app).get('/limit');
    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.error).toContain('Too many export requests');
  });

  test('wisdomLimiter returns 429 and expected message after exceeding limit', async () => {
    const app = makeRateLimitedApp(wisdomLimiter);
    for (let i = 0; i < 100; i += 1) {
      const okRes = await request(app).get('/limit');
      expect(okRes.status).toBe(200);
    }

    const limitedRes = await request(app).get('/limit');
    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.error).toContain('Too many requests');
  });
});
