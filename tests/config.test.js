'use strict';

describe('config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  test('uses PORT environment variable when provided', () => {
    process.env.PORT = '4567';
    const config = require('../config');
    expect(config.port).toBe(4567);
  });

  test('defaults to port 3000 when PORT is not set', () => {
    delete process.env.PORT;
    const config = require('../config');
    expect(config.port).toBe(3000);
  });
});
