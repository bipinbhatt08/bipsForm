# BipsForm

A full-stack form builder. Create forms, collect responses, and analyze results — with conditional logic, custom themes, response limits, and expiry controls.

**Live:** [bipsform.com](https://bipsform.com) · **API:** [api.bipsform.com](https://api.bipsform.com) · **Docs:** [api.bipsform.com/docs](https://api.bipsform.com/docs)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

---

## Features

### Form Builder
- 9 field types: `short_text`, `long_text`, `email`, `phone`, `number`, `date`, `rating`, `single_select`, `multi_select`
- Drag-and-drop field reordering
- Per-field validations: `minLength`, `maxLength`, `min`, `max`, `maxRating`, `minDate`, `maxDate`
- Conditional logic: show/hide fields based on previous answers (`equals`, `not_equals`, `contains`, `is_filled`, `is_empty`)

### Form Controls
- **Publish/Draft** — draft forms are invisible to the public
- **Public/Private** — public forms appear on the explore page
- **Password protection** — optional password gate for respondents
- **Response limit** — auto-close form after N submissions
- **Expiry date** — auto-close form after a set date/time

### Themes (5)
| Theme | Style |
|---|---|
| Minimal | Clean gray, system font |
| Retro | Warm brown, serif, shadow borders |
| Neon | Dark background, green accent, monospace |
| Anime | Pink accent, rounded corners, soft shadows |
| Nature | Green accent, serif, subtle shadows |

### Dashboard & Analytics
- User stats: total forms, total responses, today's responses
- Per-form analytics: daily submission chart, total count
- Submissions table: paginated, sortable, full response view
- Public explore page with search and theme filtering

### Auth
- Email/password signup and login
- Passwords hashed with HMAC-SHA256 + per-user random salt
- JWT stored in `httpOnly` cookie
- Protected dashboard routes via Next.js middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TailwindCSS 4, Radix UI |
| Backend | Express 5, tRPC 11 |
| Database | PostgreSQL 17 via Neon Serverless |
| ORM | Drizzle ORM |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack React Query 5 |
| Tables | TanStack React Table 8 |
| Charts | Recharts 3 |
| Drag & Drop | @dnd-kit |
| Logging | Winston |
| API Docs | Scalar + trpc-to-openapi |
| Monorepo | pnpm 9 + Turborepo |

---

## Architecture

```
https://bipsform.com        (Vercel — Next.js)
          │
          │  tRPC over HTTP · httpLink · credentials: include
          ▼
https://api.bipsform.com    (Render — Express)
          │
          │  Drizzle ORM
          ▼
    Neon PostgreSQL
```

**Request flow:**
1. User interacts with the Next.js frontend
2. React Hook Form + Zod validates input client-side
3. tRPC client sends request to the Express API with the auth cookie
4. `authenticatedProcedure` verifies the JWT from the cookie
5. Procedure calls the relevant service (UserService, FormService, etc.)
6. Service executes Drizzle ORM queries against Neon PostgreSQL
7. Result flows back through tRPC → React Query → UI

---

## Project Structure

```
bipsForm/
├── apps/
│   ├── web/                         # Next.js 16 frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/           # Sign in page
│   │   │   │   └── signup/          # Registration page
│   │   │   ├── (landing)/
│   │   │   │   ├── page.tsx         # Landing page
│   │   │   │   ├── explore/         # Browse public forms
│   │   │   │   └── pricing/         # Pricing page
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Stats + charts
│   │   │   │   └── forms/
│   │   │   │       ├── page.tsx               # Forms list
│   │   │   │       └── [formId]/
│   │   │   │           ├── page.tsx           # Form builder
│   │   │   │           ├── submissions/       # Responses table
│   │   │   │           └── analytics/         # Form analytics
│   │   │   └── forms/[slug]/        # Public form render + submit
│   │   ├── components/              # Shared UI components
│   │   ├── trpc/                    # tRPC client setup
│   │   ├── providers/               # React Query + theme providers
│   │   └── env.js                   # Client env validation (t3-env)
│   │
│   └── api/                         # Express 5 backend
│       └── src/
│           ├── index.ts             # HTTP server entry point
│           ├── server.ts            # Express app, CORS, rate limit, routes
│           └── env.ts               # Server env validation (Zod)
│
├── packages/
│   ├── trpc/                        # Shared tRPC definition
│   │   ├── server/                  # Router, procedures, context (used by API only)
│   │   │   ├── routers/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── form.ts
│   │   │   │   └── submission.ts
│   │   │   └── trpc.ts              # publicProcedure / authenticatedProcedure
│   │   └── client/                  # ServerRouter type export (used by web)
│   ├── database/                    # Drizzle ORM
│   │   ├── models/                  # Table definitions
│   │   ├── drizzle/                 # Migration SQL files
│   │   ├── schema.ts                # Combined schema export
│   │   ├── seed.ts                  # Demo data seeder
│   │   └── drizzle.config.ts
│   ├── services/                    # Business logic (used by API only)
│   │   ├── user/                    # Auth, password hashing, JWT
│   │   ├── form/                    # Form CRUD + ownership checks
│   │   ├── form-field/              # Field management + reordering
│   │   └── submission/              # Submit, validate, analytics
│   └── logger/                      # Winston logger (shared)
│
├── setup.sh                         # Symlinks root .env into all apps & packages
├── turbo.json                       # Turborepo task config + env allowlist
├── pnpm-workspace.yaml
└── docker-compose.yml               # Local PostgreSQL 15
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `full_name` | varchar(80) | |
| `email` | varchar(255) | UNIQUE |
| `email_verified` | boolean | default false |
| `profile_image_url` | text | nullable |
| `salt` | text | 16-byte random hex |
| `password` | varchar | HMAC-SHA256(salt, password) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `forms`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `title` | varchar(55) | |
| `description` | varchar(500) | nullable |
| `created_by` | UUID FK | → users.id |
| `is_published` | boolean | default false |
| `is_public` | boolean | default false |
| `is_locked` | boolean | default false |
| `password_hash` | varchar | nullable |
| `theme_id` | text | minimal / retro / neon / anime / nature |
| `slug` | text | UNIQUE, URL-safe |
| `response_limit` | integer | nullable |
| `expires_at` | timestamp | nullable |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `form_fields`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `form_id` | UUID FK | → forms.id |
| `label` | varchar(100) | |
| `label_key` | varchar(100) | slug-like key |
| `description` | text | nullable |
| `placeholder` | text | nullable |
| `is_required` | boolean | default false |
| `index` | numeric | sort order; UNIQUE per form |
| `type` | enum | short_text, long_text, email, phone, number, date, rating, single_select, multi_select |
| `options` | jsonb | `[{id, label, value}]` — select fields only |
| `validations` | jsonb | `{minLength, maxLength, min, max, maxRating, minDate, maxDate}` |
| `conditions` | jsonb | `{fieldId, operator, value}` |

### `form_submissions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `form_id` | UUID FK | → forms.id |
| `values` | jsonb | `{ [fieldId]: value }` |
| `created_at` | timestamp | |

---

## API Reference

Interactive docs: [api.bipsform.com/docs](https://api.bipsform.com/docs)

### Auth
| Procedure | Type | Description |
|---|---|---|
| `auth.createUserWithEmailAndPassword` | mutation | Register a new user |
| `auth.signInUserWithEmailAndPassword` | mutation | Sign in, sets `httpOnly` cookie |
| `auth.logout` | mutation | Clears auth cookie |
| `auth.getLoggedInUserInfo` | query | Returns current user info |

### Forms
| Procedure | Type | Description |
|---|---|---|
| `form.getMyForms` | query | All forms owned by current user |
| `form.createForm` | mutation | Create a new form |
| `form.getFormById` | query | Get form by ID (authenticated) |
| `form.getFormBySlug` | query | Get form by slug (public) |
| `form.getPublicForms` | query | List all public published forms |
| `form.updateForm` | mutation | Update title, theme, publish state, limits, etc. |
| `form.deleteForm` | mutation | Delete a form and all its fields |
| `form.getFormFields` | query | Get all fields for a form |
| `form.createFormField` | mutation | Add a new field |
| `form.updateFormField` | mutation | Edit label, type, options, validations, conditions |
| `form.deleteFormField` | mutation | Remove a field |
| `form.reorderFields` | mutation | Update field order by index |

### Submissions
| Procedure | Type | Description |
|---|---|---|
| `submission.submitForm` | mutation | Submit a form response (rate-limited: 3 req/min) |
| `submission.getFormSubmissions` | query | Paginated, sortable submissions list |
| `submission.getFormAnalytics` | query | Daily breakdown + total count |
| `submission.getDashboardStats` | query | User stats: form count, response count, top forms |
| `submission.getPublicStats` | query | Platform-wide totals |

---

## Local Development

### Prerequisites

- Node.js >= 18
- pnpm 9 — `npm install -g pnpm@9`
- Docker (for local PostgreSQL)

### 1. Clone and install

```bash
git clone https://github.com/bipinbhatt08/bipsForm.git
cd bipsForm
pnpm install
```

### 2. Configure environment

All apps and packages read from the **root `.env`**. `setup.sh` symlinks it into every `apps/*` and `packages/*` directory that doesn't already have its own `.env`, so you manage one file.

Create `.env` in the repo root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dev

# Auth
JWT_SECRET=your-local-dev-secret-32-chars-min

# API
BASE_URL=http://localhost:8000

# Web
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
NEXT_PUBLIC_FRONTEND_BASE_URL=http://localhost:3000
```

Then run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Start the database

```bash
docker-compose up -d
# PostgreSQL at localhost:5432
# user: postgres | password: postgres | db: dev
```

### 4. Initialize the database

```bash
pnpm db:generate   # Generate migration files from schema
pnpm db:migrate    # Apply migrations to the database
pnpm db:seed       # (Optional) Load demo data
```

> The seed creates: `demo@bipsform.com` / `demo1234` with 6 sample forms across all themes.

### 5. Start all services

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Drizzle Studio | `pnpm --filter @repo/database dev` |

---

## Environment Variables

All variables live in the root `.env` and are symlinked into every package by `setup.sh`. In production, set them directly in the platform dashboard — never commit secrets.

| Variable | Required | Read by | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | API, database | PostgreSQL connection string |
| `JWT_SECRET` | Yes | API (services) | Secret for signing JWTs — min 32 chars |
| `BASE_URL` | Yes | API | Full public URL of the API server |
| `NEXT_PUBLIC_API_URL` | Yes | web | Full API URL with `/trpc` suffix |
| `NEXT_PUBLIC_FRONTEND_BASE_URL` | Yes | web | Full public URL of the web app |
| `PORT` | No | API | Port to listen on (default: 8000) |
| `NODE_ENV` | No | API | `development` or `prod` (default: development) |

> **Turborepo note:** `DATABASE_URL`, `JWT_SECRET`, `BASE_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_FRONTEND_BASE_URL` are all declared in `turbo.json`'s `env` array. Any variable missing from that list will be stripped from the build and silently undefined.

---

## Deployment

### Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string: `postgresql://user:pass@host/db?sslmode=require`
3. Use it as `DATABASE_URL` in both platform dashboards below
4. Apply migrations: set `DATABASE_URL` in your local root `.env` to the Neon string, then run `pnpm db:migrate`

### API — Render

- **Root Directory:** `apps/api`
- **Build Command:** `pnpm build`
- **Start Command:** `node dist/index.js`

Environment variables to set in Render dashboard:

```env
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=<strong-random-secret>
BASE_URL=https://api.bipsform.com
NODE_ENV=prod
```

### Frontend — Vercel

- **Root Directory:** `apps/web`
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `turbo run build` (auto-detected)

Environment variables to set in Vercel dashboard:

```env
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=<same-secret-as-api>
NEXT_PUBLIC_API_URL=https://api.bipsform.com/trpc
NEXT_PUBLIC_FRONTEND_BASE_URL=https://bipsform.com
```

> `NEXT_PUBLIC_*` variables are inlined at build time. After adding or changing them in Vercel, trigger a redeploy.

---

## Scripts

All run from the repo root.

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in parallel with hot reload |
| `pnpm build` | Production build for all apps |
| `pnpm lint` | Lint all packages |
| `pnpm check-types` | TypeScript check all packages |
| `pnpm format` | Prettier format all `.ts`, `.tsx`, `.md` files |
| `pnpm db:generate` | Generate Drizzle migration files from schema changes |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `pnpm db:seed` | Seed demo data (safe to re-run — clears previous seed) |

---

## Troubleshooting

**`relation "users" does not exist`**
Migrations haven't been applied. Run `pnpm db:generate` then `pnpm db:migrate`.

**Requests hitting `localhost:8000` in production**
`NEXT_PUBLIC_API_URL` is not reaching the build. Check two things:
1. The variable is set in your Vercel project dashboard
2. `NEXT_PUBLIC_API_URL` is listed in `turbo.json`'s `env` array — if missing, Turborepo strips it before Next.js sees it

**`.env` missing in a package**
Run `./setup.sh` — it creates symlinks from the root `.env` into any app or package directory that doesn't have one.

**CORS error in browser**
The allowed origins are hardcoded in `apps/api/src/server.ts`. If your frontend URL changes, update `allowedOrigins` in that file.

**`Invalid user token` / auth failures**
`JWT_SECRET` must be identical on the API (Render) and web (Vercel). Mismatched secrets cause all authenticated requests to fail.

**`ECONNREFUSED 5432`**
Local PostgreSQL is not running. Start it with `docker-compose up -d`.

**Render API slow on first request**
Render free tier spins down after inactivity. The first request after idle takes ~30s to cold-start.
