# Web Career Persistence Architecture Audit

Date: 2026-07-13  
Phase: `71-web-career-persistence-and-save-lifecycle-foundation`  
Step: `01-current-persistence-and-demo-runtime-audit`

## Decision Summary

The browser career path will use the existing `CareerStorage` interface as its
single persistence seam. The interface will be moved to a browser-safe module,
extended with deterministic listing, and implemented by two adapters:

- `JsonCareerStorage` for Node/CLI;
- `SqliteCareerStorage` for the browser.

The browser adapter will run the official `@sqlite.org/sqlite-wasm` build in one
dedicated worker, expose only career operations through Comlink, and store one
relational SQLite database in OPFS through the official `opfs` VFS. Vite
development and preview servers must emit:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

There will be no IndexedDB, `localStorage`, `sessionStorage`, or in-memory
production fallback. Initialization failure is a typed, visible product state.

An active match will become an optional domain-owned checkpoint inside
`CareerState`. Engine adapters will create and resume it. Storage will persist
it without importing engine types. Zustand will hold only an asynchronous UI
snapshot and command state; it will never be durable authority.

## Current Ownership Map

### Durable state and storage

| Module | Current ownership | Finding | Adopted action |
|---|---|---|---|
| `packages/domain/src/state/game-state.ts` | Ordered clubs, players, player states, fixtures, calendar and deterministic metadata | Correct world authority | Persist relationally and reconstruct ordered arrays from explicit order columns |
| `packages/domain/src/state/career-state.ts` | Manager career wrapper: selected club, world metadata, market, transfer history, youth, preparation and season history | Correct manager-career authority, but lacks active match | Add one optional active-match checkpoint in Step 03 |
| `packages/storage/src/game-storage.interface.ts` | Raw `GameState` storage seam | Active low-level/legacy CLI capability; not the manager product save | Keep; do not expose it to the web career lifecycle and do not create a third interface |
| `packages/storage/src/career-storage.ts` | `CareerStorage`, envelope migration and Node filesystem adapter in one file | Browser import would pull `node:fs/promises` and `node:path` into the interface module | Split interface, envelope/migration and JSON adapter in Step 02 |
| `packages/storage/src/json-game-storage.ts` | Node JSON adapter for raw `GameState` | Independent active capability | Leave unchanged |
| `packages/storage/src/save-metadata.ts` | Real-clock metadata and save schema version | Correct storage-owned concern | Reuse for JSON and SQLite |

`CareerStorage` is the canonical seam because deleting it would force every
manager application caller to understand `CareerState`, metadata timestamps,
schema versions and adapter-specific failure modes. It therefore has useful
depth. `GameStorage` is not replaced: it stores a different aggregate and has
active tests/callers. The web runtime must not combine both interfaces.

### Engine and active match

| Module | Current ownership | Finding | Adopted action |
|---|---|---|---|
| `packages/engine/src/match-engine/staged-match-progression.ts` | Serializable `StagedMatchState`, deterministic RNG replay, phase progression and snapshots | Correct simulation implementation, but the type is engine-owned and cannot be imported by storage/domain | Add a domain checkpoint and pure engine conversion/resume adapters |
| `packages/domain/src/match/half-time-tactical-decision.ts` | Structured second-half lineup, bench and substitutions | Correct durable manager decision facts | Reuse inside the checkpoint |
| `packages/engine/src/career/progress-fixture.ts` | Fixture progression and durable consequences | Correct football use case | Use only when committing full time |
| `apps/web/src/features/matchday/matchday-demo.ts` | In-memory career, recovery, staged state, preparation validation, matchday commands and generated world | Four responsibilities and 1,781 lines; current production source of truth | Replace with `WebCareerRuntime`, pure presenters and test fixtures; delete after last caller moves |

The checkpoint will not persist a mutable RNG object. It will persist the seed,
fixture ID, initial serializable match inputs, completed minute, accumulated
events/stats, lineup/bench decisions and substitutions. The engine will replay
the deterministic stream to the stored minute before continuing.

### Web lifecycle

