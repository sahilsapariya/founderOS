# FounderOS

> **One Dashboard. One Workspace. Complete Clarity.**

An AI-powered operating system for founders — projects, tasks, calendar, finance, goals, notes, GitHub, habits, and AI insights in a single premium command center.

## Project Structure

- `apps/web` — Next.js 15 web application (App Router, React 19, Tailwind v4)
- `packages/` — Shared packages (populated as modules extract in later phases)
  - `ui` · `ai` · `integrations` · `database` · `types` · `utils`
- `supabase/` — Supabase configuration and migrations (Phase 2)
- `docs/` — Product vision, PRD, design system, UI spec, roadmap

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · shadcn-style components · Framer Motion · Recharts · Lucide Icons · Supabase · OpenAI SDK · Turborepo · Vercel

## Getting Started

```bash
# 1. Install dependencies (from the repo root)
npm install

# 2. (Optional, for Phase 2 features) configure environment
cp apps/web/.env.example apps/web/.env.local

# 3. Start the dev server
npm run dev
```

The dashboard currently runs on realistic mock data (`apps/web/src/lib/mock-data.ts`); Supabase auth and live integrations land next per `docs/09-roadmap.md`.

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start all apps in dev mode        |
| `npm run build` | Production build via Turborepo    |
| `npm run test`  | Run tests                         |

## Documentation

Start with [`docs/01-product-vision.md`](docs/01-product-vision.md) — every doc builds on it.
