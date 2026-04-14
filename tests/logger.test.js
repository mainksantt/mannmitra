'use strict';

describe('logger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  test('uses debug level and console transport in non-production', () => {
    process.env.NODE_ENV = 'test';
    const logger = require('../logger');
    const { transports } = require('winston');
    expect(logger.level).toBe('debug');
    const hasConsole = logger.transports.some(t => t instanceof transports.Console);
    expect(hasConsole).toBe(true);
  });

  test('uses info level without console transport in production', () => {
    process.env.NODE_ENV = 'production';
    const logger = require('../logger');
    const { transports } = require('winston');
    expect(logger.level).toBe('info');
    const hasConsole = logger.transports.some(t => t instanceof transports.Console);
    expect(hasConsole).toBe(false);
  });
});
