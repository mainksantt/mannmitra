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

// ── /api/chat — additional coverage ───────────────────────────────────────────

describe('POST /api/chat — message length', () => {
  test('returns 422 for message longer than 2000 characters', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'A'.repeat(2001) });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });
});

// ── detectCrisis — unit tests ─────────────────────────────────────────────────

const { detectCrisis, getResponse } = require('../routes/api');

describe('detectCrisis', () => {
  const crisisInputs = [
    'I want to commit suicide',
    'I am suicidal',
    'I want to kill myself',
    'I want to end my life',
    'I want to die',
    'I want to hurt myself',
    'self harm is my only option',
    'I engage in self-harm',
    'there is no reason to live',
    'I would be better off dead',
    'I feel completely hopeless',
    'I feel worthless',
    "I can't go on anymore",
    'cant go on',
    'I am ending it all',
    'give up on life',
    'life is not worth living',
    'I will take my life',
    'I might overdose',
    'I want to cut myself',
  ];

  test.each(crisisInputs)('detects crisis in: "%s"', input => {
    expect(detectCrisis(input)).toBe(true);
  });

  test('is case-insensitive', () => {
    expect(detectCrisis('I WANT TO DIE')).toBe(true);
    expect(detectCrisis('SuIcIdE')).toBe(true);
  });

  test('returns false for normal messages', () => {
    expect(detectCrisis('hello, how are you?')).toBe(false);
    expect(detectCrisis('I feel a bit sad today')).toBe(false);
    expect(detectCrisis('I need help with stress')).toBe(false);
  });
});

// ── getResponse — unit tests ──────────────────────────────────────────────────

describe('getResponse', () => {
  const emotionPatterns = [
    ['hello', ['Namaste', 'Hello']],
    ['I feel anxious', ['anxious', 'Anxiety', 'deep breath', 'talk']],
    ['I am so sad', ['sorry', 'Sadness', 'courage', 'feelings']],
    ['I am stressed out by exams', ['stress', 'pressure', 'pressure', 'Pressure']],
    ['I feel so lonely', ['Loneliness', 'alone', 'listening', 'Lonely']],
    ['I am really angry', ['angry', 'Anger', 'valid emotion', 'exhausting']],
    ["I can't sleep at all", ['sleep', 'Sleep', 'insomnia', 'rest']],
    ['going through a breakup', ['Relationship', 'breakup', 'painful', 'family']],
    ['please help me', ['brave', 'listening', 'help', 'Reaching']],
    ['I am feeling great today', ['wonderful', 'good', 'glad', 'wins']],
    ['thank you so much', ['welcome', 'pleasure', 'mental health']],
  ];

  test.each(emotionPatterns)('responds to "%s" with a relevant reply', (input, expectedTerms) => {
    const reply = getResponse(input);
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
    const lowerReply = reply.toLowerCase();
    const matched = expectedTerms.some(term => lowerReply.includes(term.toLowerCase()));
    expect(matched).toBe(true);
  });

  test('returns a default response for unrecognised messages', () => {
    const reply = getResponse('zzzunknownzzzinputzzz');
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });
});

// ── GET /api/bookings — auth guard ────────────────────────────────────────────

describe('GET /api/bookings', () => {
  test('returns 401 for unauthenticated JSON request', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('redirects unauthenticated browser request to login page', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Accept', 'text/html');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/admin/login');
  });
});
