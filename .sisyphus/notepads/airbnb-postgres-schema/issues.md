# Issues

- Sprint 1 Story-01 is currently absent: no TanStack Query dependency in `package.json`, no `src/api/` directory, and direct `supabase.from(...)` calls still live in `src/hooks/use-dashboard-data.ts`.
- Sprint 1 Story-02 is currently absent: current schema policies are public-demo reads and the repo has no auth UI/provider implementation.
- Track B is planning-only at Task 0 time: no `prisma/` directory, no Node backend scaffold, and no branch-neutral repository seam.
- The current frontend still expects `guests.check_in_status` and existing table names directly, so downstream migration tasks must maintain compatibility until Task 7 moves arrivals/departures and related dashboard reads onto reservation-backed queries.
- `guest_requests` still hangs off `guest_id`, which means later migration work must define a safe additive bridge to reservations instead of destructively re-pointing requests in the same wave that introduces the reservation core.
Task 2: the source CSVs mix listing titles and internal names, so the seed layer should treat them as evidence for account grouping, not as durable keys.

Task 2: duplicate inserts are correctly blocked by the `(channel_id, account_key)` unique constraint, which is the key safety boundary for later channel listing work.

Task 3: the remote Supabase project had `channels` and `external_accounts` but was missing the older portfolio tables, so data-focused verification was blocked until `properties`/`rooms` and their seed data were applied to that environment.

Task 3: running `supabase_apply_migration` in parallel can collide on `schema_migrations.version`, so sequential apply is safer when bootstrapping prerequisite migrations during verification.

- Task 4: SQL verification with data-modifying CTEs can under-report newly inserted allocation counts when you re-scan the base table in the same statement snapshot; a follow-up query against the persisted row is safer for evidence.
- Task 4 correction issue: the first evidence pass removed the proof rows after verification, so `supabase_list_tables` and direct confirmation-code queries showed zero live reservation evidence even though the artifact files still claimed those rows existed.
