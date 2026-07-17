# Phase 71 - Web Career Persistence And Save Lifecycle Foundation

## Goal

Replace the browser-only in-memory career prototype with one durable career
lifecycle backed by SQLite WASM on OPFS.

At the end of this phase the manager must be able to:

1. create a career from the main menu;
2. see that career in `Continua carriera`;
3. load it after a browser refresh;
4. prepare the next match and persist the preparation;
5. stop at half-time, refresh, and resume the same match state;
6. complete the match, return to the dashboard, and retain the resulting
   career state after another refresh.

The existing Posta/Inbox foundation remains in place. This phase makes its
current structured attention facts durable; it does not expand Posta into new
market, contract, youth, finance, or staff categories.

## User-facing reason

The current web loop is playable but disposable. Losing the career on refresh
breaks trust and makes every later section a demo. Persistence is now the
smallest product improvement that turns the existing match loop into a real
career.

## Binding persistence decisions

- Browser career saves use **SQLite WASM on OPFS**.
- Career saves must not use `localStorage`, `sessionStorage`, or IndexedDB.
- The official `@sqlite.org/sqlite-wasm` distribution is the default package
  candidate. Install it only in the documented dependency step and only after
  `nvm use 24`.
- SQLite runs outside the React main thread. Use the project-required worker
  architecture and Comlink; do not use SQLite's deprecated Worker1/Promiser
  interface.
- The existing `CareerStorage` interface is the manager-career persistence
  seam because it owns durable `CareerState`. The web must not invent a second
  save repository.
- `JsonCareerStorage` remains the Node/CLI adapter. The browser receives a
  `SqliteCareerStorage` adapter satisfying the same interface.
- Storage owns real timestamps, schema migrations, SQL transactions, and
  serialization. Engine and domain remain unaware of SQLite, OPFS, workers,
  React, and browser APIs.
- The authoritative save contains structured state only. Never persist
  localized prose, rendered view models, React state, DOM state, or duplicated
  engine results.
- Language and currency preferences remain separate from career saves.
- A failed OPFS/SQLite initialization is a visible typed error. There is no
  silent in-memory, IndexedDB, or localStorage fallback.

Official implementation references:

