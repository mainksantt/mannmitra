'use strict';

const Database = require('better-sqlite3');
const config = require('./config');
const logger = require('./logger');

let db;

function getDb() {
  if (!db) {
    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT    NOT NULL,
      preferredTime TEXT  NOT NULL DEFAULT 'Any time',
      message     TEXT    NOT NULL DEFAULT '',
      createdAt   TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'Pending'
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid         TEXT    PRIMARY KEY,
      sess        TEXT    NOT NULL,
      expired     INTEGER NOT NULL
    );
  `);
  logger.info('Database schema initialised');
}

// ── Booking queries ────────────────────────────────────────────────────────────

function insertBooking(booking) {
  const stmt = getDb().prepare(
    `INSERT INTO bookings (id, name, email, phone, preferredTime, message, createdAt, status)
     VALUES (@id, @name, @email, @phone, @preferredTime, @message, @createdAt, @status)`
  );
  stmt.run(booking);
  return booking;
}

function getAllBookings() {
  return getDb().prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all();
}

function getBookingById(id) {
  return getDb().prepare('SELECT * FROM bookings WHERE id = ?').get(id);
}

function updateBookingStatus(id, status) {
  const result = getDb()
    .prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .run(status, id);
  return result.changes > 0;
}

function bookingExistsByEmail(email) {
  const row = getDb()
    .prepare('SELECT id FROM bookings WHERE email = ?')
    .get(email);
  return !!row;
}

// ── Cleanup (for testing) ──────────────────────────────────────────────────────

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDb,
  insertBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  bookingExistsByEmail,
  closeDb,
};
