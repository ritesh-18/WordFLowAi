# WordFlow AI — System Architecture
*Design Review Document · Production-Grade System*

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  Next.js 14 App Router · React · Tailwind · Framer Motion      │
│  ┌──────────┐ ┌──────────────┐ ┌───────────┐ ┌─────────────┐  │
│  │  Landing  │ │  Auth Pages  │ │ Dashboard │ │  Practice   │  │
│  └──────────┘ └──────────────┘ └───────────┘ └─────────────┘  │
│         │              │              │               │          │
│         └──────────────┴──────────────┴───────────────┘         │
│                               │                                  │
│               Supabase JS SDK (auth-helpers-nextjs)              │
└───────────────────────────────┼─────────────────────────────────┘
                                │ HTTPS / WebSocket
┌───────────────────────────────▼─────────────────────────────────┐
│                      SUPABASE PLATFORM                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Auth      │  │  PostgreSQL  │  │  Storage (audio blobs) │  │
│  │  (JWT/OTP) │  │  + RLS       │  │                        │  │
│  └────────────┘  └──────────────┘  └────────────────────────┘  │
│                         │                                        │
│              Realtime WebSocket subscriptions                    │
└───────────────────────────────────────────────────────────────  ┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    FUTURE: AI SERVICES (MVP 2.0)                │
│  ┌─────────────────┐   ┌──────────────────────────────────────┐ │
│  │  OpenAI Whisper │   │  Claude / GPT-4 Feedback Engine      │ │
│  │  (transcription)│   │  (communication coaching, insights)  │ │
│  └─────────────────┘   └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Modular Architecture

The codebase is split into vertical slices — each feature owns its types, hooks, components, and page:

```
src/
├── app/              ← Next.js routing (pages + layouts)
├── components/       ← UI: auth | dashboard | focus | speech | word-streamer | layout | ui
├── hooks/            ← Stateful logic, decoupled from UI
├── lib/              ← Pure utilities: supabase clients, analyzers, word lists
└── types/            ← Shared TypeScript contracts
```

**Key design principle**: Components never talk to Supabase directly — they call hooks or server actions. Data fetching on dashboard pages is done in Server Components (zero client JS for initial load).

---

## 3. Data Flow

### Practice Session Flow
```
User selects theme & WPM
       │
       ▼
ThemePicker → useWordStreamer (local state, setInterval timer)
       │
       ▼
Words flash in browser (no network calls during streaming)
       │
 User speaks ──► SpeechRecorder ──► Web Speech API (transcription)
                      │                       │
                      ▼                       ▼
              MediaRecorder (audio)     calcWpmFromTranscript()
                      │                       │
                      └──────────┬────────────┘
                                 ▼
                         SpeechAnalysis result
                                 │
                                 ▼
                    session.update() → Supabase
                    speech_metrics.insert() → Supabase
                    streak trigger fires → Supabase
```

### Dashboard Data Flow
```
Server Component (dashboard/page.tsx)
       │
       ▼
supabase.from('sessions').select()     ← Server-side, zero bundle cost
supabase.from('streaks').select()
supabase.from('speech_metrics').select()
       │
       ▼
Props to Client Components (ProgressChart, StreakDisplay, StatsCard)
```

---

## 4. Database Schema

```sql
profiles         → extends auth.users (id, email, full_name, avatar_url)
user_settings    → per-user prefs (default_wpm, preferred_theme, reminder_time)
theme_packs      → id, slug, name, description, color, icon
words            → id, theme_id, word, definition, difficulty
sessions         → id, user_id, theme_id, wpm, words_practiced, duration_seconds
speech_metrics   → id, session_id, user_id, spoken_wpm, pause_count, transcription
streaks          → id, user_id, current_streak, longest_streak, last_practice
```

**Row Level Security** is enabled on every table. Users can only read/write their own rows. `theme_packs` and `words` are publicly readable.

