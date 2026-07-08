# InfoEnc Academy — Cybersecurity Learning Platform

A full-stack cybersecurity learning platform with courses, hacking labs, CTF challenges, leaderboards, and more.

> **Platform rebuild in progress.** INFOENC is being rebuilt as a two-platform company (security services + academy) on Next.js 15 / NestJS / PostgreSQL. The codebase below is the validated MVP; the rebuild is driven by the phased documentation in [`docs/`](docs/):
>
> - [Phase 1 — Business Analysis & Requirements](docs/phase-1-business-analysis/README.md)
> - [Phase 2 — System Architecture](docs/phase-2-architecture/README.md)
> - [Phase 3 — Database Design](docs/phase-3-database/README.md) — with real Prisma schema in [`prisma/schema/`](prisma/schema/)
> - [Phase 4 — Design System](docs/phase-4-design-system/README.md) — with real tokens in [`packages/ui/tokens/`](packages/ui/tokens/) and a [Tailwind preset](packages/config/tailwind-preset.ts)
> - [Phase 5 — Core Platform Build](docs/phase-5-core-platform/README.md) — monorepo scaffold, [`@infoenc/contracts`](packages/contracts/), [core-api skeleton](services/core-api/) with RLS tenant isolation, and [RLS migrations](prisma/migrations/)
> - [Phase 6 — Academy Build](docs/phase-6-academy/README.md) — identity/auth, the idempotent [XP engine](services/core-api/src/modules/gamification/), catalog, labs lifecycle (dynamic flags, envelope crypto, orchestrator), commerce/billing, [`@infoenc/i18n`](packages/i18n/) with a passing parity gate, and the [`academy`](apps/academy/) Next.js app
> - [Phase 7 — Company Platform](docs/phase-7-company-platform/README.md) — CRM lead intake + scoring, proposals + the won→engagement flywheel, and the crown-jewel [engagements module](services/core-api/src/modules/engagements/) (field-level encryption + four-layer defense in depth)
> - [Phase 8 — Automation Layer](docs/phase-8-automation/README.md) — the [LLM gateway + workflow engine](services/core-api/src/modules/automation/) (Claude, per-workflow data boundaries, human-approval gate, earned autonomy) with the FR-AU-050 pentest-report generator as showcase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL 8+ |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Security | Helmet, CORS, Rate Limiting, input validation |

## Features

- **Authentication** — Register/login with JWT access + refresh tokens, bcrypt password hashing
- **Courses** — Browse, filter, enroll, lesson progress tracking, certificates
- **Hacking Labs** — CTF-style challenges with flag submission, point system, hints
- **In-browser Terminal** — Simulated terminal for lab interaction
- **Leaderboard** — All-time and weekly rankings
- **Achievements** — Automatic badge system tied to progress
- **Dashboard** — Personal stats, progress tracking, recent activity
- **Notifications** — In-app notification system
- **Admin-ready** — Role-based access (student / instructor / admin)

## Quick Start

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secrets
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`, API at `http://localhost:5000`.

## Project Structure

```
infoenc/
├── database/
│   └── schema.sql          # Full MySQL schema + seed data
├── backend/
│   ├── server.js            # Express app entry
│   └── src/
│       ├── config/          # DB connection
│       ├── middleware/       # Auth, validation
│       ├── routes/           # Route definitions
│       └── controllers/      # Business logic
└── frontend/
    └── src/
        ├── api/              # Axios API client w/ token refresh
        ├── components/       # Reusable UI components
        ├── context/          # Auth context
        └── pages/            # Route pages
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Courses
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | List courses (filter/search/paginate) |
| GET | `/api/courses/:slug` | Get course detail |
| POST | `/api/courses/:id/enroll` | Enroll in course |
| GET | `/api/courses/lesson/:id` | Get lesson |
| POST | `/api/courses/lesson/:id/complete` | Mark lesson complete |

### Labs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/labs` | List labs (filter/search/paginate) |
| GET | `/api/labs/:slug` | Get lab detail |
| POST | `/api/labs/:slug/submit` | Submit flag |
| GET | `/api/labs/:slug/hint` | Get hint |
| GET | `/api/labs/leaderboard` | Get leaderboard |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/dashboard` | Get dashboard data |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/password` | Change password |

## Security Features

- JWT with short-lived access tokens (15m) + rotating refresh tokens (7d)
- bcrypt password hashing (cost factor 12)
- Rate limiting: 200 req/15min global, 10/15min for auth, 15/min for flag submission
- Helmet.js security headers
- CORS restricted to frontend origin
- Input validation via express-validator
- SQL injection protection via parameterized queries (mysql2)
- XSS prevention via input sanitization

## Environment Variables

See `backend/.env.example` for required configuration.
