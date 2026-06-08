# M_Management

Hospitality operations dashboard for a portfolio of 8 Vietnamese properties.

This repository is a React 19 + TypeScript + Vite 7 frontend backed by Supabase. It uses shadcn/ui primitives, Tailwind CSS v4, and a custom Harbor & Hearth visual system to present property, guest, occupancy, and maintenance data in a multi-panel operations dashboard.

## Current Status

This project is partially productized and partially scaffolded.

- The main dashboard experience is implemented and wired to Supabase.
- The runtime data flow is **Supabase-first**, not static mock data.
- Several older docs still describe a `src/data` architecture that is no longer the current runtime truth.
- There is **no automated test suite** and **no CI workflow** in the repo.
- Authentication and production-grade RLS are not fully implemented yet.
- Some navigation and header controls are presentational scaffolding rather than fully connected workflows.

## Critical Caveats

Read these before making changes:

1. **Treat `ARCHITECTURE.md`, `IMPLEMENTATION.md`, and `NEXT_STEPS.md` as historical context.** They still describe an older static-data flow.
2. **Do not revive `src/data` as the live source of truth** unless you intentionally redesign the current Supabase-based runtime.
3. **Supabase credentials are required for the app to run correctly.** The client is created directly from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `src/lib/supabase.ts`.
4. **Verification is manual.** The standard checks today are `npm run typecheck` and `npm run build`, plus UI validation in the browser.
5. **The package name in `package.json` is still `shadcn-ui-template`.** That is a scaffold artifact, not the actual product name.

## What the App Currently Does

The current dashboard focuses on operations visibility across properties.

### Implemented dashboard surfaces

- Left sidebar navigation shell
- Top header with greeting, notifications, and date-range UI
- KPI summary cards
- Occupancy chart
- Revenue overview panel
- Recent arrivals table
- Branch comparison table
- Arrivals detail panel
- Departures detail panel
- Occupancy detail panel
- Maintenance detail panel
- Right-side bookings panel on extra-large screens

### Current data-driven behavior

- Fetches live rows from Supabase tables:
  - `properties`
  - `rooms`
  - `guests`
  - `guest_requests`
  - `maintenance_issues`
- Computes per-property metrics in `src/hooks/use-dashboard-data.ts`
- Computes portfolio totals in the same hook
- Shows a skeleton loading state while data is loading

### Not fully implemented yet

- Authentication flows
- Production-ready role-based access control
- Automated tests
- CI/CD workflow
- Fully wired navigation sections across the sidebar
- Fully functional global filters/date controls across the dashboard

## Tech Stack

### Frontend

- React 19
- TypeScript 5
- Vite 7
- shadcn/ui (New York style)
- Tailwind CSS v4
- Lucide React
- Recharts
- next-themes

### Backend / data

- Supabase
- PostgreSQL schema managed through SQL migrations in `supabase/migrations`

## Runtime Architecture

### Entry points

- `src/main.tsx` mounts the app inside `ThemeProvider`
- `src/App.tsx` builds the shell with `SidebarProvider`, `AppSidebar`, and `DashboardPage`
- `src/components/dashboard/dashboard-page.tsx` assembles the main dashboard panels

### Data flow

The current runtime flow is:

1. `src/lib/supabase.ts` creates the Supabase client from Vite env vars
2. `src/hooks/use-dashboard-data.ts` fetches rows from Supabase tables
3. The same hook computes derived metrics and totals
4. `DashboardPage` passes those values into presentation panels

### Theme system

`src/index.css` defines the global design system and Tailwind v4 token mapping.

Key tokens include:

- Harbor: primary action and UI emphasis
- Harbor Deep: deeper accent color
- Brass: status / hospitality accent
- Plus Jakarta Sans: body text
- Newsreader: headings

## Data Model Overview

The frontend contracts live in `src/types/database.ts`.

### Core entities