| Surface | Current source of truth | Finding | Target owner |
|---|---|---|---|
| Main menu | Zustand `hasDemoCareer` | Disappears on refresh and is not a save list | `CareerStorage.listCareers()` through `WebCareerRuntime` |
| Dashboard | `build-demo-career-dashboard.ts` and demo matchday state | Recreates product facts from singleton demo state | Loaded `CareerState` through existing UI presenters |
| Continue/Posta | `continue-demo-career.ts` | Runs against reconstructed demo input | Canonical engine Continue use case, then atomic save, then read-model refresh |
| Match preparation | `match-preparation-demo.ts` plus Zustand draft | Production player facts and selections are hardcoded | Draft may live in Zustand; accepted preparation is committed to `CareerState` |
| Matchday | `matchday-demo.ts` in memory | Refresh loses phase and substitutions | Optional durable checkpoint in `CareerState` |
| Preferences | browser preference code | Language/currency are user preferences, not career truth | Remain separate from SQLite career rows |

The web runtime interface should remain small:

```text
initialize -> list summaries
createCareer(seed, name) -> save then publish loaded career
loadCareer(saveId) -> validate then publish loaded career
continueCareer() -> engine command, save, then publish
savePreparation(command) -> domain/engine command, save, then publish
startMatch()/applyHalfTimeDecision()/completeMatch() -> checkpoint transitions
```

React and Zustand never execute SQL and never mutate a durable `CareerState`
without going through this runtime.

## Relational Schema Plan

All tables use SQLite foreign keys with `PRAGMA foreign_keys = ON`. Save-owned
tables include `save_id` in their primary key and use `ON DELETE CASCADE`.
Order-sensitive collections use a non-negative `order_index` or their existing
positive sequence number. A save replacement runs in one `BEGIN IMMEDIATE`
transaction and never deletes the previous snapshot until all replacement rows
have been validated and inserted successfully.

### Schema and save root

| Table | Key and references | Columns / purpose |
|---|---|---|
| `schema_migrations` | PK `version` | `name`, `applied_at_iso`; database schema ledger, not career data |
| `career_saves` | PK `save_id` | `name`, `created_at_iso`, `updated_at_iso`, `save_schema_version`, `career_schema_version`, `selected_club_id`, optional world seed/version/source |
| `game_roots` | PK/FK `save_id -> career_saves` | game seed, RNG algorithm version, game save schema version, current date, current season ID |

### World state

| Table | Key and references | Columns / purpose |
|---|---|---|
| `clubs` | PK `(save_id, club_id)`, FK save | `order_index UNIQUE per save`, name, short name, category, reputation |
| `players` | PK `(save_id, player_id)`, FK save | `order_index UNIQUE per save`, first name, last name, birth date, optional primary role/archetype |
| `player_abilities` | PK/FK `(save_id, player_id) -> players` | Explicit current and potential columns for the 25 stable ability keys; no opaque player blob |
| `player_positions` | PK `(save_id, player_id, order_index)`, FK player | position key |
| `player_roles` | PK `(save_id, player_id, role_kind, order_index)`, FK player | role key and familiarity for natural/adapted/weak role collections |
| `player_states` | PK/FK `(save_id, player_id) -> players` | fitness, form, morale |
| `club_roster` | PK `(save_id, club_id, order_index)`, FKs club/player | ordered ownership, `UNIQUE(save_id, player_id)` |
| `fixtures` | PK `(save_id, fixture_id)`, FKs save/home club/away club | `order_index UNIQUE per save`, competition ID, season ID, round, date |
| `fixture_results` | PK/FK `(save_id, fixture_id) -> fixtures` | home goals, away goals, played flag constrained to true |
| `match_reports` | PK/FK `(save_id, fixture_id) -> fixture_results` | event schema version, final minute, score and home/away aggregate stats |
| `match_events` | PK `(save_id, fixture_id, order_index)`, FK report | event type, minute, side, shot outcome/context and nullable actor IDs/score columns |

The fixed 25-ability shape is represented by columns because it is bounded,
validated and frequently reconstructed as one value. Match events are rows so
event order and actor references remain inspectable. No `CareerState` or
`GameState` JSON column is permitted.

