# Learnings

- Task 0 audit confirmed the repo's actual runtime contract is still five-table Supabase dashboard access: `properties`, `rooms`, `guests`, `guest_requests`, and `maintenance_issues` (`supabase/migrations/20260409044835_create_portfolio_schema.sql:62-152`; `src/hooks/use-dashboard-data.ts:38-50`).
- `properties`, `rooms`, and `maintenance_issues` are the cleanest reusable Sprint 1 assets; `guests` and `guest_requests` are transitional and under-modeled rather than fully reusable.
- Story-05 has real UI wiring today (`dashboard-page.tsx`, arrivals/departures panels), but the implementation is guest-status-based rather than reservation/date-driven.
- Task 1 locked the canonical balanced-core split: `reservations` and `reservation_room_allocations` become the new booking core, while `channels`, `external_accounts`, `channel_listings`, `channel_listing_aliases`, `listing_room_mappings`, and `reservation_external_refs` isolate provider-edge concerns.
- The v1 time model is now explicit: reservation stay bounds use local `date` fields, while sync/audit/source moments stay in `timestamptz`; legacy `guests.eta` / `guests.etd` survive only as compatibility fields.
- Current dashboard semantics can be preserved during migration by mapping arrivals/departures from legacy `guests.check_in_status` to normalized `reservations.status` values rather than copying provider raw statuses into the core reservation table.
Task 2: seeded provider-edge account layer with a single `airbnb` channel and stable lowercase `account_key` values (`main`, `ruby`, `manuka22`) so account identity stays scoped to channel instead of global display names.

Task 2: demo-read RLS on the new edge tables can stay simple and additive when the current need is public inspection of active provider accounts.

Task 3: durable listing identity can stay provider/account-scoped on `channel_listings` while exact import matching remains in `channel_listing_aliases`; the `CC 402` and `CC - 402` verification proved multiple exact aliases can resolve to one canonical listing without turning aliases into the durable key.

Task 3: composite inventory does not require fake `rooms` rows — the seeded `LL - Milk 2 & Coffee 2` example mapped one canonical listing to two existing `Latte Lounge` rooms through `listing_room_mappings`.

- Task 4: the reservation core can preserve dashboard-era convenience without breaking normalization by keeping a nullable `reservations.primary_room_id` for simple reads while enforcing real room assignment through `reservation_room_allocations`.
- Task 4: provider/account/listing integrity on `reservation_external_refs` is safer when the row carries the owning `external_account_id` and uses a nullable `channel_listing_id`, so unmapped imports can be stored without inventing fake room or listing matches.
- Task 4 correction: proof/evidence rows for schema verification must remain persisted if later reviewers are expected to query them directly; deleting them after verification makes the evidence artifacts false even when the migration itself is valid.
