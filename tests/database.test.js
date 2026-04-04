'use strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

const {
  insertBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  bookingExistsByEmail,
  closeDb,
} = require('../database');

const makeBooking = (overrides = {}) => ({
  id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: 'Test User',
  email: 'test@example.com',
  phone: '9876543210',
  preferredTime: 'Any time',
  message: 'Test message',
  createdAt: new Date().toISOString(),
  status: 'Pending',
  ...overrides,
});

afterAll(() => {
  closeDb();
});

describe('Database — insertBooking & getAllBookings', () => {
  test('inserts a booking and retrieves it', () => {
    const booking = makeBooking({ email: 'insert@example.com' });
    insertBooking(booking);

    const all = getAllBookings();
    const found = all.find(b => b.id === booking.id);
    expect(found).toBeDefined();
    expect(found.name).toBe('Test User');
    expect(found.email).toBe('insert@example.com');
  });

  test('returns bookings in descending createdAt order', () => {
    const b1 = makeBooking({ id: 'order-1', email: 'order1@example.com', createdAt: '2024-01-01T00:00:00.000Z' });
    const b2 = makeBooking({ id: 'order-2', email: 'order2@example.com', createdAt: '2024-06-01T00:00:00.000Z' });
    insertBooking(b1);
    insertBooking(b2);

    const all = getAllBookings();
    const idx1 = all.findIndex(b => b.id === 'order-1');
    const idx2 = all.findIndex(b => b.id === 'order-2');
    expect(idx2).toBeLessThan(idx1); // newer first
  });
});

describe('Database — getBookingById', () => {
  test('retrieves a booking by id', () => {
    const booking = makeBooking({ id: 'getbyid-1', email: 'getbyid@example.com' });
    insertBooking(booking);

    const found = getBookingById('getbyid-1');
    expect(found).toBeDefined();
    expect(found.email).toBe('getbyid@example.com');
  });

  test('returns undefined for non-existent id', () => {
    const found = getBookingById('does-not-exist');
    expect(found).toBeUndefined();
  });
});

describe('Database — updateBookingStatus', () => {
  test('updates status of an existing booking', () => {
    const booking = makeBooking({ id: 'status-1', email: 'status@example.com' });
    insertBooking(booking);

    const updated = updateBookingStatus('status-1', 'Completed');
    expect(updated).toBe(true);

    const found = getBookingById('status-1');
    expect(found.status).toBe('Completed');
  });

  test('returns false for non-existent booking', () => {
    const updated = updateBookingStatus('ghost-id', 'Completed');
    expect(updated).toBe(false);
  });
});

describe('Database — bookingExistsByEmail', () => {
  test('returns true when email exists', () => {
    const booking = makeBooking({ id: 'exists-1', email: 'exists@example.com' });
    insertBooking(booking);

    expect(bookingExistsByEmail('exists@example.com')).toBe(true);
  });

  test('returns false when email does not exist', () => {
    expect(bookingExistsByEmail('no-such@example.com')).toBe(false);
  });
});