**Triggers**:
- `on_auth_user_created` — auto-creates `profiles`, `user_settings`, `streaks` on signup
- `on_session_completed` — auto-increments streak when `sessions.completed` → true

---

## 5. API Architecture

WordFlow AI uses **Supabase PostgREST** as its API — no custom REST or GraphQL layer needed for MVP.

| Operation | Method |
|---|---|
| Auth (signup/login/logout) | `supabase.auth.*` |
| Read theme packs + words | `supabase.from('theme_packs').select()` |
| Create/update session | `supabase.from('sessions').insert/update` |
| Save speech metrics | `supabase.from('speech_metrics').insert` |
| Read dashboard stats | Server Component `select` calls |
| Update user settings | `supabase.from('user_settings').upsert` |

For MVP 2.0, Next.js Route Handlers (`/api/*`) will be added for AI service proxying.

---

## 6. Word Streaming Real-Time Architecture

```
useWordStreamer hook
  │
  ├── words[]          ← loaded from Supabase once, held in state
  ├── currentIndex     ← React state, incremented by setInterval
  ├── wpm              ← controls interval duration (60000/wpm ms)
  └── setInterval()    ← drives word advance; cleared on pause/stop
```

- **No WebSocket needed** — streaming is driven by `setInterval` in the browser
- Each WPM change dynamically adjusts the interval
- Framer Motion animates each word transition (scale + opacity, 120ms)
- Progress bar animates via `motion.div width`

---

## 7. Speech Processing Pipeline

```
Microphone input (getUserMedia)
       │
       ├──► Web Audio API ──► AnalyserNode ──► amplitude samples (rAF, ~60fps)
       │                                              │
       │                                     detectPausesFromAmplitude()
       │                                     → pauseCount, longestPauseMs
       │
       └──► MediaRecorder ──► audio/webm blobs (saved locally)
       │
       └──► SpeechRecognition API (continuous, en-US)
                │
                ▼
         transcript string
                │
         calcWpmFromTranscript(transcript, durationMs)
                │
                ▼
         SpeechAnalysisResult { spokenWpm, pauseCount, longestPauseMs, transcription }
                │
                ▼
         saved to speech_metrics table in Supabase
```

**MVP 2.0** will replace SpeechRecognition with **OpenAI Whisper** (server-side) for higher accuracy and word-level timestamps for precise pause detection.

---

## 8. PPT/PDF Parsing Pipeline (MVP 2.0)

```
User uploads file → Supabase Storage (raw bucket)
       │
       ▼
Next.js Route Handler /api/parse-presentation
       │
       ├── PDF: pdf-parse / pdfjs-dist → extract text per slide
       └── PPT/PPTX: pptx2json / officegen → extract text per slide
       │
       ▼
Slide objects: [{ index, title, body }]
       │
       ▼
Stored in presentations table (Supabase)
       │
       ▼
Client loads slides → user speaks per slide
       │
       ▼
Speech recorded per slide → Whisper transcription
       │
       ▼
Claude/GPT-4 prompt: "Given slide content X, user said Y. Evaluate delivery quality, detect if reading verbatim vs explaining, suggest improvements."
       │
       ▼
Feedback stored → shown in practice review UI
```

---

## 9. AI Feedback Engine (MVP 2.0)

**Communication Mirror**:
```
Accumulate 5+ speech_metrics records
       │
       ▼
Prompt: "Analyse these speech patterns: {metrics}. Identify: filler words, avg pause frequency, WPM consistency, speaking confidence. Provide 3 specific improvement suggestions."
       │
       ▼
Claude claude-sonnet-4-6 → structured JSON response
       │
       ▼
Store in ai_insights table → shown in Communication Mirror page
```

**Model choice**: Claude claude-sonnet-4-6 for coaching text (nuanced, safe), Whisper for transcription.

---

## 10. Dashboard Analytics System

All analytics are computed at query time — no separate analytics DB for MVP:

