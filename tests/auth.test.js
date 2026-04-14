'use strict';

process.env.ADMIN_PASSWORD = 'test-admin-password';

const { requireAdminAuth, adminLogin, adminLogout } = require('../middleware/auth');

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    redirect: jest.fn(),
  };
}

describe('auth middleware', () => {
  test('requireAdminAuth allows authenticated sessions', () => {
    const req = { session: { isAdmin: true }, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    requireAdminAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test('requireAdminAuth returns 401 JSON for API requests', () => {
    const req = { session: {}, headers: { accept: 'application/json' } };
    const res = makeRes();
    const next = jest.fn();

    requireAdminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized — please log in.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAdminAuth redirects browser requests to login', () => {
    const req = { session: {}, headers: { accept: 'text/html' } };
    const res = makeRes();
    const next = jest.fn();

    requireAdminAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/admin/login');
    expect(next).not.toHaveBeenCalled();
  });

  test('adminLogin sets session and redirects on valid password', () => {
    const req = { body: { password: 'test-admin-password' }, session: {} };
    const res = makeRes();

    adminLogin(req, res);

    expect(req.session.isAdmin).toBe(true);
    expect(res.redirect).toHaveBeenCalledWith('/admin');
  });

  test('adminLogin redirects to error on invalid password', () => {
    const req = { body: { password: 'wrong-password' }, session: {} };
    const res = makeRes();

    adminLogin(req, res);

    expect(req.session.isAdmin).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith('/admin/login?error=1');
  });

  test('adminLogout destroys session and redirects to login', () => {
    const req = { session: { destroy: jest.fn(cb => cb()) } };
    const res = makeRes();

    adminLogout(req, res);

    expect(req.session.destroy).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/admin/login');
  });
});