### Career systems

| Table | Key and references | Columns / purpose |
|---|---|---|
| `market_budgets` | PK `(save_id, club_id)`, FK club | `order_index UNIQUE per save`, transfer budget minor units |
| `transfer_history` | PK `(save_id, sequence_number)`, FKs clubs/player | occurred date, buyer, seller, player, fee minor units |
| `youth_club_rosters` | PK `(save_id, club_id, order_index)`, FKs club/player | active academy player order |
| `youth_player_lifecycle` | PK `(save_id, player_id)`, FKs club/player | status, entry season/date, optional status-change date |
| `season_history` | PK `(save_id, sequence_number)`, FKs selected/champion clubs | season, competition, aggregate fixture count/goals |
| `season_table_rows` | PK `(save_id, history_sequence, order_index)`, FK history/club | position and complete table row facts |
| `match_preparations` | PK/FK `save_id -> career_saves`, FKs selected club/fixture | updated date and tactic fields; row may exist with partial user choices |
| `match_preparation_lineup_slots` | PK `(save_id, order_index)`, FK preparation/player | slot key, player ID, role key |

### Active match checkpoint

The exact domain contract is introduced in Step 03, but its relational shape is
fixed here so storage does not dictate football behavior:

| Table | Key and references | Columns / purpose |
|---|---|---|
| `active_matches` | PK/FK `save_id -> career_saves`, FK fixture | phase constrained to regulation phases, minute, selected side, seed, score, aggregate stats, marker flags, engine config scalar values |
| `active_match_conversion_bands` | PK `(save_id, order_index)`, FK active match | ordered conversion-band tuning |
| `active_match_teams` | PK `(save_id, side)`, FK active match/club | strength and tactical-distribution scalar facts |
| `active_match_lineup_slots` | PK `(save_id, side, order_index)`, FK active team/player | slot ID, player ID, role key |
| `active_match_bench_slots` | PK `(save_id, order_index)`, FK active match/player | selected-club bench slot ID and nullable player assignment |
| `active_match_events` | PK `(save_id, order_index)`, FK active match | same structured event columns as `match_events` |
| `active_match_substitutions` | PK `(save_id, order_index)`, FK active match/player | side, minute, outgoing/incoming player, slot and reason key |
| `active_match_half_time_plan` | PK/FK `save_id -> active_matches` | base formation, current shape, max substitutions, required XI size |
| `active_match_plan_lineup` | PK `(save_id, order_index)`, FK plan/player | slot, nullable player, role and optional position |
| `active_match_plan_bench` | PK `(save_id, order_index)`, FK plan/player | slot and nullable player |

`active_matches` exists only while a fixture is between pre-match start and
full-time commit. Extra time and penalties are not valid row values in this
phase.

## Worker, VFS And Connection Decision

The adopted VFS is SQLite's official `opfs` VFS, initialized inside a dedicated
module worker. Official SQLite documentation states that OPFS is worker-only
and that this VFS requires `SharedArrayBuffer`, COOP and COEP. It also supports
the concurrency behavior needed to fail with `SQLITE_BUSY` rather than silently
opening independent stores. `opfs-sahpool` is not selected because it locks a
preallocated handle pool to one active browsing context and would require a
separate pause/coordination policy not needed by the current product.

The worker will:

1. initialize `@sqlite.org/sqlite-wasm` directly;
2. verify `crossOriginIsolated`, OPFS and the `opfs` VFS;
3. open one fixed database path, `/the-long-season/careers.sqlite3`;
4. enable foreign keys and apply ordered migrations;
5. create one `SqliteCareerStorage` instance;
6. expose only `CareerStorage` operations and `close()` through Comlink.

The main-thread factory owns one worker/client promise per application runtime.
React receives a `CareerStorage` proxy and has no SQLite API access. The worker
must be closed by the app runtime in tests; production keeps the single
connection for the app lifetime. A second tab may receive a typed busy/init
error and a retry action; it must never receive a different storage backend.

## Commit Points And Atomicity

