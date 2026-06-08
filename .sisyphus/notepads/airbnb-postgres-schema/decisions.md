# Decisions

- Task 1 decision: keep `properties`, `rooms`, `guests`, `guest_requests`, and `maintenance_issues` intact through the first migration wave; add new v1 tables additively instead of renaming or dropping legacy runtime tables.
- Task 1 decision: classify `properties`, `rooms`, `maintenance_issues`, `reservations`, and `reservation_room_allocations` as core; classify `channels`, `external_accounts`, `channel_listings`, `channel_listing_aliases`, `listing_room_mappings`, and `reservation_external_refs` as provider edge; keep `guests` and `guest_requests` as transitional compatibility tables.
- Task 1 decision: use `reservations.status` as the authoritative normalized operational vocabulary with `pending`, `check_in_pending`, `checked_in`, `check_out_pending`, `checked_out`, `cancelled`, and `no_show`; store provider raw statuses only in provider-edge reference metadata.
- Task 1 decision: do not place a single durable `room_id` on `reservations` as the allocation source of truth; composite/multi-room support belongs in `reservation_room_allocations`.
Task 2: added `channels` + `external_accounts` only, with `account_key` normalized to lowercase and uniqueness scoped per channel.

Task 2: kept lifecycle/audit columns on the edge table (`status`, `archived_at`, sync timestamps, sync metadata) and left core tables untouched.

Task 3: `channel_listings` owns durable `(external_account_id, provider_listing_id)` identity plus provider URLs, extracted/sync timestamps, and raw metadata; listing titles and internal names remain descriptive fields only.

Task 3: `channel_listing_aliases` carries exact-match reconciliation strings with an account-scoped unique active alias index so one alias variant cannot point to multiple active listings within the same external account.

Task 3: `listing_room_mappings` uses a partial unique index on active `(channel_listing_id, room_id)` pairs so composite listings can span many rooms while duplicate active mapping rows are rejected.

- Task 4: `reservations` stays provider-neutral and only stores the normalized operational booking truth (`property_id`, local stay dates, guest snapshot, operational notes, normalized `status`); provider reservation IDs, confirmation codes, raw statuses, and payload metadata live exclusively in `reservation_external_refs`.
- Task 4: duplicate room allocation prevention is enforced with a hard unique constraint on `(reservation_id, room_id)` rather than a soft application check, so one reservation can span many rooms without allowing duplicate pairs.
- Task 4 correction decision: keep two durable proof reservations in the database (`HMX44ZA85B` mapped, `TASK4-UNMAPPED-LISTING` unmapped) so Task 4 evidence remains queryable and the duplicate-allocation check can run against a real persisted reservation.
