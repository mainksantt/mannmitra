'use strict';

const express = require('express');
const router = express.Router();

const { chatLimiter, bookLimiter } = require('../middleware/rateLimit');
const { chatValidation, bookingValidation, handleValidationErrors } = require('../middleware/sanitize');
const { insertBooking, bookingExistsByEmail } = require('../database');
const { sendUserConfirmation, sendAdminNotification } = require('../email');
const logger = require('../logger');

// ── Crisis keywords ────────────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'hurt myself', 'self harm', 'self-harm', 'no reason to live',
  'better off dead', 'hopeless', 'worthless', "can't go on", 'cant go on',
  'ending it all', 'give up on life', 'not worth living', 'take my life',
  'overdose', 'cut myself',
  // Hindi crisis keywords
  'khud ko maar', 'jaan dena chahta', 'jaan dena chahti', 'mar jaana chahta',
  'mar jaana chahti', 'jeena nahi chahta', 'jeena nahi chahti', 'zindagi khatam',
  'marna chahta', 'marna chahti', 'khud ko nuksan', 'aatmahatya',
];

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Rule-based responses ───────────────────────────────────────────────────────
const RESPONSES = [
  {
    patterns: ['hello', 'hi', 'namaste', 'hey', 'hii', 'helo'],
    replies: [
      'Namaste! 🙏 I\'m MannMitra, your mental wellness companion. How are you feeling today?',
      'Hello! So glad you reached out. I\'m here to listen. How is your day going?'
    ]
  },
  {
    patterns: ['anxious', 'anxiety', 'nervous', 'panic', 'scared', 'fear', 'worry', 'worried'],
    replies: [
      'Feeling anxious can be really overwhelming. Take a slow, deep breath with me — inhale for 4 counts, hold for 4, exhale for 4. You\'re safe right here. 💙\n\nWould you like to talk more about what\'s making you feel this way?',
      'Anxiety is tough, but you\'re not alone in this. Many people in India struggle with similar feelings. Let\'s talk about what\'s on your mind — sharing often helps lighten the load.'
    ]
  },
  {
    patterns: ['sad', 'depressed', 'depression', 'unhappy', 'cry', 'crying', 'tears', 'grief', 'dukhi'],
    replies: [
      'I\'m really sorry you\'re feeling this way. Sadness can feel very heavy, and it\'s okay to feel it. You don\'t have to carry this alone. 💛\n\nI\'m here to listen — what\'s been weighing on your heart?',
      'It takes courage to acknowledge these feelings. I\'m here with you. Would you like to share what\'s been happening in your life?'
    ]
  },
  {
    patterns: ['stress', 'stressed', 'overwhelmed', 'pressure', 'exam', 'exams', 'work', 'job', 'office'],
    replies: [
      'Life in India can be incredibly demanding — between family expectations, work pressures, and exams, stress can pile up fast. You\'re doing better than you think. 🌿\n\nTell me what\'s been stressing you out the most lately.',
      'Pressure from work, studies, or family is something so many of us deal with silently. You did the right thing by reaching out. What\'s been the hardest part for you?'
    ]
  },
  {
    patterns: ['lonely', 'alone', 'isolated', 'no friends', 'no one cares', 'akela'],
    replies: [
      'Loneliness can feel so painful, especially when you feel unseen. But right now, I want you to know — I\'m here, and I care about how you\'re doing. 🤝\n\nWould you like to share more about what\'s been making you feel this way?',
      'Feeling alone doesn\'t mean you are alone. Many people struggle with loneliness in silence. I\'m listening — tell me about your world.'
    ]
  },
  {
    patterns: ['angry', 'anger', 'frustrated', 'irritated', 'rage', 'furious', 'gussa'],
    replies: [
      'It\'s completely okay to feel angry — it\'s a valid emotion. Sometimes anger is a signal that something important to us has been hurt or ignored. 🔥\n\nWhat happened that made you feel this way?',
      'Anger can be exhausting to carry around. Let\'s talk about what\'s triggering these feelings — sometimes just putting it into words helps.'
    ]
  },
  {
    patterns: ['sleep', 'insomnia', "can't sleep", 'tired', 'exhausted', 'fatigue'],
    replies: [
      'Poor sleep can really affect how we feel emotionally and physically. Our minds need rest just as much as our bodies do. 🌙\n\nIs it racing thoughts keeping you awake, or something else?',
      'Sleep difficulties are often connected to stress or anxiety. You\'re not alone in this. What do you notice happening when you try to sleep?'
    ]
  },
  {
    patterns: ['relationship', 'breakup', 'divorce', 'family', 'parents', 'marriage', 'love', 'heartbreak'],
    replies: [
      'Relationship struggles can be some of the most painful experiences. Whether it\'s family pressure, a breakup, or something else entirely — your feelings are completely valid. 💔\n\nI\'m here to listen without judgment. What\'s going on?',
      'In India, family and relationship expectations can sometimes feel overwhelming. You don\'t have to navigate this alone. Share as much or as little as you\'d like.'
    ]
  },
  {
    patterns: ['help', 'helpme', 'please help', 'madad', 'i need help'],
    replies: [
      'I\'m right here with you. 🙏 You\'ve already taken a brave step by asking for help. Tell me what\'s going on — I\'m listening.',
      'Reaching out for help is one of the bravest things you can do. I\'m here. What do you need?'
    ]
  },
  {
    patterns: ['better', 'good', 'happy', 'great', 'okay', 'fine', 'khush'],
    replies: [
      'That\'s wonderful to hear! 😊 Remember, maintaining mental wellness is a daily practice. Is there anything on your mind you\'d like to talk about or reflect on?',
      'I\'m so glad you\'re feeling good! How can I support you today? Sometimes sharing our wins is just as important as sharing our struggles.'
    ]
  },
  {
    patterns: ['thank', 'thanks', 'shukriya', 'dhanyawad', 'helpful'],
    replies: [
      'You\'re always welcome. 🙏 Remember, you\'re never alone. MannMitra is always here whenever you need to talk.',
      'It\'s my pleasure. Taking care of your mental health is so important, and I\'m proud of you for doing that. Take care! 💛'
    ]
  },
  {
    patterns: ['gita', 'bhagavad', 'krishna', 'shloka', 'geeta', 'gyan'],
    replies: [
      'The Bhagavad Gita holds timeless wisdom for life\'s challenges. 🙏 The Gita teaches us: "You have a right to perform your duties, but you are not entitled to the fruits of your actions." This means focus on your effort, not the outcome. Would you like to explore today\'s Gita verse?',
      'Shri Krishna\'s teachings in the Gita are truly profound. 📖 One of my favourite lessons: "Let a man lift himself by his own self; let him not degrade himself; for the self alone is the friend of oneself." You have the strength within you! Visit our Wisdom page for more Gita guidance.'
    ]
  },
  {
    patterns: ['naval', 'ravikant', 'wealth', 'specific knowledge', 'leverage', 'happiness skill'],
    replies: [
      'Naval Ravikant\'s wisdom is incredibly practical. 💡 He says: "Happiness is a choice and a skill and you can dedicate yourself to learning that skill." Your happiness is something you can actively build — one day at a time.',
      'Naval teaches us: "A fit body, a calm mind, a house full of love — these things cannot be bought — they must be earned." 🌟 You\'re already on the right path by taking care of your mental health. Visit our Wisdom page for more Naval insights!'
    ]
  },
  {
    patterns: ['motivation', 'inspire', 'inspire me', 'motivate', 'motivated', 'prerana'],
    replies: [
      'Here\'s some wisdom from the Bhagavad Gita: 🌟 "Uddhared ātmanātmānaṁ" — Uplift yourself by your own efforts. You have the power within you. What small step can you take today?',
      'Naval Ravikant says: "You make your own luck if you stay at it long enough." Keep going — consistency and patience are your greatest allies. What goal are you working towards?'
    ]
  },
  {
    patterns: ['hindi', 'हिंदी', 'हिन्दी', 'हिंदी में', 'hindi mein'],
    replies: [
      'नमस्ते! 🙏 मैं MannMitra हूँ — आपका मानसिक स्वास्थ्य साथी। आप जो भी महसूस कर रहे हैं, उसे बेझिझक शेयर करें। मैं यहाँ सुनने के लिए हूँ।',
      'नमस्ते! 🌿 MannMitra में आपका स्वागत है। आप हिंदी में बात कर सकते हैं — आपकी हर बात पूरी तरह गोपनीय है। आज आप कैसा महसूस कर रहे हैं?'
    ]
  },
  {
    patterns: ['pareshan', 'pareshaan', 'tension', 'takleef', 'mushkil', 'problem', 'dikkat'],
    replies: [
      'मुझे पता है कि कभी-कभी जिंदगी बहुत कठिन लगती है। 💙 लेकिन याद रखें — "यह भी गुज़र जाएगा।" भगवद गीता कहती है: सुख-दुख आते-जाते रहते हैं, वे अनित्य हैं। आप क्या महसूस कर रहे हैं?',
      'आपकी परेशानी सुनकर मुझे दुख हुआ। लेकिन आप अकेले नहीं हैं। 🙏 मन की बात करने से बोझ हल्का होता है — बताइए क्या हो रहा है?'
    ]
  },
  {
    patterns: ['dil', 'mann', 'man', 'dil ki baat', 'dil se', 'dukh', 'dard'],
    replies: [
      'दिल की बात सुनना बहुत ज़रूरी है। 💛 MannMitra हमेशा आपके लिए यहाँ है। जो भी दर्द या दुख है — बेझिझक बताएं।',
      'जब दिल भारी हो, तो किसी से बात करना बहुत मददगार होता है। 🤝 मैं यहाँ हूँ — आप जो महसूस कर रहे हैं वो शेयर करें।'
    ]
  }
];

