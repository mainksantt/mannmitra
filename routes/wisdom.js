'use strict';

const express = require('express');
const router = express.Router();

const { wisdomLimiter } = require('../middleware/rateLimit');
const {
  getDailyVerse,
  getVerse,
  getChapters,
  getVersesByChapter,
  getVersesByTheme,
  GITA_VERSES,
} = require('../data/gita');
const {
  getDailyQuote,
  getRandomQuote,
  getQuotesByCategory,
  getQuoteById,
  NAVAL_QUOTES,
  CATEGORIES,
} = require('../data/naval');
const logger = require('../logger');

// ── GET /api/wisdom/gita/daily ─────────────────────────────────────────────────
router.get('/gita/daily', wisdomLimiter, (req, res) => {
  const verse = getDailyVerse();
  logger.info('Daily Gita verse served', { chapter: verse.chapter, verse: verse.verse });
  res.json({ success: true, data: verse });
});

// ── GET /api/wisdom/gita/chapters ─────────────────────────────────────────────
router.get('/gita/chapters', wisdomLimiter, (req, res) => {
  res.json({ success: true, data: getChapters() });
});

// ── GET /api/wisdom/gita/verses — all verses ──────────────────────────────────
router.get('/gita/verses', wisdomLimiter, (req, res) => {
  const { theme } = req.query;
  if (theme) {
    const filtered = getVersesByTheme(theme);
    return res.json({ success: true, count: filtered.length, data: filtered });
  }
  res.json({ success: true, count: GITA_VERSES.length, data: GITA_VERSES });
});

// ── GET /api/wisdom/gita/chapter/:chapter ─────────────────────────────────────
router.get('/gita/chapter/:chapter', wisdomLimiter, (req, res) => {
  const chapter = parseInt(req.params.chapter, 10);
  if (isNaN(chapter) || chapter < 1 || chapter > 18) {
    return res.status(400).json({ success: false, error: 'Chapter must be a number between 1 and 18.' });
  }
  const verses = getVersesByChapter(chapter);
  if (!verses.length) {
    return res.status(404).json({ success: false, error: 'No verses found for this chapter in the dataset.' });
  }
  res.json({ success: true, count: verses.length, data: verses });
});

// ── GET /api/wisdom/gita/:chapter/:verse ──────────────────────────────────────
router.get('/gita/:chapter/:verse', wisdomLimiter, (req, res) => {
  const chapter = parseInt(req.params.chapter, 10);
  const verse = parseInt(req.params.verse, 10);
  if (isNaN(chapter) || isNaN(verse)) {
    return res.status(400).json({ success: false, error: 'Chapter and verse must be valid numbers.' });
  }
  const found = getVerse(chapter, verse);
  if (!found) {
    return res.status(404).json({ success: false, error: 'Verse not found in the dataset.' });
  }
  logger.info('Gita verse served', { chapter, verse });
  res.json({ success: true, data: found });
});

// ── GET /api/wisdom/naval/daily ────────────────────────────────────────────────
router.get('/naval/daily', wisdomLimiter, (req, res) => {
  const quote = getDailyQuote();
  logger.info('Daily Naval quote served', { id: quote.id, category: quote.category });
  res.json({ success: true, data: quote });
});

// ── GET /api/wisdom/naval/random ──────────────────────────────────────────────
router.get('/naval/random', wisdomLimiter, (req, res) => {
  const quote = getRandomQuote();
  res.json({ success: true, data: quote });
});

// ── GET /api/wisdom/naval/categories ──────────────────────────────────────────
router.get('/naval/categories', wisdomLimiter, (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

// ── GET /api/wisdom/naval/category/:category ──────────────────────────────────
router.get('/naval/category/:category', wisdomLimiter, (req, res) => {
  const { category } = req.params;
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Valid categories: ${CATEGORIES.join(', ')}.`,
    });
  }
  const quotes = getQuotesByCategory(category);
  res.json({ success: true, count: quotes.length, data: quotes });
});

// ── GET /api/wisdom/naval/:id ──────────────────────────────────────────────────
router.get('/naval/:id', wisdomLimiter, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'ID must be a valid number.' });
  }
  const quote = getQuoteById(id);
  if (!quote) {
    return res.status(404).json({ success: false, error: 'Quote not found.' });
  }
  res.json({ success: true, data: quote });
});

// ── GET /api/wisdom/naval — all quotes ────────────────────────────────────────
router.get('/naval', wisdomLimiter, (req, res) => {
  const { category } = req.query;
  if (category) {
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Valid categories: ${CATEGORIES.join(', ')}.`,
      });
    }
    const quotes = getQuotesByCategory(category);
    return res.json({ success: true, count: quotes.length, data: quotes });
  }
  res.json({ success: true, count: NAVAL_QUOTES.length, data: NAVAL_QUOTES });
});

module.exports = router;