| Manager transition | Durable write | Publish rule |
|---|---|---|
| App startup | None | List metadata after migrations succeed |
| New career | Complete validated `CareerState`, no checkpoint | Open dashboard only after transaction commits |
| Load career | None | Publish only after reconstruction and `createCareerState` validation |
| Continue to ordinary date/attention | Updated career snapshot | Refresh dashboard/Posta only after commit |
| Save preparation | Updated partial/complete `matchPreparation` | Mark saved and allow pre-match only after commit |
| Start match / reach pre-match | Career with active pre-match checkpoint | Open match centre only after commit |
| Reach half-time | Career with half-time checkpoint and accumulated facts | Render half time only after commit |
| Apply half-time decision | Same checkpoint replaced with validated plan/substitutions | Show accepted decision only after commit |
| Reach full time | One transaction applies fixture report/consequences, removes checkpoint and clears consumed preparation | Publish final review only after commit |
| Return dashboard | No second football mutation | Load/present already committed full-time career; repeated action is idempotent |

Failed transactions leave the previous valid snapshot unchanged. The runtime
serializes commands for the loaded save, rejects concurrent duplicate commands,
and never reports success before the worker confirms commit.

## Replacement And Deletion Ledger

| Current file/symbol | Replacement | Delete point |
|---|---|---|
| `CareerStorage` declarations inside `career-storage.ts` | `career-storage.interface.ts` | Step 02; old combined implementation removed, no compatibility wrapper |
| JSON implementation inside `career-storage.ts` | `json-career-storage.ts` | Step 02 |
| `hasDemoCareer` in Zustand/app-entry | asynchronous save summaries and selected save ID | Step 07 |
| `build-demo-career-dashboard.ts` | `build-career-dashboard.ts` from loaded state | Step 08 |
| `continue-demo-career.ts` | `WebCareerRuntime.continueCareer()` plus existing engine use case | Step 08 |
| production hardcoded selection facts in `match-preparation-demo.ts` | loaded roster adapter and runtime preparation command | Step 09 |
| production staged state and generated world in `matchday-demo.ts` | domain checkpoint plus runtime match commands | Step 10 |
| `WEB_DEMO_*` match constants and generated names | existing content config/world builder or explicit test fixture | Steps 07-11 |
| `Demo*` lifecycle types consumed by screens | neutral runtime/read-model types | Steps 08-11 |
| tests that exist only for deleted demo adapters | contract/runtime tests and named test fixtures | Step 11 |

The accepted tactical-board modules, presenters, screens and visual identity are
not deleted. They receive loaded data through new adapters. Test-only generated
careers move under `apps/web/src/test-fixtures/`; production cannot import that
directory.

## Error Contract

`StorageErrorCode` must be expanded only for current browser failure modes:

- `storage_unavailable` for missing cross-origin isolation, OPFS or VFS;
- `storage_initialization_failed` for worker/database bootstrap failure;
- existing `save_not_found`, `save_unreadable`, `save_unwritable`, and
  `unsupported_schema_version`;
- `storage_busy` when SQLite reports a locked/busy database.

Quota/I/O failures map to `save_unwritable` with an internal cause. Raw SQL and
browser exception text never reaches localized UI copy. Corrupt or future saves
remain intact and are never reset automatically.

## Step 02 Consequence

Step 02 remains valid with these binding details:

- `CareerStorage` gains `listCareers(): Promise<readonly SaveMetadata[]>`;
- `career-storage.interface.ts` imports only domain types and type-only
  metadata;
- `career-save-envelope.ts` owns versioned envelope types and migration;
- `json-career-storage.ts` is the only career module importing Node built-ins;
- `career-storage.ts` must not remain as a compatibility re-export after active
  imports move, because the phase forbids unused wrappers;
- JSON and future SQLite adapters share the same contract-test function.

## Audit Conclusion

There is no unresolved product or architecture decision blocking Step 02. The
phase can proceed without changing the package DAG: web may depend on storage,
storage depends on domain/shared, and engine remains independent of storage and
browser APIs. The highest deletion value is replacing the 3,072 lines currently
concentrated in the four demo lifecycle files and `App`/Zustand glue with one
runtime seam backed by durable career truth.