function getResponse(message) {
  const lower = message.toLowerCase();
  for (const rule of RESPONSES) {
    if (rule.patterns.some(p => lower.includes(p))) {
      const { replies } = rule;
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const defaults = [
    'Thank you for sharing that with me. 💙 I\'m here to listen and support you. Can you tell me more about how you\'ve been feeling?',
    'I hear you. Your feelings are valid, and it\'s okay to talk about them. Would you like to share more?',
    'That sounds really challenging. Remember, you don\'t have to go through this alone. I\'m here with you. What would be most helpful to talk about right now?'
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ── POST /api/chat ─────────────────────────────────────────────────────────────
router.post('/chat', chatLimiter, chatValidation, handleValidationErrors, (req, res, next) => {
  try {
    const trimmed = req.body.message.trim();
    const crisis = detectCrisis(trimmed);
    const reply = getResponse(trimmed);

    const response = { reply, crisis };
    if (crisis) {
      response.crisisMessage =
        '🚨 I noticed you may be going through something very difficult right now. Please know you are not alone.\n\n' +
        'Crisis Helplines (India):\n' +
        '• iCall: 9152987821\n' +
        '• Vandrevala Foundation: 1860-266-2345 (24×7)\n' +
        '• AASRA: 9820466627\n\n' +
        'Please reach out to a professional immediately, or click below to book a session with a counsellor.';
    }

    logger.info('Chat request processed', { crisis, messageLength: trimmed.length });
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/book ─────────────────────────────────────────────────────────────
router.post('/book', bookLimiter, bookingValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, email, phone, preferredTime, message } = req.body;

    const booking = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone,
      preferredTime: preferredTime || 'Any time',
      message: message || '',
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };

    insertBooking(booking);
    logger.info('New booking created', { bookingId: booking.id, email: booking.email });

    // Fire-and-forget emails
    sendUserConfirmation(booking).catch(err =>
      logger.error('User confirmation email failed', { error: err.message })
    );
    sendAdminNotification(booking).catch(err =>
      logger.error('Admin notification email failed', { error: err.message })
    );

    res.json({
      success: true,
      message: 'Your session request has been received! A counsellor will reach out to you shortly. 🙏',
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/bookings (admin use) ──────────────────────────────────────────────
const { requireAdminAuth } = require('../middleware/auth');
const { getAllBookings } = require('../database');

router.get('/bookings', requireAdminAuth, (req, res, next) => {
  try {
    res.json(getAllBookings());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.detectCrisis = detectCrisis;
module.exports.getResponse = getResponse;
