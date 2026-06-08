# Sprint 1 Foundation: Dual-Track Hospitality Data Platform

## TL;DR
> **Summary**: Start with an explicit gap audit against the PRD/backlog, then complete Sprint 1 by establishing the balanced-core reservation schema on the Supabase main branch, defining the shared frontend data contract, and preparing the mirrored Track B branch foundation for the Azure/Node stack.
> **Deliverables**:
> - Existing-schema gap audit against `plans/Dual-Architecture PRD.md` and `plans/Scrum Backlog & Sprints.md`
> - New schema design for reservations, channel accounts, listings, listing aliases, listing-room mappings, reservation external references, and reservation room allocations
> - Compatibility migration strategy from current `guests`-driven runtime to `reservations`
> - Shared frontend repository/data contract for Track A and Track B switching
> - Track B branch/worktree foundation with mirrored Prisma schema and backend scaffold expectations
> - Auth/UI branch strategy sufficient to close Sprint 1 scope
> - RLS, indexing, seed, import-mapping, and verification plan for Supabase/PostgreSQL
> **Effort**: XL
> **Parallel**: YES - 3 waves
> **Critical Path**: Task 0 → Task 1 → Task 4 → Task 9 → Task 11

## Context
### Original Request
Analyze `database_design/`, comprehend the database we will be working with onward, and design a complete PostgreSQL database schema for the web application so it functions efficiently and effectively. Current business constraint: there are 3 Airbnb accounts in total, each with their own listings.

Additional direction received later: validate whether the current database is even fit for the intended product, revise the plan so it starts with a PRD/backlog gap audit, and expand the implementation scope so kickoff can complete **Sprint 1** while remaining ready for questions about both architecture branches.

### Interview Summary
- Schema scope is **channel-agnostic**, not Airbnb-only.
- Version 1 scope is **operations only**: no payouts/accounting and no auth/access-control tables.
- Architecture choice is **balanced core**: add a real `reservations` core now, keep a clear adaptation seam for PMS later.
- Booking model is **reservations-only now**, but the schema must leave a clean upgrade path to `stays` and fuller PMS lifecycle later.
- Current dashboard continuity matters, but additive migration is preferred over destructive replacement.
- Sprint execution target is **Sprint 1 completion**, not only isolated schema work.
- Branch awareness is required: **Track A** is the live Supabase/BaaS main branch, while **Track B** is the Azure/Node/Prisma sub-branch defined in the PRD.

### Metis Review (gaps addressed)
- Do **not** treat listing titles or internal names as stable identifiers; use explicit alias/mapping tables.
- Do **not** let Airbnb-specific fields leak into core operational tables.
- Do **not** rename/drop `guests` early; preserve compatibility during cutover.
- Support composite listings by using `reservation_room_allocations`, not just a single `room_id` on reservations.
- Introduce a dedicated provider-edge home for external reservation references/statuses rather than overloading the core reservation table.

## Work Objectives
### Core Objective
Design and implement an additive Supabase/PostgreSQL schema that supports three Airbnb accounts today, other channels later, preserves the current hospitality dashboard, and promotes reservations to the operational source of truth without forcing full PMS complexity in v1.

### Deliverables
- Existing-schema fitness report against PRD/backlog requirements
- SQL migration(s) for the balanced-core schema
- Updated seed/import support for channel accounts, listings, and reservation mappings
- Frontend type and hook changes required to consume the new reservation core safely
- Shared repository/data-contract layer for Supabase vs custom backend switching
- Track B backend scaffold plan and schema mirror contract for the sub-branch/worktree
- Authentication UI and provider abstraction plan aligned to Sprint 1
- Verification SQL for uniqueness, foreign-key integrity, unmapped imports, and dashboard compatibility
- Documentation updates for the new schema contract and deferred PMS path

### Canonical v1 Table Inventory
- **Retain as-is or additive-only**: `properties`, `rooms`, `guests`, `guest_requests`, `maintenance_issues`
- **New core**: `reservations`, `reservation_room_allocations`
- **New provider edge**: `channels`, `external_accounts`, `channel_listings`, `channel_listing_aliases`, `listing_room_mappings`, `reservation_external_refs`
- **Deferred, not in v1**: `brands`, `stays`, folios/charges, payouts, owner statements, auth/RBAC tables

### Definition of Done (verifiable conditions with commands)
- A gap audit exists showing where the current schema satisfies vs fails Sprint 1 stories from `plans/Scrum Backlog & Sprints.md`.
- `supabase_list_tables(schemas:["public"], verbose:true)` shows existing core tables plus all newly planned v1 tables.
- `supabase_execute_sql` assertions return `0` for orphaned listing mappings, orphaned reservation allocations, and duplicate external listing identities.
- `supabase_execute_sql` assertions show every imported reservation row either resolves to a mapped listing/room path or is explicitly captured as unmapped.
- The shared frontend data layer can point at Track A (Supabase) now and defines the exact contract Track B must satisfy later.
- A Track B sub-branch/worktree scaffold exists with mirrored schema contract in Prisma/ORM form and backend bootstrap files.
- `npm run typecheck` passes after `src/types/database.ts` and `src/hooks/use-dashboard-data.ts` are reconciled.
- `npm run build` passes after the frontend migration is complete.

