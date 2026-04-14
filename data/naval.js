'use strict';

/**
 * Naval Ravikant wisdom quotes dataset.
 * Covers his teachings on wealth, happiness, specific knowledge,
 * leverage, productivity, and life philosophy.
 */
const NAVAL_QUOTES = [
  {
    id: 1,
    quote:
      'Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.',
    category: 'wealth',
    tags: ['wealth', 'assets', 'money', 'status'],
    source: 'How to Get Rich (without getting lucky)',
  },
  {
    id: 2,
    quote:
      'Specific knowledge is knowledge you cannot be trained for. If society can train you, it can train someone else and replace you.',
    category: 'knowledge',
    tags: ['specific-knowledge', 'skills', 'uniqueness'],
    source: 'Naval Almanack',
  },
  {
    id: 3,
    quote:
      'Arm yourself with specific knowledge, accountability and leverage. If you have high accountability and you have high specific knowledge — you are extremely hard to replace.',
    category: 'knowledge',
    tags: ['specific-knowledge', 'accountability', 'leverage'],
    source: 'Naval Almanack',
  },
  {
    id: 4,
    quote:
      'Happiness is a choice and a skill and you can dedicate yourself to learning that skill and making that choice.',
    category: 'happiness',
    tags: ['happiness', 'mindset', 'choice', 'skill'],
    source: 'Naval Almanack',
  },
  {
    id: 5,
    quote:
      'The most important trick to be happy is to realize that happiness is a skill that you can develop. It is not something that just happens to you.',
    category: 'happiness',
    tags: ['happiness', 'skill', 'growth'],
    source: 'Naval Almanack',
  },
  {
    id: 6,
    quote:
      'Play long-term games with long-term people. All returns in life, whether in wealth, relationships, or knowledge, come from compound interest.',
    category: 'wealth',
    tags: ['long-term', 'compounding', 'relationships', 'patience'],
    source: 'Naval Almanack',
  },
  {
    id: 7,
    quote:
      "Learn to sell. Learn to build. If you can do both, you will be unstoppable.",
    category: 'knowledge',
    tags: ['skills', 'selling', 'building', 'leverage'],
    source: 'Naval Almanack',
  },
  {
    id: 8,
    quote:
      'Read what you love until you love to read.',
    category: 'productivity',
    tags: ['reading', 'learning', 'curiosity'],
    source: 'Naval Almanack',
  },
  {
    id: 9,
    quote:
      'You will get rich by giving society what it wants but does not yet know how to get — at scale.',
    category: 'wealth',
    tags: ['wealth', 'value', 'scale', 'entrepreneurship'],
    source: 'Naval Almanack',
  },
  {
    id: 10,
    quote:
      'The most important form of selfishness is taking care of yourself first so that you can be of service to others.',
    category: 'happiness',
    tags: ['self-care', 'mindset', 'wellbeing'],
    source: 'Naval Almanack',
  },
  {
    id: 11,
    quote:
      'A fit body, a calm mind, a house full of love — these things cannot be bought — they must be earned.',
    category: 'happiness',
    tags: ['health', 'mind', 'love', 'wellbeing'],
    source: 'Naval Almanack',
  },
  {
    id: 12,
    quote:
      'If you can\'t see yourself working with someone for life, don\'t work with them for a day.',
    category: 'decision-making',
    tags: ['relationships', 'partnerships', 'trust'],
    source: 'Naval Almanack',
  },
  {
    id: 13,
    quote:
      'Desire is a contract you make with yourself to be unhappy until you get what you want.',
    category: 'happiness',
    tags: ['desire', 'contentment', 'mindset'],
    source: 'Naval Almanack',
  },
  {
    id: 14,
    quote:
      'The way to get out of the competition trap is to be authentic, to build the thing that only you can build.',
    category: 'knowledge',
    tags: ['authenticity', 'uniqueness', 'competition'],
    source: 'Naval Almanack',
  },
  {
    id: 15,
    quote:
      'Code and media are permissionless leverage. They let you work while you sleep. An army of robots is at your disposal. Use them.',
    category: 'wealth',
    tags: ['leverage', 'code', 'media', 'technology'],
    source: 'Naval Almanack',
  },
  {
    id: 16,
    quote:
      'Become the best in the world at what you do. Keep redefining what you do until this is true.',
    category: 'knowledge',
    tags: ['mastery', 'excellence', 'skills'],
    source: 'Naval Almanack',
  },
  {
    id: 17,
    quote:
      'The secret to doing good research is always to be a little underemployed. You waste years by not being able to waste hours.',
    category: 'productivity',
    tags: ['research', 'creativity', 'time', 'thinking'],
    source: 'Naval Almanack',
  },
  {
    id: 18,
    quote:
      'You make your own luck if you stay at it long enough.',
    category: 'wealth',
    tags: ['luck', 'persistence', 'patience'],
    source: 'Naval Almanack',
  },
  {
    id: 19,
    quote:
      'The number one thing clouding us from being able to see reality is that we have preconceived notions of the way it should be.',
    category: 'decision-making',
    tags: ['clarity', 'reality', 'mindset', 'bias'],
    source: 'Naval Almanack',
  },
  {
    id: 20,
    quote:
      'If you want to be part of a great tech company, then you need to be able to sell or build. If you can do both, you\'re unstoppable.',
    category: 'knowledge',
    tags: ['skills', 'technology', 'building', 'selling'],
    source: 'Naval Almanack',
  },
  {
    id: 21,
    quote:
      'Meditation is turning off society\'s chatter and listening to your own self. It only "works" when done for its own sake.',
    category: 'happiness',
    tags: ['meditation', 'mindfulness', 'peace', 'clarity'],
    source: 'Naval Almanack',
  },
  {
    id: 22,
    quote:
      'All of man\'s troubles arise because he cannot sit alone quietly for 30 minutes.',
    category: 'happiness',
    tags: ['solitude', 'meditation', 'clarity', 'peace'],
    source: 'Naval Almanack',
  },
  {
    id: 23,
    quote:
      'My one real critique of this world is that it values obedience too much, and originality too little.',
    category: 'knowledge',
    tags: ['originality', 'creativity', 'independence'],
    source: 'Naval Almanack',
  },
  {
    id: 24,
    quote:
      'Money is not the root of all evil; the root is the love of money for its own sake, without respect for the things it\'s supposed to represent.',
    category: 'wealth',
    tags: ['money', 'values', 'mindset'],
    source: 'Naval Almanack',
  },
  {
    id: 25,
    quote:
      'Spend more time making the big decisions. There are basically three really big decisions you make in your early life: where you live, who you\'re with, and what you do.',
    category: 'decision-making',
    tags: ['decisions', 'life', 'priorities'],
    source: 'Naval Almanack',
  },
  {
    id: 26,
    quote:
      'The present is all we have. Everything else is either memory or imagination.',
    category: 'happiness',
    tags: ['present', 'mindfulness', 'clarity'],
    source: 'Naval Almanack',
  },
  {
    id: 27,
    quote:
      'Don\'t take yourself too seriously. You\'re just a monkey with a plan.',
    category: 'happiness',
    tags: ['humility', 'perspective', 'humor'],
    source: 'Naval Almanack',
  },
  {
    id: 28,
    quote:
      'Be a maker who makes something interesting people want. Show your craft, practice your craft, and the right people will eventually find you.',
    category: 'knowledge',
    tags: ['creativity', 'craft', 'building', 'authenticity'],
    source: 'Naval Almanack',
  },
  {
    id: 29,
    quote:
      'When you\'re finally wealthy, you\'ll realize it wasn\'t what you were seeking in the first place.',
    category: 'wealth',
    tags: ['wealth', 'purpose', 'meaning'],
    source: 'Naval Almanack',
  },
  {
    id: 30,
    quote:
      'The biggest mistake people make is taking their happiness seriously. It\'s not that serious. The person you become is more important than the things you achieve.',
    category: 'happiness',
    tags: ['happiness', 'growth', 'mindset', 'identity'],
    source: 'Naval Almanack',
  },
];

const CATEGORIES = ['wealth', 'happiness', 'knowledge', 'productivity', 'decision-making'];

/**
 * Returns today's Naval quote based on the day of the year.
 */
function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1)) / 86400000
  );
  return NAVAL_QUOTES[dayOfYear % NAVAL_QUOTES.length];
}

/**
 * Returns a random Naval quote.
 */
function getRandomQuote() {
  return NAVAL_QUOTES[Math.floor(Math.random() * NAVAL_QUOTES.length)];
}

/**
 * Returns quotes filtered by category.
 */
function getQuotesByCategory(category) {
  return NAVAL_QUOTES.filter(q => q.category === category);
}

/**
 * Returns a quote by its ID, or null.
 */
function getQuoteById(id) {
  return NAVAL_QUOTES.find(q => q.id === Number(id)) || null;
}

module.exports = {
  NAVAL_QUOTES,
  CATEGORIES,
  getDailyQuote,
  getRandomQuote,
  getQuotesByCategory,
  getQuoteById,
};
