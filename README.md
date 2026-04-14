# 🌿 MannMitra — Your Mental Wellness Companion

A lightweight mental health web app built for the Indian audience. MannMitra provides a safe, confidential space to share feelings, detect crises, and connect with human counsellors.

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

## Deploying to Railway

1. Create a new Railway project and connect this repository.
2. Railway will use `railway.json` and run `npm start`.
3. Set the environment variables listed in `.env.example` in Railway:
   - `NODE_ENV=production`
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`
   - `ADMIN_EMAIL`
   - `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` (if you want email delivery)
4. Data persistence:
   - Data is stored in a local SQLite file (`DATABASE_PATH`, default `./mannmitra.db`) and is ephemeral on Railway without a volume, so data will be lost on redeploy/restart.
   - Attach a Railway volume and set `DATABASE_PATH` to the mounted file path (for example, `/data/mannmitra.db`) if you want persistence.

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
