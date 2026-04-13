'use strict';

describe('rateLimit middleware handlers', () => {
  let logger;
  let limits;

  beforeEach(() => {
    jest.resetModules();
    logger = { warn: jest.fn() };
    jest.doMock('../logger', () => logger);
    jest.doMock('express-rate-limit', () => jest.fn(options => options));
    limits = require('../middleware/rateLimit');
  });

  function makeRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  test('chatLimiter handler returns 429 and logs warning', () => {
    const res = makeRes();
    limits.chatLimiter.handler({ ip: '127.0.0.1' }, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many requests — please slow down and try again in a minute.',
    });
    expect(logger.warn).toHaveBeenCalledWith('Chat rate limit exceeded', { ip: '127.0.0.1' });
  });

  test('bookLimiter handler returns 429 and logs warning', () => {
    const res = makeRes();
    limits.bookLimiter.handler({ ip: '10.0.0.1' }, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many booking attempts — please try again in an hour.',
    });
    expect(logger.warn).toHaveBeenCalledWith('Booking rate limit exceeded', { ip: '10.0.0.1' });
  });

  test('adminExportLimiter handler returns 429 and logs warning', () => {
    const res = makeRes();
    limits.adminExportLimiter.handler({ ip: '192.168.1.10' }, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many export requests — please try again later.',
    });
    expect(logger.warn).toHaveBeenCalledWith('Admin export rate limit exceeded', { ip: '192.168.1.10' });
  });
});