### Must Have
- Start with explicit validation that the current schema is insufficient for PRD/backlog goals.
- Additive migration only; no destructive rewrite of current runtime tables in the first pass
- `reservations` as the new operational booking core
- Provider-edge abstraction for channels, external accounts, listing identities, and reservation external references
- Composite listing support via allocation/mapping tables
- Manual-safe import linkage for reservation CSVs that lack listing IDs
- Sprint 1 shared frontend foundation: TanStack Query + repository/data-contract abstraction
- Sprint 1 branch readiness: Track A implementation path and Track B mirrored scaffold expectations
- RLS and indexing plan aligned with current Supabase usage

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No `brands` table in v1
- No payouts, owner statements, folios, accounting ledger, or expense model in v1
- No auth/RBAC schema in v1
- No title-based or fuzzy-only matching as the durable source of truth
- No Airbnb-specific columns embedded across `properties`, `rooms`, or the reservation core
- No destructive rename/drop of `guests`, `properties`, `rooms`, `guest_requests`, or `maintenance_issues` during initial rollout
- No silent assumption that Track B enterprise infrastructure is identical to Track A runtime behavior; parity must be documented via explicit contracts

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after + manual repo verification; no existing test framework
- QA policy: Every task includes agent-executed SQL/data scenarios plus build verification where frontend coupling is affected
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 0: PRD/backlog gap audit and shared Sprint 1 contract decisions

Wave 1: canonical schema contract, channel/account layer, listing layer, reservation core

Wave 2: operational child integration, backfill/import strategy, frontend migration, repository/query abstraction

Wave 3: Track B branch scaffold, auth strategy, seed/policy/docs/branch closeout

