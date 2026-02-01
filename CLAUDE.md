# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

viral-kid is a Next.js 16 / React 19 social media monitoring and automation dashboard. It tracks viral content across Twitter, YouTube, Reddit, and Instagram, with multi-account OAuth management and AI-powered automated reply pipelines.

## Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run worker:dev       # Start BullMQ worker (watch mode)

# Quality checks - run after editing ANY file
npm run check            # typecheck + lint + format (ZERO TOLERANCE)
npm run typecheck        # TypeScript only
npm run lint             # ESLint with auto-fix
npm run format           # Prettier with auto-fix

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to DB (no migration)
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Vitest watch mode
npm run test:run         # Vitest single run
npm run test:e2e         # Playwright E2E tests
```

## Architecture

### API Structure

Each social platform has its own API module under `src/app/api/{platform}/`:

- `credentials/` - Store/retrieve platform API keys
- `oauth/` - OAuth flow endpoints
- `automations/` - Automation configuration CRUD
- Platform-specific endpoints (trending, replies, comments, etc.)

### Data Layer

- **Prisma ORM** with PostgreSQL - schema in `prisma/schema.prisma`
- **Multi-tenancy** via `userId` foreign key on all models
- **Per-platform credentials** stored in dedicated tables (TwitterCredentials, YouTubeCredentials, etc.)
- **Generated client** in `src/generated/prisma/` - do not edit

### Background Jobs

Two options for scheduled tasks:

1. **BullMQ Worker** (self-hosted, requires Redis)
   - Jobs defined in `src/lib/jobs/`
   - Add new jobs: `types.ts` → `processors.ts` → `queues.ts`

2. **Vercel Cron** (serverless)
   - Endpoints in `src/app/api/cron/`
   - Configured in `vercel.json`

### Key Directories

```
src/lib/{platform}/     # Platform-specific API clients and utilities
src/lib/jobs/           # BullMQ job definitions and processors
src/components/ui/      # shadcn/ui components (TailwindCSS v4)
prisma/migrations/      # Database migration history
```

## Environment Variables

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth.js session encryption

Optional:

- `REDIS_URL` - For BullMQ (default: `redis://localhost:6379`)
- `CRON_SECRET` - Vercel cron authentication

## Testing

Unit tests are co-located with source files (`.test.ts` suffix). E2E tests in `e2e/`.

```bash
# Run single test file
npx vitest run src/lib/validation.test.ts

# Run tests matching pattern
npx vitest run -t "rate limiter"
```

## Slash Commands

Custom Claude Code commands in `.claude/commands/`:

- `/commit` - Run checks, generate commit message, push
- `/fix` - Parallel agents to fix type/lint/format errors
- `/update-app` - Update dependencies, fix deprecations
