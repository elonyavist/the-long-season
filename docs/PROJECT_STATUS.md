# Project Status

This file is the project handoff snapshot for LLMs and junior developers. Update it after every step attempt, completed step, rework decision, and adopted solution change.

## Current State

- Phase: Phase 0 foundation complete; ready for Phase 1 match-engine steps.
- Active implementation step: `docs/steps/01-match-engine/02-match-context.md`.
- Code status: monorepo skeleton, dependency-free domain core contracts, deterministic shared RNG/date utilities, JSON save storage boundary, executable enforcement, `pnpm cli doctor`, and pure team-strength derivation exist; no match simulation code exists yet.
- Runtime: Node `v24.16.0` from `.nvmrc`.
- First command milestone: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001`.
- Source of truth: `requirements.md`.

## Current Active Step

- Step: `docs/steps/01-match-engine/02-match-context.md`
- Status: Not started
- Last verification: `pnpm --filter @game/engine run typecheck`, `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`, `pnpm check`, engine forbidden import/API scan, and engine JSDoc scan passed for team strength.
- Next action: Implement serializable match context only.

## How To Read The Project

1. Read `requirements.md` for product and architecture intent.
2. Read `docs/PROJECT_RULES.md` for non-negotiable rules.
3. Read this file for current state and adopted solutions.
4. Read `docs/steps/README.md` for the iterative workflow.
5. Read only the active step file before implementing.

## Step Ledger

| Step | Status | Outcome | Adopted solution | Verification |
|---|---|---|---|---|
| `docs/steps/00-foundation/00-monorepo-skeleton.md` | Done | Minimal pnpm workspace and empty package entrypoints were created. | Root pnpm workspace with `apps/cli`, `packages/domain`, `packages/shared`, `packages/engine`, `packages/content`, and `packages/storage`; placeholder scripts stay non-gameplay until enforcement. | `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `tsc --showConfig` alias check |
| `docs/steps/00-foundation/01-domain-core-types.md` | Done | Dependency-free core domain contracts, value objects, entities, state, and tests were created. | Branded IDs and value objects live in `domain`; `Player` stores the full 25-attribute shape plus potential; dynamic state is separated in `PlayerDynamicState`; `GameState` uses lookup records plus explicit ordered ID arrays. | `pnpm --filter @game/domain run typecheck`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; domain import scan |
| `docs/steps/00-foundation/02-shared-rng-and-date.md` | Done | Deterministic shared RNG streams and pure Gregorian epoch-day utilities were created. | `shared` exposes `deriveRng(seed, streamName, ...keyParts)` over `sfc32` seeded by stable `cyrb128` hash words; date conversion uses pure Gregorian arithmetic with no JavaScript `Date`; all new shared files and functions are documented with TSDoc/JSDoc. | `pnpm --filter @game/shared run typecheck`; `node --test packages/shared/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; forbidden API scan; JSDoc scan |
| `docs/steps/00-foundation/03-storage-json.md` | Done | JSON-backed save storage boundary was created for full `GameState` snapshots. | `storage` exposes `GameStorage`, `JsonGameStorage`, save metadata, schema version `1`, identity migration for v1 saves, and typed storage errors; metadata listing is sorted deterministically by save ID. | `pnpm --filter @game/storage run typecheck`; `node --test packages/storage/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; storage forbidden dependency scan; JSDoc scan |
| `docs/steps/00-foundation/04-enforcement.md` | Done | Executable enforcement and the first real CLI doctor command were created. | Dependency Cruiser enforces package boundaries, ESLint bans forbidden runtime APIs inside `engine`, Vitest runs package tests, `pnpm check` is the single gate, and `pnpm cli doctor` exits `0`. | `pnpm lint`; `pnpm depcruise`; `pnpm test`; `pnpm typecheck`; `pnpm check`; `pnpm cli doctor`; negative dependency fixture; negative engine runtime API fixture |
| `docs/steps/01-match-engine/01-team-strength.md` | Done | Pure role-weight-based `TeamStrength` derivation was created. | `engine` derives department and overall strength from explicit ordered lineup slots, caller-supplied role weight profiles, player abilities, and optional caller-supplied dynamic-state multiplier curves; missing players/roles fail with typed `TeamStrengthError`. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm check`; engine forbidden import/API scan; JSDoc scan |
| `docs/steps/01-match-engine/02-match-context.md` | Not started | None yet | Planned serializable match input contract | Pending |
| `docs/steps/01-match-engine/03-step-match.md` | Not started | None yet | Planned one-minute deterministic match step | Pending |
| `docs/steps/01-match-engine/04-simulate-match.md` | Not started | None yet | Planned batch driver over `stepMatch` | Pending |
| `docs/steps/01-match-engine/05-match-report.md` | Not started | None yet | Planned structured language-agnostic match report | Pending |
| `docs/steps/02-season-simulation/01-calendar-generation.md` | Not started | None yet | Planned deterministic double round-robin calendar | Pending |
| `docs/steps/02-season-simulation/02-fixtures-and-results.md` | Not started | None yet | Planned fixture result application as source of truth | Pending |
| `docs/steps/02-season-simulation/03-league-table.md` | Not started | None yet | Planned derived deterministic league table | Pending |
| `docs/steps/02-season-simulation/04-simulate-season-cli.md` | Not started | None yet | Planned first gameplay milestone CLI command | Pending |
| `docs/steps/02-season-simulation/05-season-balance-report.md` | Not started | None yet | Planned aggregate deterministic calibration report | Pending |

Status values:

- `Planned`: identified as future work but not yet the active step.
- `Not started`: documented but no implementation work done.
- `In progress`: currently being implemented.
- `Done`: implementation merged locally and Definition of Done satisfied.
- `Rework`: implemented but needs correction before the next step.
- `Skipped`: intentionally not done, with reason recorded in Outcome.

## Adopted Solutions

- Documentation is split into executable implementation steps under `docs/steps/`.
- Work proceeds one active step at a time.
- The process is incremental and iterative: implement, test, learn, update next step, advance.
- The mandatory execution loop is: read status, choose active step, implement, test, fix or adjust next step, update status briefly, advance.
- Future scope is kept in `docs/steps/99-future/README.md` as a queue, not a ban list.
- `docs/PROJECT_RULES.md` is stable across phases; moving forward should add step docs, not rewrite rules.
- The first implementation target remains a CLI-first deterministic monorepo, not UI or persistence.
- The Step Ledger tracks individual step files, not only broad phase groups.
- Every step prompt tells the implementer to read and update `docs/PROJECT_STATUS.md`.
- `pnpm` is exposed through Corepack under Node `v24.16.0`; this shell required `source ~/.nvm/nvm.sh && nvm use` before running pnpm commands.
- Domain IDs use one namespace convention for every entity type: `type:value` (`player:000001`, `club:perugia`, `competition:ita-3`, `fixture:000001`, `season:2026`, `save:demo-001`).
- Domain ID validation is intentionally not exposed as a partial public helper; callers must use specific constructors like `playerId`, `clubId`, and `fixtureId`.
- TypeScript source files written so far carry TSDoc/JSDoc comments for public contracts, package entrypoints, and test fixture intent.
- Shared deterministic RNG uses local streams only: callers derive streams from `seed + streamName + stable key parts`; no global RNG state exists.
- Shared date utilities convert `YYYY-MM-DD` to epoch-day and back with pure Gregorian arithmetic; JavaScript `Date` and timezone APIs are not used.
- JSON storage persists full `GameState` snapshots behind `GameStorage`; storage metadata uses real ISO timestamps, while game time remains `GameDate` in domain/engine.
- Enforcement is executable: `pnpm check` runs ESLint, Dependency Cruiser, Vitest, and workspace typecheck.
- ESLint currently focuses on engine determinism bans; Dependency Cruiser currently enforces source-import package boundaries.
- Existing package tests were migrated from Node native `node:test` registration to Vitest `test` registration while keeping Node `assert/strict`.
- `pnpm cli doctor` is the first real CLI command and prints a stable success line without gameplay side effects.
- Team strength calculation is pure and data-driven: role weights and dynamic-state multiplier curves are passed by the caller, not hardcoded in engine.

## Open Decisions And Follow-Up

- `pnpm-lock.yaml` was created by the required `pnpm install` verification even though it was not listed in the step `Expected files`; keep it as the workspace lockfile.
- `pnpm install` resolved TypeScript `^5.8.3` to `5.9.3`; keep this acceptable unless a later step needs a pinned compiler version.
- `packages/domain/tsconfig.json` enables `allowImportingTsExtensions` so Node 24 can execute TypeScript tests directly.
- `packages/shared/tsconfig.json` also enables `allowImportingTsExtensions`, matching `domain`, because the workspace currently runs `.ts` files directly under Node 24.
- `packages/storage/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/engine/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `apps/cli/tsconfig.json` enables `allowImportingTsExtensions` because the CLI imports local `.ts` command modules directly under Node 24.
- `tsconfig.base.json` sets `noEmit: true`, because current packages are typechecked and executed directly from `.ts` files; this satisfies TypeScript's `allowImportingTsExtensions` requirement without producing unresolved emitted JavaScript imports.
- After the first match simulation steps, record the first statistical behavior that tests expose.

