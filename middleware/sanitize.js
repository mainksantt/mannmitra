'use strict';

const { body, validationResult } = require('express-validator');

/**
 * Strip HTML tags from a string (basic XSS prevention).
 * Repeatedly strips until no more tags remain (handles nested/partial tags).
 */
function stripTags(value) {
  if (typeof value !== 'string') return value;
  let prev;
  let str = value;
  do {
    prev = str;
    str = str.replace(/<[^>]*>?/gm, '');
  } while (str !== prev);
  return str;
}

// ── Validation chains ─────────────────────────────────────────────────────────

const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty.')
    .isLength({ max: 2000 })
    .withMessage('Message must be 2000 characters or fewer.')
    .customSanitizer(stripTags),
];

const bookingValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.')
    .customSanitizer(stripTags),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^(\+91[\s-]?)?[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian mobile number (10 digits, starting with 6-9, optionally prefixed with +91).'),

  body('preferredTime')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Preferred time is too long.')
    .customSanitizer(stripTags),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be 1000 characters or fewer.')
    .customSanitizer(stripTags),
];

/**
 * Middleware: return 422 with validation errors if any exist.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = { chatValidation, bookingValidation, handleValidationErrors };