```sql
-- Average WPM trend (last 30 sessions)
SELECT DATE(started_at), AVG(wpm) FROM sessions
WHERE user_id = $1 AND completed = true
GROUP BY DATE(started_at) ORDER BY 1 LIMIT 30;

-- Total practice time
SELECT SUM(duration_seconds)/60 FROM sessions
WHERE user_id = $1 AND completed = true;

-- Speech improvement over time
SELECT DATE(recorded_at), AVG(spoken_wpm) FROM speech_metrics
WHERE user_id = $1 GROUP BY DATE(recorded_at) ORDER BY 1;
```

Charts rendered client-side via **Recharts** (LineChart). For scale (>100K users), move to materialised views refreshed hourly.

---

## 11. Notification & Reminder System

**Browser-based (MVP 1.0)**:
- `Notification.requestPermission()` → user grants
- `scheduleReminder(timeString)` → `setTimeout` calculated to next occurrence of time
- Reschedules itself daily after firing
- Stored in `user_settings.reminder_time`

**Push notifications (MVP 2.0)**:
```
Web Push API (VAPID keys)
       │
       ├── Service Worker registers push subscription
       └── Subscription endpoint stored in Supabase
       │
Supabase Edge Function (cron, runs daily at reminder time)
       └── Sends push to all users with reminders enabled
```

---

## 12. Scaling Strategy for 1M Users