### 2026-06-15 — `docs/steps/01-match-engine/01-team-strength.md`

- Status: Done
- Outcome: Created pure deterministic team-strength calculation in `engine` with focused tests.
- Adopted solution: `deriveTeamStrength` walks explicit ordered lineup slots, reads caller-supplied `RoleWeightProfile` data, averages slot scores into attack/midfield/defense/goalkeeper departments, computes overall from lineup slots, and applies optional dynamic-state curves only when caller data supplies them.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm check`; engine forbidden import/API scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/02-match-context.md`; do not add match events, shots, goals, or simulation driver before their active steps.

### 2026-06-15 — `docs/steps/00-foundation/04-enforcement.md`

- Status: Done
- Outcome: Replaced placeholder scripts with executable enforcement and added the first real `pnpm cli doctor` command.
- Adopted solution: Dependency Cruiser enforces source import boundaries from `docs/PROJECT_RULES.md`; ESLint flat config bans `Math.random`, `Date.now`, `new Date`, `crypto.randomUUID`, and `performance.now` inside `packages/engine`; Vitest runs `packages/**/*.test.ts`; `pnpm check` runs lint, depcruise, test, and typecheck.
- Verification: `pnpm lint`; `pnpm depcruise`; `pnpm test`; `pnpm typecheck`; `pnpm check`; `pnpm cli doctor`; temporary `storage -> engine` fixture failed `pnpm depcruise`; temporary engine `Math.random()` fixture failed `pnpm lint`; enforcement JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/01-team-strength.md`; keep gameplay out until that step is active.

### 2026-06-15 — `docs/steps/00-foundation/03-storage-json.md`

- Status: Done
- Outcome: Created the Phase 0/1 storage boundary and Node JSON implementation for full `GameState` snapshots.
- Adopted solution: `GameStorage` defines save/load/list/delete; `JsonGameStorage` writes one encoded save-ID JSON file per save, stores metadata plus snapshot, preserves `createdAtISO` across overwrites, and routes persisted files through `migrateSave` schema version `1`.
- Verification: `pnpm --filter @game/storage run typecheck`; `node --test packages/storage/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; storage forbidden dependency scan; storage JSDoc scan.
- Follow-up: Start `docs/steps/00-foundation/04-enforcement.md`; replace placeholder lint/dependency checks with real tooling.

