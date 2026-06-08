# Problems

- The current `guests` table collapses guest identity and reservation data into one row shape, which blocks clean PRD idempotency, reservation external references, and guest-history modeling.
- Because arrivals/departures are currently derived from guest status instead of reservation/date queries, downstream migration work must preserve dashboard semantics while changing the booking source of truth.
- Unresolved-but-bounded follow-up: Task 1 intentionally does not define the final post-cutover guest identity model; it only protects `guests` through the initial migration wave and establishes `reservations` as the new booking truth.
- Unresolved-but-bounded follow-up: `reservation_external_refs.channel_listing_id` must remain nullable in early import/backfill work so unmapped reservations can be captured safely without inventing listing matches from unstable titles.
Task 2: no unresolved schema issue remained after applying the migration; the only expected failure was the deliberate duplicate-key check, which verified the constraint.

Task 3: the source exports still show overlapping real-world naming patterns (`CC 402` vs `CC - 402`, `LL - C&M2` vs `LL - Milk 2 & Coffee 2`), so later reservation-import work must keep using exact alias resolution instead of assuming titles or internal names are globally stable.

- Task 4: the core schema still cannot prove that every row in `reservation_room_allocations` belongs to the same property as its parent reservation without either an extra property-scoped column or a trigger; the current migration keeps the model additive and leaves that stronger cross-table enforcement to later work if needed.
- Task 4 correction follow-up: because the proof rows now intentionally remain in the shared Supabase environment, later tasks should either reuse these rows carefully or delete/reseed them deliberately rather than assuming the reservation tables start empty.