- [SQLite WASM persistence](https://sqlite.org/wasm/doc/trunk/persistence.md)
- [SQLite WASM npm distribution](https://sqlite.org/wasm/doc/tip/npm.md)

## Architecture target

```text
React screens
  -> Zustand UI snapshot and commands
  -> WebCareerRuntime
       -> pure engine/content use cases
       -> CareerStorage interface
            -> JsonCareerStorage     (Node/CLI)
            -> SqliteCareerStorage   (browser worker + OPFS)
```

`WebCareerRuntime` is an application adapter, not a second engine. It may
coordinate load, command, and save operations, but it must delegate football
rules to existing domain/engine/content Modules.

The Zustand store may expose loading, selected save, current screen, and
presentation snapshots. It must not become the authoritative durable career.

## Canonical save scope

The saved career must be sufficient to restore the current manager decision,
not merely the last completed result. The current schema therefore needs to
round-trip:

- save metadata and schema version;
- selected club and generated world metadata;
- full ordered `GameState`;
- market funds and transfer history;
- youth academy state when present;
- season history when present;
- saved match preparation;
- one active staged match checkpoint when the fixture is between pre-match and
  full-time completion;
- structured attention/Inbox state only when it is durable game truth.

The schema audit must reconcile the existing `GameStorage` and `CareerStorage`
contracts without deleting an actively used CLI capability. The web product
path must use exactly one canonical career interface after that decision.

## SQLite schema rule

The SQLite implementation must be migration-owned and relational. It must not
be an unused SQLite wrapper around an unversioned opaque browser blob.

The schema step must define:

- normalized save metadata and career root rows;
- explicit child tables and order columns for order-sensitive world and career
  collections;
- foreign keys and transactions for atomic replacement;
- deterministic reconstruction of ordered ID arrays;
- a documented policy for bounded leaf value objects if JSON columns are used;
- schema migration tests from the first committed database version.

An opaque `CareerState` JSON payload may not be introduced as a shortcut unless
the architecture audit proves it satisfies the binding requirements and the
source-of-truth documentation is explicitly reconciled before implementation.

## No-dead-code contract

Every phase step must apply these deletion rules:

- A new production Module must gain a real caller in the same step.
- A new SQLite adapter must complete a real browser write/read proof in the
  step that introduces it.
- No in-memory fallback may remain after the corresponding durable path is
  wired.
- Demo adapters are removed when their last production caller moves to the
  runtime; do not keep compatibility wrappers.
- Test-only world builders live in test fixtures, not production files.
- Do not add tables, columns, commands, or migration branches for unimplemented
  future systems.
- Do not add generic repository frameworks, event stores, caches, or sync
  layers without a current caller and test.
- At phase close, production `Demo*`, `demo-*`, and `hasDemoCareer` symbols in
  the replaced lifecycle must either be deleted or explicitly justified as
  real browser-demo product behavior rather than persistence scaffolding.

## Ordered steps

1. [01-current-persistence-and-demo-runtime-audit.md](01-current-persistence-and-demo-runtime-audit.md)
2. [02-canonical-career-storage-interface-and-package-seams.md](02-canonical-career-storage-interface-and-package-seams.md)
3. [03-durable-active-match-checkpoint-contract.md](03-durable-active-match-checkpoint-contract.md)
4. [04-sqlite-wasm-opfs-worker-and-schema-bootstrap.md](04-sqlite-wasm-opfs-worker-and-schema-bootstrap.md)
5. [05-relational-world-state-round-trip.md](05-relational-world-state-round-trip.md)
6. [06-relational-career-systems-and-match-checkpoint-round-trip.md](06-relational-career-systems-and-match-checkpoint-round-trip.md)
7. [07-web-new-career-save-list-and-load-flow.md](07-web-new-career-save-list-and-load-flow.md)
8. [08-loaded-dashboard-continue-and-posta-rehydration.md](08-loaded-dashboard-continue-and-posta-rehydration.md)
9. [09-durable-match-preparation-save-flow.md](09-durable-match-preparation-save-flow.md)
10. [10-durable-matchday-checkpoints-and-full-time-commit.md](10-durable-matchday-checkpoints-and-full-time-commit.md)
11. [11-demo-runtime-removal-and-production-path-cleanup.md](11-demo-runtime-removal-and-production-path-cleanup.md)
12. [12-storage-errors-migrations-and-accessible-recovery.md](12-storage-errors-migrations-and-accessible-recovery.md)
13. [13-playwright-refresh-qa-architecture-and-phase-report.md](13-playwright-refresh-qa-architecture-and-phase-report.md)

## Phase-level checks

- Focused domain, engine, storage, UI, web, and CLI tests for each touched
  Module.
- SQLite browser integration tests against Chromium with OPFS enabled.
- Save round-trip equality for representative generated careers.
- Deterministic resume proof from half-time to the same full-time result.
- `pnpm --filter @game/storage run typecheck`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- Playwright desktop and narrow screenshots for create/list/load/error states.
- Playwright refresh proof at dashboard, preparation, half-time, and full time.
- `git diff --check`
- `graphify update .` after source changes.

Run `nvm use 24` before project commands and before every dependency change.

## What NOT to implement in this phase

- No IndexedDB, localStorage, or sessionStorage career saves.
- No silent in-memory persistence fallback.
- No cloud saves or cross-device synchronization.
- No save export/import UI.
- No autosave slot rotation policy beyond the single current-save lifecycle.
- No Inbox/Posta category expansion.
- No Squad, Market, Finance, Youth, Staff, Facilities, or Archive screens.
- No new economics, contracts, promotion/relegation, cups, extra time, or
  penalties.
- No runtime LLM or persisted rendered narrative.
- No engine/domain imports of SQLite, OPFS, workers, Comlink, storage, React, or
  browser APIs.
- No UI-only duplication of `CareerState` as a second source of truth.
- No broad visual redesign of the accepted app shell, tactical board, or
  matchday information architecture.

## Definition of Done

- `Nuova carriera` writes a validated durable career to SQLite on OPFS.
- `Continua carriera` lists and loads real save metadata.
- Reloading the browser preserves the available career.
- The loaded career, not a production demo singleton, powers dashboard,
  Continue, Posta, preparation, and matchday.
- Preparation survives refresh.
- An active half-time decision survives refresh and resumes deterministically.
- Full time commits fixture result and consequences once, atomically.
- Existing CLI JSON career persistence still passes its tests.
- Unsupported/corrupt/unwritable storage states are localized and recoverable
  without pretending a save succeeded.
- Replaced in-memory/demo production code is deleted.
- No known dead code, unused tables, pass-through wrappers, or duplicate save
  contracts remain.
- Playwright proves the lifecycle on desktop and narrow viewports.
- `pnpm check` passes.
- The report recommends exactly one next phase.

