# Web Career Persistence And Save Lifecycle Report

Date: 2026-07-13  
Phase: `71-web-career-persistence-and-save-lifecycle-foundation`

## Outcome

Phase 71 replaces the disposable browser demo with one durable career lifecycle.
New Career creates a validated save, Continue lists and loads real metadata, and
dashboard, preparation, matchday checkpoints, full time, and dashboard return
all operate on the selected loaded `CareerState`.

The manager can close or refresh the page without losing the current career
decision. The product still starts at app entry after refresh; loading a save is
an explicit manager action rather than hidden singleton behavior.

## Persistence Design

- `CareerStorage` is the single manager-career seam.
- `JsonCareerStorage` remains the Node/CLI implementation.
- `SqliteCareerStorage` is the browser implementation.
- One dedicated Comlink worker owns the official SQLite WASM OPFS connection,
  migrations, and SQL transactions.
- Relational schema version 4 stores ordered world state, career systems,
  structured reports, complete match preparation, and the optional active match
  checkpoint.
- Package-owned mappers reconstruct and validate domain state. The worker does
  not own football rules and React does not own persistence.
- Save replacement and full-time commit are transactional. The runtime reloads
  the committed state before publishing it to Zustand.

No opaque `CareerState` browser blob, IndexedDB database, localStorage key,
sessionStorage key, or in-memory production fallback exists.

## Matchday Durability

Pre-match, half-time, and accepted tactical decisions are meaningful durable
checkpoints. The checkpoint stores normalized structured state and deterministic
simulation position, not an RNG object or rendered prose.

At full time the engine applies the staged report and player consequences once,
storage clears the checkpoint in the same transaction, and repeated completion
is rejected. After refresh the matchday adapter reconstructs the review from the
persisted played fixture and derives player ratings from structured events; it
does not simulate or commit again.

## Errors And Migrations

Immutable SQLite migrations reject invalid and future versions. Stable storage
error codes distinguish unavailable initialization, busy storage, missing or
unreadable saves, unsupported schema versions, and failed writes.

Startup failure stays at app entry. A current-career write failure preserves the
loaded screen and unsaved manager draft. Retry creates a fresh worker/runtime
connection but never resets, deletes, or silently moves the career to another
backend.

## Dependency And Code Quality Review

The two new web dependencies have current production callers:

- `@sqlite.org/sqlite-wasm` supplies the official browser SQLite runtime and
  OPFS VFS;
- `comlink` exposes the narrow worker port without leaking SQL into React.

The package direction remains `web -> storage -> domain/shared`; engine and
domain do not import storage or browser APIs. The former production dashboard,
Continue, preparation, and matchday demo modules were deleted with their last
callers. Deterministic builders remain only under test fixtures. No compatibility
wrapper or alternate save repository remains.

## Accessibility, Performance And Save Size

- Async loading blocks duplicate commands and exposes status through semantic
  UI state.
- Storage errors use a focused `role=alert` region and one retry command.
- Desktop and narrow lifecycle screens have no document-level horizontal
  overflow in Chromium QA.
- SQLite work and OPFS I/O run outside the React main thread.
- One database and one application-lifetime worker avoid per-screen connection
  churn.
- Browser QA asserts that the resulting OPFS database is non-empty. No duplicate
  browser save payload is stored in another web storage system.

## Residual Risks

- OPFS saves are local to the browser profile. Cloud sync, cross-device play,
  import/export, and autosave rotation are intentionally absent.
- Multiple-tab contention is represented as a typed busy/unavailable state; a
  richer tab-coordination experience is future work.
- The current post-refresh full-time screen rebuilds the match story and final
  ratings from durable facts. It does not preserve a separate rendered snapshot
  of transient before/after consequence rows, by design; authoritative player
  state is persisted and no consequence is applied twice.
- Corruption, quota, busy, and future-schema states have deterministic automated
  coverage, but only the unavailable-worker branch is included in screenshot QA.

None of these risks requires a second persistence implementation or blocks the
current single-browser MVP.

## Verification

The final gate covers package typechecks, complete web tests and build, domain,
engine, UI and i18n typechecks, dependency rules, the workspace `pnpm check`,
desktop/narrow Chromium refresh QA, source/dead-code scans, `git diff --check`,
and graph refresh.

Visual evidence and manual inspection guidance are documented in
`docs/audits/WEB_CAREER_PERSISTENCE_VISUAL_QA.md`.

## Next Phase

Recommend exactly one next phase:

`Phase 72 - Inbox/Posta Decision Center And Career Attention Workflow`

Persistence now gives Posta durable career truth. The next useful product slice
is to turn that existing attention rail into the manager's real decision center,
with structured messages that route directly to current actions. Squad, market,
finance, youth, staff, and archive expansion should not start before that
workflow is specified.
