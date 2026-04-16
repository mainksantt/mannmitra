# 🌿 MannMitra — Your Mental Wellness Companion

A lightweight mental health web app built for the Indian audience. MannMitra provides a safe, confidential space to share feelings, detect crises, and connect with human counsellors.

Readme · MDCopyMannMitra — मन की बात, मित्र के साथ

मन (Mann) + मित्र (Mitra) = Mind + Friend

India's most complete mental wellness platform. AI companion, verified counsellors, and neuroscience-backed tools — in Hindi and English. Free. No login. 24×7.
🔗 Live: https://mannmitra.up.railway.app
💻 GitHub: https://github.com/mainksantt/mannmitra

Three Pillars
PillarSanskritPurposeMann 🤖मन — Mind24/7 AI companion, crisis detection, bilingualMitra 🤝मित्र — FriendVerified counsellors + WhatsApp peer groupsVigyan 🔬विज्ञान — ScienceMeta AI TRIBE v2 neuroscience integration

Features

🗣️ Bilingual AI Chat — Hindi + English, crisis-aware
🚨 SOS Widget — Panic attack tools on every page, no login
🫁 4-7-8 Breathing — Interactive animated exercise
✋ 5-4-3-2-1 Grounding — Tap-to-complete sense grounding
🤲 Touch 5 Things — Physical somatic grounding
📞 Crisis Helplines — iCALL, Vandrevala, AASRA, NIMHANS
📖 Bhagavad Gita Wisdom — Daily shlokas with mental health context
💡 Naval Ravikant Insights — Modern philosophy for resilience
🔬 TRIBE v2 Demo — Meta AI brain response explorer (Vigyan pillar)
🤝 Human Counsellors — Book verified Indian counsellors
🔒 Security-first — CSRF, Helmet, rate limiting, session management
📊 Admin Dashboard — Manage bookings and sessions


Scientific Foundation
Built on Meta AI's TRIBE v2 — the world's first digital twin of human neural activity.

70× higher brain resolution than previous models
500+ hours of fMRI data from 700+ subjects
Zero-shot generalisation to Hindi, Tamil & other Indian languages
Released under CC BY-NC license


Tech Stack
Backend:   Node.js · Express · SQLite (better-sqlite3)
Security:  Helmet · CSRF · express-session · rate-limit
Frontend:  Vanilla JS · HTML5 · CSS3
Fonts:     Sora · Playfair Display · Space Mono
Deploy:    Railway (primary) · Render (alternative) 
## Features

- **Landing Page** — Clean, minimal design tailored for an Indian audience with warm colours and culturally sensitive language
- **AI Chat Interface** — Rule-based empathetic chat companion available 24×7 with quick-reply suggestions
- **Crisis Detection** — Keyword-based detection that immediately surfaces Indian crisis helplines (iCall, Vandrevala, AASRA) and a booking CTA
- **Human Support Booking** — Simple form to request a counselling session (no login required)
- **No Authentication** — Fully open, privacy-first

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript (no build step needed)
- **Backend:** Node.js + Express
- **No database** — lightweight, demo-ready

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero, features, how-it-works, crisis banner |
| Chat | `/chat.html` | AI chat interface with crisis detection |
| Support | `/support.html` | Human counsellor booking form |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Send a message, receive AI reply + crisis flag |
| POST | `/api/book` | Submit a counselling session request |

## Crisis Keywords

The `/api/chat` endpoint detects phrases like *"want to die"*, *"hopeless"*, *"kill myself"*, *"self-harm"*, etc. and returns `crisis: true` along with Indian helpline numbers in the response.

## Disclaimer

MannMitra is a supportive tool and is **not** a substitute for professional mental health care. In an emergency, please call **112** or visit your nearest hospital.




