'use strict';

const request = require('supertest');
const app = require('../server');

// ── Gita data helpers ─────────────────────────────────────────────────────────

describe('Gita data module', () => {
  const { getDailyVerse, getVerse, getChapters, getVersesByChapter, getVersesByTheme, GITA_VERSES } =
    require('../data/gita');

  test('GITA_VERSES is a non-empty array', () => {
    expect(Array.isArray(GITA_VERSES)).toBe(true);
    expect(GITA_VERSES.length).toBeGreaterThan(0);
  });

  test('every verse has required fields', () => {
    for (const v of GITA_VERSES) {
      expect(typeof v.chapter).toBe('number');
      expect(typeof v.verse).toBe('number');
      expect(typeof v.shloka).toBe('string');
      expect(typeof v.transliteration).toBe('string');
      expect(typeof v.meaning_en).toBe('string');
      expect(typeof v.meaning_hi).toBe('string');
      expect(Array.isArray(v.theme)).toBe(true);
      expect(typeof v.chapter_name).toBe('string');
    }
  });

  test('getDailyVerse returns a valid verse', () => {
    const v = getDailyVerse();
    expect(v).toHaveProperty('chapter');
    expect(v).toHaveProperty('shloka');
  });

  test('getVerse returns correct verse', () => {
    const v = getVerse(2, 47);
    expect(v).not.toBeNull();
    expect(v.chapter).toBe(2);
    expect(v.verse).toBe(47);
    expect(v.shloka).toContain('कर्मण्येवाधिकारस्ते');
  });

  test('getVerse returns null for unknown verse', () => {
    expect(getVerse(99, 99)).toBeNull();
  });

  test('getChapters returns array of chapter objects', () => {
    const chapters = getChapters();
    expect(Array.isArray(chapters)).toBe(true);
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters[0]).toHaveProperty('chapter');
    expect(chapters[0]).toHaveProperty('name');
  });

  test('getVersesByChapter returns verses for chapter 2', () => {
    const verses = getVersesByChapter(2);
    expect(verses.length).toBeGreaterThan(0);
    verses.forEach(v => expect(v.chapter).toBe(2));
  });

  test('getVersesByChapter returns empty array for unknown chapter', () => {
    expect(getVersesByChapter(99)).toEqual([]);
  });

  test('getVersesByTheme filters correctly', () => {
    const verses = getVersesByTheme('karma');
    expect(verses.length).toBeGreaterThan(0);
    verses.forEach(v => expect(v.theme).toContain('karma'));
  });
});

// ── Naval data helpers ────────────────────────────────────────────────────────

describe('Naval data module', () => {
  const { getDailyQuote, getRandomQuote, getQuotesByCategory, getQuoteById, NAVAL_QUOTES, CATEGORIES } =
    require('../data/naval');

  test('NAVAL_QUOTES is a non-empty array', () => {
    expect(Array.isArray(NAVAL_QUOTES)).toBe(true);
    expect(NAVAL_QUOTES.length).toBeGreaterThan(0);
  });

  test('every quote has required fields', () => {
    for (const q of NAVAL_QUOTES) {
      expect(typeof q.id).toBe('number');
      expect(typeof q.quote).toBe('string');
      expect(typeof q.category).toBe('string');
      expect(Array.isArray(q.tags)).toBe(true);
      expect(typeof q.source).toBe('string');
    }
  });

  test('CATEGORIES is a non-empty array of strings', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true);
    CATEGORIES.forEach(c => expect(typeof c).toBe('string'));
  });

  test('getDailyQuote returns a valid quote', () => {
    const q = getDailyQuote();
    expect(q).toHaveProperty('id');
    expect(q).toHaveProperty('quote');
  });

  test('getRandomQuote returns a valid quote', () => {
    const q = getRandomQuote();
    expect(q).toHaveProperty('id');
    expect(NAVAL_QUOTES).toContainEqual(q);
  });

  test('getQuotesByCategory filters correctly', () => {
    const quotes = getQuotesByCategory('happiness');
    expect(quotes.length).toBeGreaterThan(0);
    quotes.forEach(q => expect(q.category).toBe('happiness'));
  });

  test('getQuoteById returns correct quote', () => {
    const q = getQuoteById(1);
    expect(q).not.toBeNull();
    expect(q.id).toBe(1);
  });

  test('getQuoteById returns null for unknown id', () => {
    expect(getQuoteById(9999)).toBeNull();
  });
});

