'use strict';

jest.mock('express-rate-limit', () =>
  jest.fn(options => {
    const limiter = (_req, _res, next) => next();
    limiter.options = options;
    return limiter;
  })
);

jest.mock('../logger', () => ({
  warn: jest.fn(),
}));

const logger = require('../logger');
const {
  chatLimiter,
  bookLimiter,
  adminExportLimiter,
  wisdomLimiter,
} = require('../middleware/rateLimit');

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe.each([
  [
    'chatLimiter',
    chatLimiter,
    60 * 1000,
    50,
    'Chat rate limit exceeded',
    'Too many requests — please slow down and try again in a minute.',
  ],
  [
    'bookLimiter',
    bookLimiter,
    60 * 60 * 1000,
    5,
    'Booking rate limit exceeded',
    'Too many booking attempts — please try again in an hour.',
  ],
  [
    'adminExportLimiter',
    adminExportLimiter,
    60 * 60 * 1000,
    20,
    'Admin export rate limit exceeded',
    'Too many export requests — please try again later.',
  ],
  [
    'wisdomLimiter',
    wisdomLimiter,
    60 * 1000,
    100,
    'Wisdom rate limit exceeded',
    'Too many requests — please slow down and try again in a minute.',
  ],
])('%s configuration', (_name, limiter, windowMs, max, logMessage, errorMessage) => {
  beforeEach(() => {
    logger.warn.mockClear();
  });

  test('uses expected window and max values', () => {
    expect(limiter.options.windowMs).toBe(windowMs);
    expect(limiter.options.max).toBe(max);
    expect(limiter.options.standardHeaders).toBe(true);
    expect(limiter.options.legacyHeaders).toBe(false);
  });

  test('handler responds with 429 and error message', () => {
    const req = { ip: '127.0.0.1' };
    const res = makeRes();

    limiter.options.handler(req, res);

    expect(logger.warn).toHaveBeenCalledWith(logMessage, { ip: '127.0.0.1' });
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
