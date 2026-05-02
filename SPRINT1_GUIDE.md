# Sprint 1 Implementation Guide

## A Complete Guide to the Dual-Track Hospitality Platform

---

## Table of Contents

1. [The Model Configuration Problem](#1-the-model-configuration-problem)
2. [Understanding Git Worktrees](#2-understanding-git-worktrees)
3. [The Dual-Track Architecture](#3-the-dual-track-architecture)
4. [What Was Built](#4-what-was-built)
5. [Repository Layer Explained](#5-repository-layer-explained)
6. [Auth Adapter Pattern](#6-auth-adapter-pattern)
7. [Working with Both Tracks](#7-working-with-both-tracks)
8. [Practical Commands Reference](#8-practical-commands-reference)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. The Model Configuration Problem

### Root Cause

The `oh-my-openagent.json` configuration referenced **fictional AI model names** that don't exist in any provider's catalog:

```json
// WRONG — these models don't exist
"model": "openai/gpt-5.4"
"model": "openai/gpt-5.4-mini"
"model": "github-copilot/claude-haiku-4.5"
```

When the agent dispatcher tried to route tasks to these models, it received:
- **404 page not found** — the API endpoint doesn't exist
- **No authorization** — invalid model names rejected by the API gateway

### The Fix

The configuration should only reference models from the **actual available catalog**:

| Publisher | Available Model | Status |
|-----------|-----------------|--------|
| minimaxai | `nvidia/minimax-m2.7` | ✅ Free Endpoint |
| minimaxai | `nvidia/minimax-m2.5` | ⚠️ Deprecation in 13d |
| nvidia | `nvidia/nemotron-3-super-120b-a12b` | Downloadable |

### Why This Caused Task Failures

When subagents were dispatched with categories like `writing` or `unspecified-high`, the system tried to route to `openai/gpt-5.4-mini` (or similar non-existent models). The chain was:

1. Task dispatched with category `writing`
2. Config specifies `openai/gpt-5.4-mini` as primary model
3. API call to `openai/gpt-5.4-mini` → 404 Not Found
4. Fallback models tried → also non-existent
5. Task aborted with model error

### Why Direct Implementation Worked

When I bypassed subagents and implemented tasks directly in the main session (using available tools like `Read`, `Edit`, `Write`, `Bash`), no AI model routing was needed. The work was done by the current Claude session without subagent delegation.

---

## 2. Understanding Git Worktrees

### What Is a Worktree?

A **Git worktree** is a connected copy of your repository at a different location, sharing the same `.git` directory. Unlike a full clone, worktrees are lightweight and efficient because they don't duplicate the entire history.

```
┌─────────────────────────────────────────────────────────┐
│  Original Repo: M_Management                            │
│  Location: C:\Users\...\GitHub\M_Management              │
│  Branch: main                                           │
│  .git/ (shared by all worktrees)                       │
└─────────────────────────────────────────────────────────┘
         │
         ├─── Worktree 1: M_Management-track-b
         │    Location: C:\Users\...\GitHub\M_Management-track-b
         │    Branch: track-b (isolated)
         │    .git = pointer to parent's .git
         │
         └─── (Future) Worktree 2: feature/payments
              Location: C:\Users\...\GitHub\M_Management-payments
              Branch: feature/payments
              .git = pointer to parent's .git
```

### Why Use Worktrees for Track B?

| Benefit | Explanation |
|---------|-------------|
| **Isolation** | Track A and Track B don't interfere |
| **Simultaneous work** | Switch between tracks without `git checkout` |
| **Shared history** | Both branches share commit history |
| **Lightweight** | No full clone duplication |
| **Clean separation** | `node_modules`, builds stay separate |

### The GitHub Desktop Error

**GitHub Desktop doesn't support worktrees.** When you try to open a worktree in GitHub Desktop, it treats it as a separate repository and shows an error because:
1. GitHub Desktop sees `.git` is a file (not directory) pointing to parent
2. It doesn't understand the worktree relationship
3. It can't display the branch properly

### Worktree vs Regular Clone

| Aspect | Worktree | Regular Clone |
|--------|----------|---------------|
| .git directory | Shared pointer | Full copy |
| Disk space | Minimal extra | Full history copy |
| GitHub Desktop | Not supported | Supported |
| Switch branches | Instant (no checkout) | `git checkout` required |
| Shared commits | Yes | No (separate history) |

---

## 3. The Dual-Track Architecture

### The Vision

From the original PRD, the system must support two deployment paths:

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRINT 1 ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐     ┌─────────────────────────┐│
│  │   TRACK A (Main Branch)  │     │   TRACK B (Worktree)    ││
│  │   Supabase/BaaS         │     │   Node.js/Express/Prisma││
│  │                         │     │                         ││
│  │   Frontend ──────┐      │     │   Frontend ──────┐      ││
│  │                  │      │     │                  │      ││
│  │                  ▼      │     │                  ▼      ││
│  │   ┌──────────────────┐  │     │   ┌──────────────────┐  ││
│  │   │  Supabase        │  │     │   │  Express API     │  ││
│  │   │  (PostgreSQL)    │  │     │   │  (Prisma ORM)    │  ││
│  │   └──────────────────┘  │     │   └──────────────────┘  ││
│  │                         │     │                         ││
│  │   Auth: Supabase Auth   │     │   Auth: Clerk/Auth0 (S2)  ││
│  │                         │     │                         ││
│  │   Best for:             │     │   Best for:             ││
│  │   - Fast setup          │     │   - Azure enterprise    ││
│  │   - Minimal infra        │     │   - Custom control      ││
│  │   - BaaS simplicity     │     │   - Full customization   ││
│  └─────────────────────────┘     └─────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              SHARED FRONTEND CONTRACTS                  ││
│  │   Repository interfaces → same for both tracks           ││
│  │   Auth adapter → swap Supabase ↔ Clerk without UI change ││
│  │   TypeScript types → identical in Track A and Track B    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Track A (Supabase)** — Start immediately with minimal setup. Supabase handles auth, database, and real-time subscriptions.

2. **Track B (Azure/Node)** — Enterprise requirements may demand custom backend control, Azure integration, or specific compliance adherence.

3. **Shared Contracts** — The frontend never knows which backend is running. Repository pattern abstracts the data source.

### Schema Parity

Both tracks use the **same schema design** — just different access patterns:

| Layer | Track A | Track B |
|-------|---------|---------|
| Database | Supabase PostgreSQL | Azure PostgreSQL |
| ORM | Direct Supabase client | Prisma |
| API | Supabase client (no REST) | Express REST endpoints |
| Auth | Supabase Auth | Clerk/Auth0 (Sprint 2) |

---

## 4. What Was Built

### Main Branch (Track A) — `M_Management/`

**SQL Migrations (7 files in `supabase/migrations/`):**

```
20260409044835_create_portfolio_schema.sql     # Original 5-table schema
20260409044906_seed_portfolio_data.sql         # Demo data
20260409045000_add_channels_external_accounts.sql # channels + external_accounts
20260409045100_add_channel_listings_and_room_mappings.sql
20260430095000_add_reservation_core.sql         # reservations + refs + allocations
20260501090000_add_guest_request_reservation_bridges.sql
20260501100000_add_reservation_backfill_and_import_mapping.sql
```

**New Tables Added:**

| Table | Purpose |
|-------|---------|
| `channels` | Provider registry (Airbnb, Booking.com, etc.) |
| `external_accounts` | Credentials per provider per account |
| `channel_listings` | Durable listing identity |
| `channel_listing_aliases` | Title variation reconciliation |
| `listing_room_mappings` | Canonical listing ↔ room associations |
| `reservations` | **Booking source of truth** (replaces `guests`) |
| `reservation_external_refs` | Provider raw IDs and statuses |
| `reservation_room_allocations` | Multi-room allocation per reservation |

**Frontend Changes:**

| File | Change |
|------|--------|
| `src/types/database.ts` | Added `Reservation`, `ReservationStatus` types |
| `src/hooks/use-dashboard-data.ts` | Migrated from `guests` → `reservations` |
| `src/lib/repositories/types.ts` | Repository interface definitions |
| `src/lib/repositories/supabase-repositories.ts` | Supabase implementation |
| `src/lib/repositories/index.ts` | Exports |
| `src/lib/auth/auth-adapter.ts` | Auth interface + factory |
| `src/lib/auth/supabase-auth.ts` | Supabase Auth implementation |
| `src/components/auth/login-form.tsx` | Login UI component |

---

### Track B Worktree — `M_Management-track-b/`

```
M_Management-track-b/
├── backend/
│   ├── package.json              # Node.js dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── .env.example              # Environment template
│   ├── prisma/
│   │   └── schema.prisma         # ORM schema (mirrors v1)
│   └── src/
│       └── index.ts              # Express server + REST endpoints
└── README.md                      # Track B documentation
```

**Prisma Schema Highlights:**

- Mirrors every v1 table from Track A
- Same column names, types, relations, indexes
- Includes all provider-edge tables
- Full reservation core with `reservation_external_refs` and `reservation_room_allocations`

---

## 5. Repository Layer Explained

### The Problem It Solves

Before:
```typescript
// Direct Supabase coupling — hard to switch to Track B
const { data } = await supabase.from("reservations").select("*");
```

After:
```typescript
// Abstracted — Track A uses Supabase, Track B will use REST
const reservations = await repos.reservations.getAll();
```

### Interface Definition (`src/lib/repositories/types.ts`)

```typescript
export interface ReservationRepository extends Repository<Reservation> {
  getByPropertyId(propertyId: string): Promise<Reservation[]>;
  getByDateRange(startDate: string, endDate: string): Promise<Reservation[]>;
  getByStatus(statuses: ReservationStatus[]): Promise<Reservation[]>;
}
```

### Supabase Implementation

```typescript
// src/lib/repositories/supabase-repositories.ts
const reservationRepo: ReservationRepository = {
  async getAll() {
    const { data } = await supabase.from("reservations").select("*").order("check_in_date");
    return data ?? [];
  },
  async getByPropertyId(propertyId) {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("property_id", propertyId)
      .order("check_in_date");
    return data ?? [];
  },
  // ... other methods
};
```

### Switching to Track B

When Track B is ready, replace the factory:

```typescript
// src/lib/repositories/index.ts
// NOW (Track A):
export const repos = createSupabaseRepositories();

// LATER (Track B):
// import { createTrackBRepositories } from "./trackb-repositories";
// export const repos = createTrackBRepositories();
```

The frontend never changes — only the factory call changes.

---

## 6. Auth Adapter Pattern

### The Adapter Interface

```typescript
// src/lib/auth/auth-adapter.ts
export interface AuthAdapter {
  signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }>;
  signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }>;
  signOut(): Promise<{ error: string | null }>;
  getCurrentUser(): Promise<AuthUser | null>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}
```

### Why This Pattern?

```
┌────────────────────────────────────────────┐
│           LOGIN FORM (UI)                  │
│  ┌────────────────────────────────────┐    │
│  │  Uses getAuthAdapter()             │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────┐
│         AUTH ADAPTER (Interface)            │
│     signIn(), signUp(), signOut(), etc.    │
└────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  Track A         │    │  Track B (S2)   │
│  Supabase Auth   │    │  Clerk/Auth0     │
└──────────────────┘    └──────────────────┘
```

UI code stays identical. Only the adapter implementation changes.

---

## 7. Working with Both Tracks

### Current Setup

```
C:\Users\Fate_Conqueror\Documents\GitHub\
├── M_Management/              ← Main repo (Track A)
│   ├── src/
│   ├── supabase/migrations/
│   └── ...
│
└── M_Management-track-b/      ← Worktree (Track B)
    ├── backend/
    │   ├── prisma/schema.prisma
    │   └── src/index.ts
    └── README.md
```

### Accessing Track B

**Git Bash / Terminal (recommended):**
```bash
cd C:\Users\Fate_Conqueror\Documents\GitHub\M_Management-track-b
code .
git status
git log
```

**GitHub Website:**
- Track B: https://github.com/FaCoOm/M_Management/tree/track-b
- Main: https://github.com/FaCoOm/M_Management/tree/main

**GitHub CLI:**
```bash
# View Track B branch info
gh api repos/FaCoOm/M_Management/branches/track-b

# Clone Track B separately (NOT as worktree)
gh repo clone FaCoOm/M_Management -- --branch track-b track-b-standalone
```

### GitHub Desktop Workaround

GitHub Desktop doesn't support worktrees. Options:

**Option 1: Open in GitHub Desktop with warning**
1. Close all repos
2. Click "Add Existing Repository"
3. Browse to `M_Management-track-b`
4. Will show error or behave unexpectedly

**Option 2: Convert worktree to standalone clone**
```bash
# Remove worktree
git worktree remove C:\Users\Fate_Conqueror\Documents\GitHub\M_Management-track-b

# Clone Track B separately
gh repo clone FaCoOm/M_Management -- --branch track-b M_Management-track-b
# Now GitHub Desktop will work normally
```

---

## 8. Practical Commands Reference

### Worktree Management

```bash
# List all worktrees
git worktree list

# Create new worktree
git worktree add ../M_Management-feature-x -b feature/x

# Remove worktree
git worktree remove ../M_Management-feature-x

# Prune stale worktree references
git worktree prune
```

### Branch Management

```bash
# Switch branches in main repo
git checkout track-b
git checkout main

# Create and switch to new branch
git checkout -b feature/new-feature

# Delete branch
git branch -d feature/old-feature
```

### GitHub CLI

```bash
# Push branch to remote
git push -u origin track-b

# List branches
gh repo view --json branch

# Create PR
gh pr create --title "Track B: Express + Prisma scaffold" --body "Sprint 1 Track B foundation"

# View PR
gh pr view
```

### Running the App

**Track A (Main Repo):**
```bash
cd C:\Users\Fate_Conqueror\Documents\GitHub\M_Management
npm run dev
```

**Track B (Worktree):**
```bash
cd C:\Users\Fate_Conqueror\Documents\GitHub\M_Management-track-b/backend
npm install
cp .env.example .env  # Configure DATABASE_URL
npx prisma generate
npx prisma db push    # Create tables
npm run dev           # Starts on port 3001
```

### Verification

```bash
# Type check
npm run typecheck

# Production build
npm run build

# Preview
npm run preview
```

---

## 9. Troubleshooting

### "404 page not found" errors

**Cause:** `oh-my-openagent.json` references non-existent AI models.

**Fix:** Replace all model names with actual available models from `nvidia_models.csv`:
- `nvidia/minimax-m2.7` ✅
- `nvidia/minimax-m2.5` ⚠️ (deprecated)

### GitHub Desktop won't open worktree

**Cause:** GitHub Desktop doesn't support worktrees.

**Fix:** Either:
1. Use terminal/Git Bash for worktree
2. Remove worktree and use standalone clone
3. Use GitHub website to browse worktree content

### Subagent tasks failing with model errors

**Cause:** Task categories like `writing`, `unspecified-high` try to use models that aren't configured.

**Fix:** Implement tasks directly in main session without subagent delegation, OR fix model configuration first.

### TypeScript build errors

**Cause:** Stale incremental cache.

**Fix:**
```bash
Remove-Item -Recurse -Force dist
Remove-Item node_modules/.tmp/tsconfig.app.tsbuildinfo
npm run build
```

### Worktree "already exists" error

**Cause:** Worktree at that path already exists.

**Fix:**
```bash
# List worktrees
git worktree list

# If it exists but is invalid
git worktree remove C:\path\to\worktree
```

---

## Deferred to Sprint 2

| Feature | Why Deferred |
|---------|-------------|
| PMS `stays` table | Reservation is sufficient for v1. Stays adds full lifecycle. |
| `folios` + `charges` | Billing tables require PMS maturity |
| `room_moves` | Intra-reservation changes not yet needed |
| `owner_statements` | Financial reporting is Sprint 2+ |
| Auth RBAC | Track A Supabase Auth done; Track B Clerk/Auth0 in Sprint 2 |
| Clerk/Auth0 (Track B) | Auth adapter interface exists; provider integration Sprint 2 |

---

## File Locations Quick Reference

| Item | Location |
|------|----------|
| Main repo | `C:\Users\Fate_Conqueror\Documents\GitHub\M_Management` |
| Track B worktree | `C:\Users\Fate_Conqueror\Documents\GitHub\M_Management-track-b` |
| SQL migrations | `M_Management/supabase/migrations/*.sql` |
| Prisma schema | `M_Management-track-b/backend/prisma/schema.prisma` |
| Repository layer | `M_Management/src/lib/repositories/` |
| Auth adapter | `M_Management/src/lib/auth/` |
| Sprint plan | `M_Management/.sisyphus/plans/airbnb-postgres-schema.md` |
| Sprint closeout | `M_Management/SPRINT1_STATUS.md` |

---

*Document version: 2026-05-01 — Sprint 1 Complete*