| Layer | Strategy |
|---|---|
| **Frontend** | Vercel Edge Network CDN — static pages cached globally |
| **Database** | Supabase Pro → dedicated PostgreSQL with read replicas |
| **Connection pooling** | PgBouncer (bundled with Supabase) — handles 10K concurrent connections |
| **Analytics queries** | Materialised views, refreshed every 15 min via pg_cron |
| **Word data** | Cached in CDN as static JSON (words don't change often) |
| **Auth** | Supabase Auth scales horizontally; JWT validation is stateless |
| **Speech processing** | Whisper API (OpenAI) — stateless, scales with requests |
| **AI feedback** | Claude API — stateless; add queue (BullMQ/Redis) for rate limiting |

**Bottleneck mitigation**:
- Sessions table: partition by `user_id % 10` at 10M+ rows
- Add `created_at` range indexes for time-based dashboard queries
- Archive sessions > 1 year to cold storage (S3)

---

## 13. Caching Strategy

```
Browser                         CDN (Vercel)              Database
  │                                │                          │
  ├── Word lists                   ├── Static pages (ISR)     ├── Materialised views
  │   (localStorage, 24h TTL)      │   revalidate: 3600s      │   (analytics, 15m refresh)
  │                                │                          │
  ├── User settings                ├── Theme pack data        ├── Query result cache
  │   (React state, session)       │   (staleTime: 1h)        │   (pg_cache, hot rows)
  │                                │                          │
  └── Session data                 └── Auth pages             └── Connection pool
      (in-memory during session)       (no-cache)                 (PgBouncer, 100 pool)
```

**React Query** (MVP 2.0) will replace manual `useState` + `useEffect` data fetching with automatic stale-while-revalidate caching.

---

## 14. Storage Design

```
Supabase Storage Buckets:
  ├── audio-recordings/         ← user speech recordings
  │   └── {user_id}/{session_id}.webm
  │   Policy: owner-only read/write; 30-day auto-delete
  │
  ├── presentation-uploads/     ← PPT/PDF files (MVP 2.0)
  │   └── {user_id}/{presentation_id}.{pptx|pdf}
  │   Policy: owner-only; max 50MB per file
  │
  └── avatars/                  ← user profile pictures
      └── {user_id}/avatar.{jpg|png|webp}
      Policy: public read, owner write; max 2MB
```

Audio recordings are optional in MVP 1.0 — the analysis happens in-browser and only metrics are persisted to PostgreSQL.

---

## 15. Observability & Monitoring

**MVP 1.0** (minimal):
- Vercel Analytics — page views, Core Web Vitals
- Supabase Dashboard — query performance, DB size, auth events
- Browser `console.error` boundaries in React components

**Production (MVP 2.0)**:
```
Application errors   → Sentry (client + server)
Performance traces   → OpenTelemetry → Grafana
DB slow queries      → pg_stat_statements → alert if > 500ms
API latency          → Uptime Robot (synthetic checks every 5min)
Cost anomalies       → AWS/Vercel spend alerts
```

**Key metrics to track**:
- P95 session load time < 200ms
- Speech analysis latency < 3s
- DB query P99 < 100ms
- Auth success rate > 99.9%

---

## 16. Security Design

| Concern | Control |
|---|---|
| **Authentication** | Supabase Auth — bcrypt passwords, JWT (1h expiry), refresh tokens |
| **Authorisation** | Row Level Security on every table — enforced at DB level, not application |
| **CSRF** | Next.js built-in CSRF protection for Server Actions |
| **XSS** | React escapes all output; no `dangerouslySetInnerHTML` |
| **Input validation** | Zod schemas on all form inputs (MVP 2.0) |
| **Secrets** | All keys in env vars; service role key never exposed to client |
| **Audio data** | Processed in-browser; not uploaded unless user consents |
| **Rate limiting** | Supabase Auth has built-in brute-force protection; API routes add `express-rate-limit` |
| **HTTPS** | Enforced by Vercel; HSTS headers set |
| **Dependencies** | `npm audit` in CI; Dependabot enabled |

---

## 17. Infrastructure Cost Estimation

### MVP 1.0 (0–1K users/month)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| Supabase | Free tier | $0 |
| Domain | Namecheap | ~$1 |
| **Total** | | **~$1/month** |

### Growth Stage (10K–100K users/month)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Supabase Storage | 100GB | $3.75 |
| OpenAI Whisper API | ~500K min audio | ~$300 |
| Claude API | ~1M tokens/day | ~$150 |
| **Total** | | **~$500/month** |

### Scale Stage (1M users/month)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Enterprise | ~$2,000 |
| Supabase | Enterprise | ~$600 |
| AWS S3 (audio) | 10TB | ~$230 |
| OpenAI / Whisper | High volume | ~$3,000 |
| Claude API | Enterprise | ~$1,500 |
| Redis (BullMQ) | Upstash | ~$100 |
| Monitoring (Sentry, Grafana) | | ~$150 |
| **Total** | | **~$7,580/month** |

At 1M users with a $10/month subscription, revenue = $10M/month → 0.08% cost ratio.

---

## 18. Failure Scenarios & Resilience

| Failure | Impact | Mitigation |
|---|---|---|
| **Supabase outage** | Users cannot log in or save sessions | Optimistic UI — session state held in browser memory; synced when DB returns |
| **SpeechRecognition API unavailable** | No live transcription | Graceful fallback — audio recorded, analysis skipped; user sees "Transcription unavailable" |
| **Word streamer loses focus (tab switch)** | setInterval fires incorrectly | `visibilitychange` event pauses the streamer automatically |
| **Vercel deploy failure** | New version breaks | Vercel instant rollback to previous deployment |
| **Browser microphone permission denied** | No speech recording | Error state shown with instructions to enable permissions |
| **Supabase trigger failure (streak)** | Streak not updated | Client-side streak refetch after session complete as fallback |
| **Large PPT file upload timeout** | Presentation parse fails | Chunked upload with resumable upload API (TUS protocol, built into Supabase Storage) |
| **AI API rate limit hit** | Feedback delayed | Queue requests with BullMQ; user sees "Analysis pending" with polling |
| **DB connection exhaustion** | 503 errors | PgBouncer connection pooling; circuit breaker via pg_bouncer max_client_conn |

### Health checks
```
GET /api/health
  → { status: "ok", db: "ok", storage: "ok", timestamp: "..." }
```

Checked every 60s by Uptime Robot; PagerDuty alert if 2 consecutive failures.

---

*WordFlow AI System Architecture v1.0 — MVP 1.0 baseline*
*For MVP 2.0 additions: AI pipelines, Presentation Simulator, Communication Mirror*
