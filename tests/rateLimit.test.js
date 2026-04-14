'use strict';

const request = require('supertest');

jest.setTimeout(15000);

function makeApp(limiter, method = 'get') {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app[method]('/test', limiter, (req, res) => res.json({ ok: true }));
  return app;
}

async function exceedLimit(app, method, limit) {
  const agent = request.agent(app);
  for (let i = 0; i < limit; i += 1) {
    await agent[method]('/test').send({ message: 'ping' });
  }
  return agent[method]('/test').send({ message: 'ping' });
}

describe('rate limiters', () => {
  test('chatLimiter returns 429 after 50 requests', async () => {
    jest.resetModules();
    const { chatLimiter } = require('../middleware/rateLimit');
    const app = makeApp(chatLimiter, 'post');
    const res = await exceedLimit(app, 'post', 50);
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many requests');
  });

  test('bookLimiter returns 429 after 5 requests', async () => {
    jest.resetModules();
    const { bookLimiter } = require('../middleware/rateLimit');
    const app = makeApp(bookLimiter, 'post');
    const res = await exceedLimit(app, 'post', 5);
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many booking attempts');
  });

  test('adminExportLimiter returns 429 after 20 requests', async () => {
    jest.resetModules();
    const { adminExportLimiter } = require('../middleware/rateLimit');
    const app = makeApp(adminExportLimiter, 'get');
    const res = await exceedLimit(app, 'get', 20);
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many export requests');
  });

  test('wisdomLimiter returns 429 after 100 requests', async () => {
    jest.resetModules();
    const { wisdomLimiter } = require('../middleware/rateLimit');
    const app = makeApp(wisdomLimiter, 'get');
    const res = await exceedLimit(app, 'get', 100);
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many requests');
  });
});
