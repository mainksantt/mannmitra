'use strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

const request = require('supertest');
const app = require('../server');
const { closeDb } = require('../database');

afterAll(() => {
  closeDb();
});

// ── /api/chat ─────────────────────────────────────────────────

describe('POST /api/chat', () => {
  test('returns a reply for a normal message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'hello' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(res.body).toHaveProperty('crisis', false);
  });

  test('detects crisis keywords and returns crisisMessage', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'I want to kill myself' });

    expect(res.status).toBe(200);
    expect(res.body.crisis).toBe(true);
    expect(res.body).toHaveProperty('crisisMessage');
    expect(res.body.crisisMessage).toContain('iCall');
  });

  test('returns 422 for empty message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  test('returns 400 for missing message field', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({});

    expect(res.status).toBe(422);
  });

  test('strips HTML tags from message (XSS prevention)', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '<script>alert("xss")</script> hello' });

    expect(res.status).toBe(200);
    expect(res.body.reply).not.toContain('<script>');
  });
});

// ── /api/book ─────────────────────────────────────────────────

describe('POST /api/book', () => {
  test('accepts a valid booking', async () => {
    const res = await request(app)
      .post('/api/book')
      .send({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543210',
        preferredTime: 'Weekend morning',
        message: 'Need help with anxiety',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('counsellor');
  });

  test('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/book')
      .send({ name: 'Test' }); // missing email & phone

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  test('returns 422 for invalid email', async () => {
    const res = await request(app)
      .post('/api/book')
      .send({ name: 'Test User', email: 'not-an-email', phone: '9876543210' });

    expect(res.status).toBe(422);
  });

  test('returns 422 for invalid Indian phone number', async () => {
    const res = await request(app)
      .post('/api/book')
      .send({ name: 'Test User', email: 'test@example.com', phone: '12345' });

    expect(res.status).toBe(422);
  });

  test('accepts phone number with +91 prefix', async () => {
    const res = await request(app)
      .post('/api/book')
      .send({ name: 'Arun Mehta', email: 'arun@example.com', phone: '+919876543210' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
