'use strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.ADMIN_PASSWORD = 'test-admin-password';

const request = require('supertest');
const app = require('../server');
const { closeDb, insertBooking } = require('../database');

afterAll(() => {
  closeDb();
});

// ── Helper: extract CSRF token from login page HTML ────────────────────────────

async function getCsrfToken(agent) {
  const res = await agent.get('/admin/login');
  const match = res.text.match(/name="_csrf"\s+value="([^"]+)"/);
  if (!match) throw new Error('CSRF token not found in login page HTML');
  return match[1];
}

// ── Helper: log in as admin using a persistent agent ──────────────────────────

async function loginAsAdmin(agent) {
  const csrfToken = await getCsrfToken(agent);
  await agent
    .post('/admin/login')
    .type('form')
    .send({ _csrf: csrfToken, password: 'test-admin-password' });
}

// ── GET /admin/login ──────────────────────────────────────────────────────────

describe('GET /admin/login', () => {
  test('returns 200 with login form HTML', async () => {
    const res = await request(app).get('/admin/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<form');
    expect(res.text).toContain('name="password"');
    expect(res.text).toContain('name="_csrf"');
  });

  test('shows error message when error query param is 1', async () => {
    const res = await request(app).get('/admin/login?error=1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Incorrect password');
  });

  test('does not show error message by default', async () => {
    const res = await request(app).get('/admin/login');
    expect(res.status).toBe(200);
    expect(res.text).not.toContain('Incorrect password');
  });
});

// ── POST /admin/login ─────────────────────────────────────────────────────────

describe('POST /admin/login', () => {
  test('redirects to /admin on correct password with valid CSRF', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const res = await agent
      .post('/admin/login')
      .type('form')
      .send({ _csrf: csrfToken, password: 'test-admin-password' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin');
  });

  test('redirects to /admin/login?error=1 on wrong password', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const res = await agent
      .post('/admin/login')
      .type('form')
      .send({ _csrf: csrfToken, password: 'wrong-password' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('error=1');
  });

  test('returns 403 when CSRF token is missing', async () => {
    const agent = request.agent(app);
    await agent.get('/admin/login'); // establish session

    const res = await agent
      .post('/admin/login')
      .type('form')
      .send({ password: 'test-admin-password' }); // no _csrf

    expect(res.status).toBe(403);
  });

  test('returns 403 when CSRF token is invalid', async () => {
    const agent = request.agent(app);
    await agent.get('/admin/login'); // establish session

    const res = await agent
      .post('/admin/login')
      .type('form')
      .send({ _csrf: 'invalid-token', password: 'test-admin-password' });

    expect(res.status).toBe(403);
  });
});

// ── GET /admin/logout ─────────────────────────────────────────────────────────

describe('GET /admin/logout', () => {
  test('destroys session and redirects to login', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent.get('/admin/logout');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/admin/login');
  });

  test('after logout, authenticated routes redirect to login', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);
    await agent.get('/admin/logout');

    const res = await agent
      .get('/admin/api/bookings')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });
});

// ── GET /admin (dashboard) ────────────────────────────────────────────────────

describe('GET /admin', () => {
  // Note: express.static redirects /admin → /admin/ (301) before the admin
  // router can apply requireAdminAuth.  Accessing the trailing-slash form
  // bypasses the static redirect and reaches the auth middleware directly.
  test('redirects unauthenticated user to login page', async () => {
    const res = await request(app).get('/admin/');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/admin/login');
  });
});

// ── GET /admin/api/bookings ───────────────────────────────────────────────────

describe('GET /admin/api/bookings', () => {
  test('returns 401 JSON for unauthenticated API request', async () => {
    const res = await request(app)
      .get('/admin/api/bookings')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('returns bookings array when authenticated', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent
      .get('/admin/api/bookings')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── PATCH /admin/api/bookings/:id/status ─────────────────────────────────────

describe('PATCH /admin/api/bookings/:id/status', () => {
  const testBooking = {
    id: 'admin-patch-test-1',
    name: 'Patch Test User',
    email: 'patch@example.com',
    phone: '9876543210',
    preferredTime: 'Any time',
    message: '',
    createdAt: new Date().toISOString(),
    status: 'Pending',
  };

  beforeAll(() => {
    insertBooking(testBooking);
  });

  test('returns 401 for unauthenticated request', async () => {
    const res = await request(app)
      .patch(`/admin/api/bookings/${testBooking.id}/status`)
      .set('Accept', 'application/json')
      .send({ status: 'Contacted' });

    expect(res.status).toBe(401);
  });

  test('updates status to a valid value when authenticated', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent
      .patch(`/admin/api/bookings/${testBooking.id}/status`)
      .send({ status: 'Contacted' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('Contacted');
  });

  test.each(['Pending', 'In Progress', 'Completed'])(
    'accepts valid status "%s"',
    async status => {
      const agent = request.agent(app);
      await loginAsAdmin(agent);

      const res = await agent
        .patch(`/admin/api/bookings/${testBooking.id}/status`)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }
  );

  test('returns 400 for invalid status value', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent
      .patch(`/admin/api/bookings/${testBooking.id}/status`)
      .send({ status: 'InvalidStatus' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 404 for non-existent booking id', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent
      .patch('/admin/api/bookings/does-not-exist/status')
      .send({ status: 'Completed' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ── GET /admin/api/bookings/export.csv ────────────────────────────────────────

describe('GET /admin/api/bookings/export.csv', () => {
  test('returns 401 for unauthenticated request', async () => {
    const res = await request(app)
      .get('/admin/api/bookings/export.csv')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });

  test('returns CSV with correct Content-Type when authenticated', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent.get('/admin/api/bookings/export.csv');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toContain('bookings.csv');
  });

  test('CSV output contains header row', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent.get('/admin/api/bookings/export.csv');

    expect(res.text).toContain('ID,Name,Email,Phone');
  });

  test('CSV rows contain booking data', async () => {
    const booking = {
      id: 'csv-export-test',
      name: 'CSV User',
      email: 'csv@example.com',
      phone: '9876543210',
      preferredTime: 'Weekday',
      message: 'Export test',
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    insertBooking(booking);

    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent.get('/admin/api/bookings/export.csv');

    expect(res.text).toContain('csv@example.com');
    expect(res.text).toContain('CSV User');
  });

  test('CSV correctly escapes double quotes in field values', async () => {
    const booking = {
      id: 'csv-quote-test',
      name: 'User "Quoted" Name',
      email: 'quoted@example.com',
      phone: '9876543210',
      preferredTime: 'Any time',
      message: '',
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    insertBooking(booking);

    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const res = await agent.get('/admin/api/bookings/export.csv');

    // Double quotes inside fields are escaped as ""
    expect(res.text).toContain('""Quoted""');
  });
});