### Dependency Matrix (full, all tasks)
| Task | Depends On | Enables |
|---|---|---|
| 0 | - | 1, 8, 9, 10, 11 |
| 1 | 0 | 2, 3, 4, 6, 7, 9, 10 |
| 2 | 1 | 3, 4, 6 |
| 3 | 1, 2 | 4, 6 |
| 4 | 1, 2, 3 | 5, 6, 7, 8, 9, 10 |
| 5 | 4 | 7, 8, 12 |
| 6 | 2, 3, 4 | 7, 8, 12 |
| 7 | 4, 5, 6 | 8, 12 |
| 8 | 0, 4, 5, 6, 7 | 11, 12 |
| 9 | 0, 1, 4, 7, 8 | 11, 12 |
| 10 | 0, 1, 4 | 12 |
| 11 | 0, 9, 10 | 12 |
| 12 | 5, 6, 7, 8, 9, 10, 11 | Final verification |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 0 → 1 task → `deep`
- Wave 1 → 4 tasks → `deep`, `quick`, `unspecified-high`
- Wave 2 → 5 tasks → `deep`, `quick`, `unspecified-high`
- Wave 3 → 3 tasks → `unspecified-high`, `writing`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 0. Audit the existing schema against the PRD and Sprint 1 backlog

  **What to do**: Produce a concrete gap matrix mapping the current Supabase schema and frontend contracts against the required Sprint 1 stories and PRD goals. Validate which existing tables are reusable, which are under-modeled, and which are missing entirely for reservations, ingestion idempotency, guest history, auth readiness, and dual-track branch architecture. This audit becomes the first implementation artifact and must govern all downstream changes.
  **Must NOT do**: Do not start migrations before the audit exists. Do not evaluate the schema only against the current dashboard; evaluate it against `plans/Dual-Architecture PRD.md` and `plans/Scrum Backlog & Sprints.md`.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this sets the boundary between demo-schema reuse and true Sprint 1 requirements.
  - Skills: [`backend-analysis`] - why needed: the task is an evidence-backed architecture audit, not a speculative rewrite.
  - Omitted: [`writing-skills`] - why not needed: this is product/schema audit work, not skill authoring.

  **Parallelization**: Can Parallel: NO | Wave 0 | Blocks: [1, 8, 9, 10, 11] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `plans/Dual-Architecture PRD.md:15-41` - branch definitions for Track A and Track B.
  - Pattern: `plans/Dual-Architecture PRD.md:51-67` - ingestion, entity management, and guest-history expectations.
  - Pattern: `plans/Scrum Backlog & Sprints.md:5-17` - Sprint 1 stories including reservations, auth, and repository pattern.
  - Pattern: `plans/Scrum Backlog & Sprints.md:24-43` - Sprint roadmap tasks that must be covered by kickoff.
  - Pattern: `supabase/migrations/20260409044835_create_portfolio_schema.sql:62-152` - current actual schema.
  - API/Type: `src/types/database.ts:1-84` - current frontend schema contract.

  **Acceptance Criteria** (agent-executable only):
  - [ ] An audit artifact exists listing: reusable tables, deficient tables, missing tables, and Sprint 1 features not supported by the current schema.
  - [ ] The audit explicitly concludes that the current schema is dashboard-sufficient but PMS-insufficient, with file-backed evidence.
  - [ ] The audit is referenced by subsequent migration and frontend tasks as the governing baseline.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: PRD/backlog coverage audit
    Tool: Bash + Read
    Steps: Read the audit artifact and verify it explicitly addresses Story-01, Story-02, Story-03, Story-04, and Story-05 plus PRD ingestion/idempotency and guest-history requirements.
    Expected: Every Sprint 1 story and relevant PRD requirement is mapped to current support, gap, or planned remediation.
    Evidence: .sisyphus/evidence/task-0-gap-audit.md

  Scenario: False-positive sufficiency check
    Tool: Bash + Read
    Steps: Inspect the audit artifact for unsupported claims that the current `guests` table already satisfies full reservations, CRM, or ingestion-idempotency requirements.
    Expected: The audit clearly marks these as gaps rather than treating them as solved.
    Evidence: .sisyphus/evidence/task-0-gap-audit-error.md
  ```

  **Commit**: YES | Message: `docs(plan): audit schema against sprint one` | Files: [`supabase/migrations/*`, `plans/*.md`, `.sisyphus/evidence/task-0-gap-audit.md`]

- [x] 1. Define the canonical v1 schema contract and migration safety boundaries

  **What to do**: Write the implementation decision record directly into the migration/design work: keep `properties`, `rooms`, `guest_requests`, and `maintenance_issues`; preserve `guests` during cutover; add `reservations` as the new core; defer `brands`, payouts, auth, and full PMS. Define the exact v1 table list, column naming conventions, status enums/check constraints, timestamp/date strategy, and backward-compatibility rules before writing any SQL.
  **Must NOT do**: Do not start by renaming/dropping legacy tables. Do not allow provider-specific columns into core tables. Do not use title/internal-name matching as a durable key.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this task locks the entire migration contract and prevents downstream schema churn.
  - Skills: [`backend-analysis`] - why needed: validates schema decisions against current runtime coupling and data-shape evidence.
  - Omitted: [`test-driven-development`] - why not needed: this is schema contract definition, not feature coding first.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 3, 4, 6, 7] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `supabase/migrations/20260409044835_create_portfolio_schema.sql:62-152` - current additive migration baseline and existing table contract.
  - Pattern: `supabase/migrations/AGENTS.md:13-30` - migration guardrails: additive changes, RLS review, type/hook reconciliation.
  - API/Type: `src/types/database.ts:1-84` - current manual frontend contract that must remain reconciled.
  - Pattern: `src/hooks/use-dashboard-data.ts:38-50` - current runtime reads exactly five tables and depends on legacy names.
  - External: `database_design/db-schema-airbnb.md:46-73` - existing listing/mapping idea to adapt, not copy verbatim.

  **Acceptance Criteria** (agent-executable only):
  - [ ] The plan/spec produced for implementation enumerates exact v1 core tables vs provider-edge tables with no unresolved placeholders.
  - [ ] The migration notes explicitly state that `guests` remains intact through initial cutover and that `brands`, payouts, auth, and PMS `stays` are deferred.
  - [ ] The chosen time model is explicit: reservation stay bounds use local stay dates, while sync/audit fields use `timestamptz`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Contract completeness check
    Tool: Bash + Read
    Steps: Read the authored migration/spec artifact and verify it lists `reservations`, `channels`, `external_accounts`, `channel_listings`, `channel_listing_aliases`, `listing_room_mappings`, `reservation_external_refs`, and `reservation_room_allocations`; verify `brands`, payouts, auth, and `stays` appear only in deferred sections.
    Expected: Every v1 entity is explicitly categorized, and every out-of-scope entity is explicitly excluded.
    Evidence: .sisyphus/evidence/task-1-schema-contract.md

  Scenario: Guardrail regression check
    Tool: Bash + Read
    Steps: Search the migration/spec artifact for prohibited decisions such as `DROP TABLE guests`, `ALTER TABLE guests RENAME`, or Airbnb-specific columns added to `properties`, `rooms`, or `reservations`.
    Expected: No destructive cutover statements and no provider leakage into core tables are present.
    Evidence: .sisyphus/evidence/task-1-schema-contract-error.md
  ```

  **Commit**: YES | Message: `feat(db): define v1 schema contract` | Files: [`supabase/migrations/*`, `.sisyphus/evidence/task-1-schema-contract.md`]

- [x] 2. Add the channel registry and external account layer

  **What to do**: Create normalized provider-edge tables for channel registry and owned accounts: `channels` (seeded with `airbnb`) and `external_accounts` (three current Airbnb accounts: `Main`, `Ruby`, `Manuka22`). Model stable uniqueness, active/archive semantics, sync timestamps, and raw metadata storage without assuming future providers behave identically. Keep account labels business-meaningful but not hardwired into property logic.
  **Must NOT do**: Do not make accounts equivalent to properties. Do not assume account display names are globally unique across channels. Do not put account IDs directly on `properties` or `rooms`.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: table creation and seed scaffolding are straightforward once Task 1 is fixed.
  - Skills: [] - why needed: existing migration style is sufficient.
  - Omitted: [`backend-analysis`] - why not needed: discovery is already complete for this layer.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [3, 4, 6] | Blocked By: [1]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `database_design/Main.csv:1-10` - demonstrates listing exports belonging to one account source with external listing IDs and URLs.
  - Pattern: `database_design/Ruby.csv:1-10` - demonstrates second account source and inconsistent internal naming.
  - Pattern: `database_design/Manuka22.csv:1-5` - demonstrates third account source.
  - Pattern: `database_design/db-schema-airbnb.md:46-63` - source idea for listing edge design, but adapt to channel-agnostic naming.
  - Pattern: `supabase/migrations/20260409044906_seed_portfolio_data.sql:16-25` - existing seeding style with `ON CONFLICT DO NOTHING`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `channels` exists with at least one seeded row for `airbnb` and unique machine-safe identifier semantics.
  - [ ] `external_accounts` exists with three seeded Airbnb accounts named from current source files and a uniqueness rule that prevents duplicate account identity within the same channel.
  - [ ] Archive/active fields and sync audit columns are present without requiring auth schema.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Account layer seed verification
    Tool: Supabase MCP / Bash
    Steps: Run `supabase_execute_sql` to select all rows from `channels` and `external_accounts` ordered by channel and account name; verify three Airbnb accounts exist with distinct rows for `Main`, `Ruby`, and `Manuka22`.
    Expected: One `airbnb` channel row and exactly three associated external account rows are returned.
    Evidence: .sisyphus/evidence/task-2-external-accounts.json

  Scenario: Duplicate account rejection
    Tool: Supabase MCP / Bash
    Steps: Attempt an insert of a duplicate `(channel_id, external_account_key)` combination via `supabase_execute_sql` inside a rollback-safe transaction.
    Expected: The insert fails on the uniqueness constraint and leaves row counts unchanged.
    Evidence: .sisyphus/evidence/task-2-external-accounts-error.json
  ```

  **Commit**: YES | Message: `feat(db): add channel account layer` | Files: [`supabase/migrations/*`, `.sisyphus/evidence/task-2-external-accounts.json`]

- [x] 3. Add channel listings, alias resolution, and listing-to-room mappings

  **What to do**: Create `channel_listings`, `channel_listing_aliases`, and `listing_room_mappings`. `channel_listings` stores stable provider listing identity plus URLs, status, extraction timestamps, and raw metadata. `channel_listing_aliases` stores import-safe alternate identifiers such as listing titles and internal-name variants (`CC 402` vs `CC - 402`) so reservation imports without listing IDs can resolve deterministically. `listing_room_mappings` links listings to one or many rooms, with one active mapping row minimum for sellable inventory and support for composite inventory such as `LL - Milk 2 & Coffee 2`.
  **Must NOT do**: Do not rely on a single `internal_name` column as the only matching surface. Do not collapse composite listings into fake rooms. Do not require fuzzy matching to import reservations.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this task mixes normalization, import safety, and multi-room mapping design.
  - Skills: [`backend-analysis`] - why needed: helps align edge-table semantics with actual CSV irregularities.
  - Omitted: [`writing-skills`] - why not needed: no skill authoring is involved.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [4, 6] | Blocked By: [1, 2]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `database_design/Main.csv:1-10` - stable listing IDs, public URLs, editor URLs, listing statuses, extracted timestamps.
  - Pattern: `database_design/Ruby.csv:2-10` - alias inconsistency examples including `CC - 401`, `LL  - Milk 2 & Coffee 2`, and mixed property formats.
  - Pattern: `database_design/db-schema-airbnb.md:65-73` - existing many-to-many mapping idea to evolve into active mapping semantics.
  - Pattern: `supabase/migrations/20260409044835_create_portfolio_schema.sql:79-89` - existing `rooms` table that remains canonical physical inventory.
  - Test: `database_design/reservations_data.csv:1-10` - reservation exports only carry listing title, driving alias-table necessity.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `channel_listings` uniquely identifies listings by provider/account/external listing identity and stores provider-edge metadata without polluting core inventory tables.
  - [ ] `channel_listing_aliases` can store at least one exact-match alias for title-based reservation imports and at least one normalized internal-name variant.
  - [ ] `listing_room_mappings` supports both 1:1 and 1:many listing-to-room relationships and prevents duplicate active mappings to the same listing-room pair.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Composite listing mapping
    Tool: Supabase MCP / Bash
    Steps: Insert or seed a listing modeled on `LL - Milk 2 & Coffee 2`, create two room mappings in `listing_room_mappings`, and query the joined mapping rows.
    Expected: One listing resolves to exactly two room rows with no duplicate mapping records.
    Evidence: .sisyphus/evidence/task-3-listing-mappings.json

  Scenario: Alias-based reservation resolution safety
    Tool: Supabase MCP / Bash
    Steps: Seed aliases for `CC 402` and `CC - 402`, then run a SQL lookup using both values against `channel_listing_aliases`.
    Expected: Both variants resolve to the same canonical `channel_listing_id`; an unknown title returns no canonical row and is left unmapped.
    Evidence: .sisyphus/evidence/task-3-listing-mappings-error.json
  ```

  **Commit**: YES | Message: `feat(db): add listings and room mappings` | Files: [`supabase/migrations/*`, `.sisyphus/evidence/task-3-listing-mappings.json`]

- [ ] 4. Introduce the reservation core, external reservation references, and room allocations

  **What to do**: Create `reservations` as the v1 booking source of truth with additive links to `property_id`, `primary_room_id` (nullable compatibility convenience), `channel_id`, `external_account_id`, and `channel_listing_id` when known. Store stay dates, operational status, headcount snapshot, guest-facing name/contact snapshot, and operational notes in the reservation row. Add `reservation_external_refs` for provider reservation identifiers and raw/provider statuses (e.g. confirmation code `HMX44ZA85B`, booking timestamp, raw payload). Add `reservation_room_allocations` so one reservation can allocate one or many physical rooms, even though most v1 records will be single-room bookings.
  **Must NOT do**: Do not treat `guests` as the long-term booking core. Do not force all reservations to single-room shape in a way that blocks composite inventory. Do not store earnings/accounting breakdown as normalized core fields in v1.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this is the central structural change with the most downstream impact.
  - Skills: [`backend-analysis`] - why needed: validates the split between core reservation data and provider-edge metadata.
  - Omitted: [`test-driven-development`] - why not needed: no preexisting database test harness exists; SQL verification is post-change.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [5, 6, 7, 8] | Blocked By: [1, 2, 3]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `supabase/migrations/20260409044835_create_portfolio_schema.sql:98-110` - current `guests` table shape that wrongly acts as booking storage.
  - Pattern: `src/hooks/use-dashboard-data.ts:57-80` - dashboard metrics derived from `guest` status and property linkage; replacement must preserve these semantics.
  - Test: `database_design/reservations_data.csv:1-10` - source fields available for reservation import (confirmation code, guest name/contact, dates, headcount, listing title, earnings).
  - Pattern: `database_design/db-schema-airbnb.md:95-98` - business driver for inventory sync and overbooking prevention.
  - API/Type: `src/types/database.ts:39-51` - current guest interface to migrate away from as booking source.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `reservations` exists and clearly separates operational reservation fields from provider-edge fields stored in `reservation_external_refs`.
  - [ ] `reservation_room_allocations` supports one-to-many room assignment while preserving a direct `primary_room_id` compatibility path for simple reads.
  - [ ] Reservation status vocabulary is explicitly defined and a provider-status mapping note exists for raw statuses such as `Currently hosting` and `Review guest`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Single-room reservation import
    Tool: Supabase MCP / Bash
    Steps: Insert a reservation based on confirmation code `HMX44ZA85B`, attach one `reservation_external_refs` row and one `reservation_room_allocations` row, then query the joined reservation dataset.
    Expected: The reservation has one canonical row, one external-ref row, and one room-allocation row with consistent property/listing linkage.
    Evidence: .sisyphus/evidence/task-4-reservations.json

  Scenario: Unmapped reservation detection
    Tool: Supabase MCP / Bash
    Steps: Insert or stage a reservation import row with an unknown listing title and no alias match, then run the unmapped detection SQL.
    Expected: The row is flagged as unmapped without creating a false `channel_listing_id` or fake room allocation.
    Evidence: .sisyphus/evidence/task-4-reservations-error.json
  ```

  **Commit**: YES | Message: `feat(db): add reservation core` | Files: [`supabase/migrations/*`, `.sisyphus/evidence/task-4-reservations.json`]

- [ ] 5. Re-anchor operational child tables to the reservation core without breaking the current app

  **What to do**: Extend `guest_requests` with additive linkage needed for the new core: add `reservation_id` and `property_id` where required for simpler operational joins and to prevent orphaned request records. Review `maintenance_issues` and keep it property/room anchored, adding reservation linkage only if a concrete workflow in the codebase needs it now. Preserve `guests` for compatibility during cutover and define the compatibility rule explicitly: `guests` remains readable until frontend migration is complete.
  **Must NOT do**: Do not fully repurpose `maintenance_issues` around reservations without evidence. Do not delete `guest_id` from `guest_requests` until all readers have migrated. Do not create polymorphic request ownership tables.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: the work is constrained once the reservation core exists.
  - Skills: [] - why needed: existing migration guidance is enough.
  - Omitted: [`backend-analysis`] - why not needed: core evidence is already established.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7, 8] | Blocked By: [4]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `supabase/migrations/20260409044835_create_portfolio_schema.sql:119-145` - current shape of `guest_requests` and `maintenance_issues`.
  - Pattern: `src/hooks/use-dashboard-data.ts:38-50` - current dashboard still reads `guest_requests` and `maintenance_issues` directly.
  - Pattern: `supabase/migrations/AGENTS.md:26-30` - schema/hook/type reconciliation is mandatory.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `guest_requests` can be associated to the new reservation core without breaking current rows.
  - [ ] `maintenance_issues` remains stable for existing dashboard reads and is not over-modeled.
  - [ ] Legacy compatibility requirements for `guests` and `guest_requests` are documented in the migration comments or companion docs.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Request-to-reservation linkage
    Tool: Supabase MCP / Bash
    Steps: Create a reservation, attach a guest request referencing that reservation and room, then query the request joined to reservation and property.
    Expected: The request resolves through both old and new linkage fields without FK failure.
    Evidence: .sisyphus/evidence/task-5-operational-links.json

  Scenario: Maintenance stability check
    Tool: Supabase MCP / Bash
    Steps: Query `maintenance_issues` after the migration and run an FK/orphan assertion against properties/rooms.
    Expected: Existing maintenance rows remain valid and no unexpected reservation dependency is introduced.
    Evidence: .sisyphus/evidence/task-5-operational-links-error.json
  ```

  **Commit**: YES | Message: `feat(db): link operational tables to reservations` | Files: [`supabase/migrations/*`, `.sisyphus/evidence/task-5-operational-links.json`]

- [ ] 6. Build the backfill and import-mapping path from legacy guests and CSV sources

  **What to do**: Define and implement the additive migration path that backfills `reservations` from current `guests` rows and supports CSV-based provider imports safely. Use `channel_listing_aliases` plus explicit staging/mapping SQL so reservations from `reservations_data.csv` are resolved through aliases or left flagged as unmapped. Treat earnings as raw provider metadata only in v1. Make the seed/import flow idempotent where possible and explicitly one-shot where not.
  **Must NOT do**: Do not auto-match reservation rows solely by listing title without alias support. Do not silently discard unmapped rows. Do not make earnings a normalized financial ledger in v1.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this task contains the highest silent-data-corruption risk.
  - Skills: [`backend-analysis`] - why needed: import linkage must reflect the real CSV irregularities.
  - Omitted: [`systematic-debugging`] - why not needed: the task is planned proactively, not in response to a failure.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7, 8] | Blocked By: [2, 3, 4]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `database_design/reservations_data.csv:1-10` - reservation feed lacks listing IDs and includes confirmation codes, titles, and earnings strings.
  - Pattern: `database_design/Ruby.csv:2-10` - internal-name inconsistency requires alias normalization.
  - Pattern: `supabase/migrations/20260409044906_seed_portfolio_data.sql:58-89` - current guest and request seed behavior to preserve during transitional seeding.
  - Pattern: `src/types/database.ts:39-51` - legacy `Guest` shape being phased out from booking source status.

  **Acceptance Criteria** (agent-executable only):
  - [ ] A documented backfill path exists from `guests` to `reservations` with explicit field mapping.
  - [ ] Reservation imports can resolve canonical listings only through exact alias or canonical listing identity; unmatched rows are queryable as unmapped.
  - [ ] Earnings remain raw metadata or raw payload content and do not create v1 accounting tables.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Legacy guest backfill
    Tool: Supabase MCP / Bash
    Steps: Run the backfill SQL from existing `guests` into `reservations`, then compare counts and spot-check one migrated record by guest name and ETA/ETD.
    Expected: Every eligible legacy guest row creates a reservation row with preserved property/room/status semantics.
    Evidence: .sisyphus/evidence/task-6-backfill.json

  Scenario: Alias miss handling
    Tool: Supabase MCP / Bash
    Steps: Import a reservation CSV row whose listing title has no matching alias and query the unmapped-import report.
    Expected: The row appears in the unmapped report, creates no incorrect listing linkage, and remains available for manual remediation.
    Evidence: .sisyphus/evidence/task-6-backfill-error.json
  ```

  **Commit**: YES | Message: `feat(db): add reservation backfill path` | Files: [`supabase/migrations/*`, `.sisyphus/evidence/task-6-backfill.json`]

- [ ] 7. Migrate frontend types and dashboard data loading from legacy guest bookings to reservations

  **What to do**: Update `src/types/database.ts` and `src/hooks/use-dashboard-data.ts` so the live dashboard consumes `reservations` as the booking source while preserving the same arrivals/departures/occupancy semantics. Decide explicitly whether to rename the frontend `Guest` interface now or keep a compatibility alias while the UI components remain guest-labeled. Ensure any new tables referenced by the hook are read safely under existing Supabase access assumptions.
  **Must NOT do**: Do not leave the frontend reading `guests` as the authoritative booking source once `reservations` exists. Do not change KPI semantics unintentionally. Do not break the five-table dashboard load flow without replacing it deliberately.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this task couples schema migration to a live dashboard contract.
  - Skills: [] - why needed: current repo patterns are simple and local.
  - Omitted: [`frontend-ui-ux`] - why not needed: the task is data contract migration, not visual redesign.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [8] | Blocked By: [4, 5, 6]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/hooks/use-dashboard-data.ts:12-25` - current dashboard data contract returned by the hook.
  - Pattern: `src/hooks/use-dashboard-data.ts:57-92` - current arrivals/departures/occupancy calculations that must preserve semantics.
  - API/Type: `src/types/database.ts:1-84` - current TypeScript contract needing migration.
  - Pattern: `supabase/migrations/AGENTS.md:26-30` - required post-schema reconciliation and build checks.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/types/database.ts` exposes the post-migration reservation-backed data contract without stale references that contradict the live schema.
  - [ ] `src/hooks/use-dashboard-data.ts` reads from `reservations` for booking data and preserves arrivals/departures/maintenance totals behavior.
  - [ ] `npm run typecheck` and `npm run build` both pass after the migration.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Type and build verification
    Tool: Bash
    Steps: Run `npm run typecheck` and then `npm run build` from the repo root after updating the hook and types.
    Expected: Both commands exit successfully with no schema-contract-related TypeScript failures.
    Evidence: .sisyphus/evidence/task-7-frontend-migration.txt

  Scenario: Dashboard semantic regression check
    Tool: Bash + Read
    Steps: Read the updated `src/hooks/use-dashboard-data.ts` and verify arrivals still derive from pending check-in reservation states, departures still derive from check-out-pending states, and occupancy still derives from room status.
    Expected: KPI semantics remain aligned with the previous dashboard behavior while the booking source has moved to `reservations`.
    Evidence: .sisyphus/evidence/task-7-frontend-migration-error.md
  ```

  **Commit**: YES | Message: `feat(app): migrate dashboard bookings to reservations` | Files: [`src/types/database.ts`, `src/hooks/use-dashboard-data.ts`, `.sisyphus/evidence/task-7-frontend-migration.txt`]

- [ ] 8. Finish seed data, indexing, RLS policy alignment, and schema documentation

  **What to do**: Add or update seed data for the new v1 tables, define all required supporting indexes and uniqueness constraints, review RLS so the dashboard can still read the intended tables under the current demo-access model, and update the schema docs to reflect the new runtime truth. Document the deferred PMS seam clearly: future `stays`, folios, room moves, and finance layers belong later and should extend—not replace—the v1 reservation core.
  **Must NOT do**: Do not leave new tables unindexed on their primary query paths. Do not leave RLS behavior implicit. Do not update docs in a way that revives the stale `src/data` narrative.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: this task combines documentation accuracy with verification-ready schema finishing work.
  - Skills: [] - why needed: repo-local documentation and migration rules are sufficient.
  - Omitted: [`backend-analysis`] - why not needed: the design decisions are already settled; this is the finish pass.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [Final verification] | Blocked By: [4, 5, 6, 7]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `supabase/migrations/20260409044835_create_portfolio_schema.sql:72-77`, `:91-96`, `:112-117`, `:129-134`, `:147-152` - current public demo-read policy pattern.
  - Pattern: `README.md` section "Database and Migrations" - current runtime truth and caveats to keep updated.
  - Pattern: `database_design/db-schema-airbnb.md:75-98` - prior schema note to supersede with the new balanced-core truth.
  - Pattern: `supabase/migrations/AGENTS.md:13-30` - migration/index/RLS/type reconciliation guardrails.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Every newly introduced v1 table has explicit index/uniqueness coverage for its dominant lookup path.
  - [ ] RLS policies for new readable tables are defined intentionally and do not accidentally hide data required by the current dashboard.
  - [ ] Updated docs describe the new balanced-core schema and the deferred PMS path without contradicting runtime behavior.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Schema integrity and index coverage
    Tool: Supabase MCP / Bash
    Steps: Use `supabase_list_tables(schemas:["public"], verbose:true)` and targeted `supabase_execute_sql` catalog queries to verify expected indexes, unique constraints, and RLS-enabled tables.
    Expected: All planned tables exist with the documented keys, indexes, and policies.
    Evidence: .sisyphus/evidence/task-8-schema-finish.json

  Scenario: Documentation runtime-truth check
    Tool: Bash + Read
    Steps: Read updated README/schema docs and confirm they describe Supabase-first runtime flow, the reservation core, and deferred PMS evolution without referring to `src/data` as live runtime truth.
    Expected: Docs align with the implemented schema and remove/override stale architecture assumptions.
    Evidence: .sisyphus/evidence/task-8-schema-finish-error.md
  ```

  **Commit**: YES | Message: `docs(db): finalize balanced core schema docs` | Files: [`supabase/migrations/*`, `README.md`, `database_design/db-schema-airbnb.md`, `.sisyphus/evidence/task-8-schema-finish.json`]

- [ ] 9. Complete the shared frontend data-access foundation for Track A and Track B

  **What to do**: Implement Sprint 1 Story-01 by introducing a frontend repository/data-access abstraction and TanStack Query foundation so the UI no longer depends on direct, hard-coded Supabase fetches. Define shared interfaces for properties, rooms, reservations, guest requests, and maintenance access. Provide a Track A repository implementation that talks to Supabase now and a Track B contract that the future custom backend must satisfy.
  **Must NOT do**: Do not keep the app coupled only to `supabase.from(...)` calls inside feature hooks. Do not make Track B parity implicit; document the exact repository methods and payload shapes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this is a cross-cutting architectural refactor needed to satisfy Sprint 1 and branch portability.
  - Skills: [] - why needed: the repo patterns are local and simple enough once the contract is fixed.
  - Omitted: [`frontend-ui-ux`] - why not needed: the work is data-access architecture, not visual redesign.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [11, 12] | Blocked By: [0, 1, 4, 7]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `plans/Scrum Backlog & Sprints.md:5-10` - Story-01 and Story-03 require abstraction plus data contracts.
  - Pattern: `plans/Scrum Backlog & Sprints.md:26-33` - Sprint 1 frontend tasks mention shared interface definitions.
  - Pattern: `src/hooks/use-dashboard-data.ts:1-55` - current direct Supabase coupling to replace with repository/query flow.
  - Pattern: `plans/Dual-Architecture PRD.md:15-41` - Track A vs Track B contract expectations.

  **Acceptance Criteria** (agent-executable only):
  - [ ] A shared data-access interface layer exists for the entities used in Sprint 1.
  - [ ] TanStack Query is wired as the frontend query foundation for Track A.
  - [ ] The Track B backend contract is expressible through the same repository interface without UI rewrites.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Shared repository contract verification
    Tool: Bash + Read
    Steps: Read the new API/repository files and verify they expose branch-neutral methods for reservations, properties, rooms, guest requests, and maintenance, plus a concrete Supabase implementation.
    Expected: The interface layer exists, and the Supabase-specific code is isolated behind it.
    Evidence: .sisyphus/evidence/task-9-repository-layer.md

  Scenario: Direct Supabase coupling regression check
    Tool: Grep
    Steps: Search `src/` for direct `supabase.from(` usage outside the repository/data layer after the refactor.
    Expected: Feature hooks/components no longer own direct Supabase table access for Sprint 1 entities.
    Evidence: .sisyphus/evidence/task-9-repository-layer-error.md
  ```

  **Commit**: YES | Message: `refactor(app): add branch-neutral data layer` | Files: [`src/api/*`, `src/hooks/*`, `src/lib/*`, `.sisyphus/evidence/task-9-repository-layer.md`]

- [ ] 10. Prepare the Track B sub-branch/worktree backend scaffold and schema mirror

  **What to do**: Create the Sprint 1 Track B foundation in an isolated branch/worktree: initialize the Node.js backend structure, choose the backend framework from the PRD default (Express.js unless existing repo constraints strongly favor NestJS), add Prisma (or Drizzle only if explicitly justified), and mirror the Track A balanced-core schema contract in ORM form. Document environment variables, migration commands, and how the Track B API must satisfy the shared frontend repository contract.
  **Must NOT do**: Do not let Track B invent a different schema vocabulary from Track A. Do not skip ORM schema parity. Do not require Azure-specific provisioning to validate code structure inside the repo.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this is the branch-fork architecture task that defines long-term parity and portability.
  - Skills: [`using-git-worktrees`] - why needed: branch/worktree isolation is part of the intended development model.
  - Omitted: [`backend-analysis`] - why not needed: the branch scaffold should follow the already-decided schema contract.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [11, 12] | Blocked By: [0, 1, 4]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `plans/Dual-Architecture PRD.md:24-41` - Track B architecture and technology expectations.
  - Pattern: `plans/Scrum Backlog & Sprints.md:31-33` - Sprint 1 Task 3 expects Azure PostgreSQL + Node repo + Prisma mirror.
  - Pattern: `.sisyphus/plans/airbnb-postgres-schema.md` sections for canonical v1 table inventory and schema tasks - Track B ORM must mirror the same contract.

  **Acceptance Criteria** (agent-executable only):
  - [ ] A Track B branch/worktree exists with backend bootstrap files and ORM schema files checked in.
  - [ ] The ORM schema mirrors Track A entity names and relationships for Sprint 1 entities.
  - [ ] Setup instructions document how Track B will point at Azure PostgreSQL later without changing the shared frontend contract.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Branch scaffold verification
    Tool: Bash + Read
    Steps: Verify the Track B worktree/branch exists, list its backend files, and read the ORM schema/model definitions.
    Expected: A real backend scaffold exists with mirrored schema models for properties, rooms, reservations, guest requests, and maintenance.
    Evidence: .sisyphus/evidence/task-10-track-b-scaffold.md

  Scenario: Schema parity regression check
    Tool: Bash + Read
    Steps: Compare the Track B ORM schema entities against the Track A migration contract and flag any naming or relationship drift.
    Expected: No unexplained entity drift exists between Track A and Track B Sprint 1 contracts.
    Evidence: .sisyphus/evidence/task-10-track-b-scaffold-error.md
  ```

  **Commit**: YES | Message: `feat(track-b): scaffold custom backend foundation` | Files: [`<track-b-worktree>/*`, `.sisyphus/evidence/task-10-track-b-scaffold.md`]

- [ ] 11. Complete Sprint 1 authentication UI and branch-aware auth adapter boundaries

  **What to do**: Implement Story-02 and Sprint 1 Task 4 by creating the shared authentication UI plus adapter boundaries for Track A and Track B. On Track A, wire the UI to Supabase Auth. On Track B, define the adapter interface and placeholder/provider wiring assumptions for Clerk/Auth0 so the UI does not need redesign later. Keep data-layer auth assumptions isolated from the balanced-core operations schema because auth tables are explicitly out of scope for this schema plan.
  **Must NOT do**: Do not blend application-role tables into the operations schema. Do not hard-code the UI directly to one auth provider without an adapter boundary.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this closes Sprint 1 and spans shared UI plus branch-specific auth wiring.
  - Skills: [] - why needed: local branch-aware adapter work can follow the product docs directly.
  - Omitted: [`frontend-ui-ux`] - why not needed: the main challenge is provider abstraction, not visual originality.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [12] | Blocked By: [0, 9, 10]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `plans/Scrum Backlog & Sprints.md:7-8`, `:33-34` - Story-02 and Sprint 1 auth task.
  - Pattern: `plans/Dual-Architecture PRD.md:20-21`, `:36-38` - Supabase Auth vs Clerk/Auth0 split.
  - Pattern: `plans/Dual-Architecture PRD.md:73-74` - future RBAC requirements that the UI must anticipate even though schema work defers RBAC tables.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Shared auth UI exists and is usable on Track A.
  - [ ] Track A uses Supabase Auth through an adapter/interface boundary.
  - [ ] Track B auth integration requirements are codified behind the same boundary without forcing schema additions in v1.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Track A auth wiring check
    Tool: Bash + Read
    Steps: Read the auth UI and adapter files, then verify the Track A path calls the Supabase auth client through the adapter boundary.
    Expected: Auth UI exists, and provider-specific logic is isolated.
    Evidence: .sisyphus/evidence/task-11-auth-ui.md

  Scenario: Track B auth boundary check
    Tool: Bash + Read
    Steps: Inspect the auth adapter interface and Track B stub/implementation notes to confirm the same UI can later bind to Clerk/Auth0 without schema changes.
    Expected: A branch-aware adapter exists, and no operations-schema RBAC tables were introduced prematurely.
    Evidence: .sisyphus/evidence/task-11-auth-ui-error.md
  ```

  **Commit**: YES | Message: `feat(auth): add branch-aware auth ui` | Files: [`src/components/*`, `src/lib/*`, `.sisyphus/evidence/task-11-auth-ui.md`]

- [ ] 12. Close Sprint 1 with branch matrix, docs, and implementation readiness verification

  **What to do**: Update the docs and branch matrix so Sprint 1 is explicitly complete for both tracks: current-schema gap audit, Track A balanced-core schema, shared repository layer, Track B scaffold, and auth UI. Document which artifacts live on main vs sub-branch/worktree, what remains deferred to Sprint 2, and how future branch inquiries should be answered. Ensure the docs are clear that Track A is executable now and Track B is scaffolded to the agreed Sprint 1 parity level.
  **Must NOT do**: Do not leave branch ownership ambiguous. Do not describe Sprint 2 ingestion work as already complete. Do not let stale docs conflict with the new dual-track plan.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: this is the Sprint 1 closure and branch-readiness documentation pass.
  - Skills: [] - why needed: repo-local documentation and branch summaries are sufficient.
  - Omitted: [`backend-analysis`] - why not needed: analysis is already embedded in earlier tasks.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [Final verification] | Blocked By: [5, 6, 7, 8, 9, 10, 11]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `plans/Dual-Architecture PRD.md:11-41` - dual-track deployment narrative.
  - Pattern: `plans/Scrum Backlog & Sprints.md:24-34` - Sprint 1 completion target.
  - Pattern: `README.md` and `.sisyphus/plans/airbnb-postgres-schema.md` - runtime truth and implementation plan must stay aligned.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Sprint 1 completion is documented against the backlog items and branch matrix.
  - [ ] Branch-specific artifact locations and deferred Sprint 2 items are explicit.
  - [ ] The repo docs can answer follow-up questions about main vs sub-branch without ambiguity.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Sprint 1 completion matrix check
    Tool: Bash + Read
    Steps: Read the updated docs and confirm Story-01 through Story-05 are each mapped to Track A/Track B/shared artifacts.
    Expected: Sprint 1 deliverables are explicitly covered, and deferred items are assigned to later sprints.
    Evidence: .sisyphus/evidence/task-12-sprint-closeout.md

  Scenario: Branch ambiguity regression check
    Tool: Bash + Read
    Steps: Inspect the branch matrix and verify that Track A/main and Track B/sub-branch ownership are clearly stated for schema, API, auth, and frontend layers.
    Expected: No section leaves it unclear which branch owns which implementation artifact.
    Evidence: .sisyphus/evidence/task-12-sprint-closeout-error.md
  ```

  **Commit**: YES | Message: `docs(plan): close sprint one branch matrix` | Files: [`README.md`, `plans/*.md`, `.sisyphus/evidence/task-12-sprint-closeout.md`]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Prefer one commit per task when task boundaries produce coherent migration/type/hook increments.
- Use additive migration commits first, then frontend compatibility commits, then seed/docs verification commits.
- Avoid mixing schema-foundation work with docs-only changes when a smaller atomic commit is possible.

## Success Criteria
- The schema supports 3 Airbnb accounts now without encoding Airbnb as the system center.
- Reservations become the operational core while keeping a safe transition path from the current `guests` model.
- Composite listings and unmapped reservation imports are handled explicitly, not implicitly.
- The existing dashboard can be kept working throughout migration and finishes on reconciled types/build output.
- The design leaves a deliberate seam for future `stays`/PMS expansion without requiring destructive table replacement.