- `Property`
- `Room`
- `Guest`
- `GuestRequest`
- `MaintenanceIssue`
- `PropertyMetrics`

### Operational status fields already modeled

- Room status
- Guest check-in / check-out status
- Maintenance severity
- Maintenance status

## Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── dashboard/          # App-specific dashboard panels and composition
│   │   ├── ui/                 # Reusable shadcn/ui-style primitives
│   │   ├── app-sidebar.tsx     # Main navigation shell
│   │   └── theme-provider.tsx  # Theme context
│   ├── hooks/                  # Shared hooks, including dashboard data loading
│   ├── lib/                    # Shared utilities and Supabase client
│   ├── types/                  # Shared TypeScript model contracts
│   ├── App.tsx                 # Shell composition
│   ├── main.tsx                # App bootstrap
│   └── index.css               # Global theme tokens and Tailwind v4 mapping
├── supabase/
│   └── migrations/             # SQL schema and seed data
├── AGENTS.md                   # Repo guidance for coding agents
├── ARCHITECTURE.md             # Historical architecture notes, partly stale
├── IMPLEMENTATION.md           # Historical implementation notes, partly stale
└── NEXT_STEPS.md               # Historical roadmap notes, partly stale
```

## Local Agent Guidance

If you are using agent tooling in this repo, there are scoped guidance files in addition to the root `AGENTS.md`:

- `src/components/dashboard/AGENTS.md`
- `src/components/ui/AGENTS.md`
- `supabase/migrations/AGENTS.md`

These files provide more specific local rules than the root guide.

## Getting Started

### Prerequisites

- Node.js with npm
- Access to a Supabase project with the expected schema

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a local env file such as `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Because `src/lib/supabase.ts` creates the client immediately from these values, you should treat both variables as required for local runtime work.

### Start the development server

```bash
npm run dev
```

### Preview a production build locally

```bash
npm run build
npm run preview
```

## Available Scripts

### `npm run dev`

Starts the Vite development server.

### `npm run typecheck`

Runs TypeScript checking without emitting files.

### `npm run build`

Runs TypeScript project build checks and then produces the Vite production bundle.

### `npm run preview`

Serves the built app locally for preview.

## Database and Migrations

The repo includes SQL migrations under `supabase/migrations`.

### Current migration intent

- One migration creates the portfolio dashboard schema
- One migration seeds demo portfolio data

### Schema characteristics currently present

- Core hospitality tables for properties, rooms, guests, requests, and maintenance
- RLS enabled on all core tables
- Public read demo policies currently present for dashboard access

### Important note for schema changes

If you change schema or field names in migrations, you also need to update:

- `src/types/database.ts`
- `src/hooks/use-dashboard-data.ts`
- Any affected dashboard panels

## Development Workflow

The current workflow is lightweight and manual.

1. Install dependencies
2. Add local Supabase env vars
3. Run `npm run dev`
4. Make code changes
5. Run `npm run typecheck`
6. Run `npm run build`
7. Manually validate affected UI behavior in the browser

## Verification

There is no test suite today, so use the following as the minimum bar before considering a change complete:

```bash
npm run typecheck
npm run build
```

For UI changes, also check the affected screen manually.

## Known Gaps and Risks

- Missing automated test coverage
- Missing CI pipeline
- Older docs can mislead contributors about the live architecture
- Auth is not yet implemented end to end
- RLS is still demo-oriented, not hardened for production
- Several sidebar destinations are UI scaffolding rather than complete features

## Recommended Files to Read First

If you are onboarding to the repo, start here:

1. `AGENTS.md`
2. `src/main.tsx`
3. `src/App.tsx`
4. `src/components/dashboard/dashboard-page.tsx`
5. `src/hooks/use-dashboard-data.ts`
6. `src/types/database.ts`
7. `src/index.css`
8. `supabase/migrations/20260409044835_create_portfolio_schema.sql`

## License / Ownership

No explicit license file is currently present in the repository.