// ── Wisdom API: Gita endpoints ────────────────────────────────────────────────

describe('GET /api/wisdom/gita/daily', () => {
  test('returns 200 with a valid verse', async () => {
    const res = await request(app).get('/api/wisdom/gita/daily');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('chapter');
    expect(res.body.data).toHaveProperty('shloka');
    expect(res.body.data).toHaveProperty('meaning_en');
    expect(res.body.data).toHaveProperty('meaning_hi');
  });
});

describe('GET /api/wisdom/gita/chapters', () => {
  test('returns list of chapters', async () => {
    const res = await request(app).get('/api/wisdom/gita/chapters');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('GET /api/wisdom/gita/verses', () => {
  test('returns all verses', async () => {
    const res = await request(app).get('/api/wisdom/gita/verses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('filters by theme query param', async () => {
    const res = await request(app).get('/api/wisdom/gita/verses?theme=karma');
    expect(res.status).toBe(200);
    res.body.data.forEach(v => expect(v.theme).toContain('karma'));
  });
});

describe('GET /api/wisdom/gita/chapter/:chapter', () => {
  test('returns verses for a valid chapter', async () => {
    const res = await request(app).get('/api/wisdom/gita/chapter/2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach(v => expect(v.chapter).toBe(2));
  });

  test('returns 400 for invalid chapter number', async () => {
    const res = await request(app).get('/api/wisdom/gita/chapter/99');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 404 for a valid but absent chapter', async () => {
    const res = await request(app).get('/api/wisdom/gita/chapter/1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/wisdom/gita/:chapter/:verse', () => {
  test('returns verse 2:47 correctly', async () => {
    const res = await request(app).get('/api/wisdom/gita/2/47');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.chapter).toBe(2);
    expect(res.body.data.verse).toBe(47);
    expect(res.body.data.shloka).toContain('कर्मण्येवाधिकारस्ते');
  });

  test('returns 404 for unknown verse', async () => {
    const res = await request(app).get('/api/wisdom/gita/99/99');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for non-numeric params', async () => {
    const res = await request(app).get('/api/wisdom/gita/abc/xyz');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── Wisdom API: Naval endpoints ───────────────────────────────────────────────

describe('GET /api/wisdom/naval/daily', () => {
  test('returns 200 with a valid quote', async () => {
    const res = await request(app).get('/api/wisdom/naval/daily');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('quote');
    expect(res.body.data).toHaveProperty('category');
  });
});

describe('GET /api/wisdom/naval/random', () => {
  test('returns a random quote', async () => {
    const res = await request(app).get('/api/wisdom/naval/random');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('GET /api/wisdom/naval/categories', () => {
  test('returns list of categories', async () => {
    const res = await request(app).get('/api/wisdom/naval/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toContain('happiness');
    expect(res.body.data).toContain('wealth');
  });
});

describe('GET /api/wisdom/naval/category/:category', () => {
  test('returns quotes for valid category', async () => {
    const res = await request(app).get('/api/wisdom/naval/category/happiness');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach(q => expect(q.category).toBe('happiness'));
  });

  test('returns 400 for invalid category', async () => {
    const res = await request(app).get('/api/wisdom/naval/category/invalid-cat');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/wisdom/naval/:id', () => {
  test('returns quote by ID', async () => {
    const res = await request(app).get('/api/wisdom/naval/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  test('returns 404 for unknown ID', async () => {
    const res = await request(app).get('/api/wisdom/naval/9999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for non-numeric ID', async () => {
    const res = await request(app).get('/api/wisdom/naval/abc');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/wisdom/naval', () => {
  test('returns all Naval quotes', async () => {
    const res = await request(app).get('/api/wisdom/naval');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('filters by category query param', async () => {
    const res = await request(app).get('/api/wisdom/naval?category=wealth');
    expect(res.status).toBe(200);
    res.body.data.forEach(q => expect(q.category).toBe('wealth'));
  });

  test('returns 400 for invalid category query param', async () => {
    const res = await request(app).get('/api/wisdom/naval?category=badcat');
    expect(res.status).toBe(400);
  });
});