### 2026-06-15 — TypeScript `.ts` import config fix

- Status: Done
- Outcome: Added `noEmit: true` to the shared TypeScript base config so package tsconfigs using `allowImportingTsExtensions` are valid in editors and CLI typecheck.
- Adopted solution: The early monorepo remains typecheck-only and Node 24 executes `.ts` sources directly; emitted JavaScript builds can be introduced later through a documented build step.
- Verification: `pnpm -r run typecheck`; `pnpm check`.
- Follow-up: Revisit emit/build settings only when a packaging or build step explicitly requires generated JavaScript.

### 2026-06-15 — `docs/steps/00-foundation/02-shared-rng-and-date.md`

- Status: Done
- Outcome: Created dependency-free shared deterministic RNG streams, stable seed hashing, pure epoch-day date conversion, and focused tests.
- Adopted solution: `deriveRng` builds isolated `sfc32` streams from `seed`, `streamName`, and stable key parts; `fromISO`, `toISO`, `addDays`, and `diffDays` use pure Gregorian arithmetic and no real clock APIs.
- Verification: `pnpm --filter @game/shared run typecheck`; `node --test packages/shared/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; shared forbidden API scan; shared JSDoc scan.
- Follow-up: Start `docs/steps/00-foundation/03-storage-json.md`; keep formal Node test typings and stricter enforcement for `04-enforcement`.

### 2026-06-15 — Domain ID namespace refinement

- Status: Done
- Outcome: Reworked domain ID constructors to enforce a common `type:value` namespace convention.
- Adopted solution: All domain ID constructors now validate their own prefix through a private `namespacedId` helper instead of exposing a partial `stableId` validator.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm test`; `pnpm check`; `pnpm -r run typecheck`.
- Follow-up: Keep future generated IDs on the same convention, e.g. `player:000001` and `fixture:000001`.

### 2026-06-15 — TypeScript JSDoc documentation pass

- Status: Done
- Outcome: Added TSDoc/JSDoc coverage to all TypeScript files written so far.
- Adopted solution: Public domain contracts and package entrypoints document their intent and examples; tests document the behavior protected by their fixtures.
- Verification: no TypeScript file without a `/** ... */` block; `pnpm -r run typecheck`; `pnpm test`; `pnpm check`.
- Follow-up: Keep future public exports documented as they are introduced.

### 2026-06-15 — Domain ID decision documentation propagation

- Status: Done
- Outcome: Propagated the `type:value` ID convention to `requirements.md`, project rules, README guidance, and future ID-producing steps.
- Adopted solution: Requirements and step docs now treat `player:...`, `club:...`, `competition:...`, `fixture:...`, `season:...`, and `save:...` as the canonical ID format.
- Verification: documentation section-count check for all step files; search for old ID examples shows them only as negative test examples or explicitly forbidden legacy forms.
- Follow-up: Future content and season generation must create IDs through domain constructors, not raw strings.

### 2026-06-15 — `docs/steps/00-foundation/01-domain-core-types.md`

- Status: Done
- Outcome: Created dependency-free domain IDs, value objects, core entities, `GameState`, and focused tests.
- Adopted solution: Domain uses branded primitive types with runtime constructors for values that need validation; runtime order is represented by explicit ID arrays beside lookup records.
- Verification: `pnpm --filter @game/domain run typecheck`; `node --test packages/domain/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; domain import scan.
- Follow-up: Start `docs/steps/00-foundation/02-shared-rng-and-date.md`; keep Vitest and stricter enforcement for `04-enforcement`.

### 2026-06-14 — `docs/steps/00-foundation/00-monorepo-skeleton.md`

- Status: Done
- Outcome: Created the minimal pnpm workspace and package skeleton without gameplay code.
- Adopted solution: Root workspace scripts are placeholders for this step; real lint, dependency cruising, and doctor command remain in `04-enforcement`.
- Verification: `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `pnpm exec tsc --showConfig -p apps/cli/tsconfig.json`.
- Follow-up: Start `docs/steps/00-foundation/01-domain-core-types.md`; `pnpm-lock.yaml` is an accepted install artifact from this step.

## Update Protocol

For every step attempt, follow this loop:

1. Read this file.
2. Choose the active step.
3. Implement only that step.
4. Run the required checks.
5. If something is wrong, fix the current step or update the next relevant step document.
6. Update this file in a short entry.
7. Advance only when the step Definition of Done is satisfied.

When updating this file:

1. Update `Current Active Step`.
2. Change the row in the Step Ledger to `Done`, `Rework`, `Skipped`, or the next appropriate status.
3. Summarize the outcome in one sentence.
4. Record the adopted solution, not every rejected option.
5. Add the verification command or test result.
6. Add any lesson that changes future work to `Open Decisions And Follow-Up`.
7. If the next step changed, update that step document before implementation starts.

## Handoff Note Template

Use this format at the end of a step:

```md
### YYYY-MM-DD — Step path

- Status: Done | Rework | Skipped
- Outcome:
- Adopted solution:
- Verification:
- Follow-up:
```
