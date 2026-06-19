# Project Status

This file is the project handoff snapshot for LLMs and junior developers. Update it after every step attempt, completed step, rework decision, and adopted solution change.

## Current State

- Phase: Phase 0 foundation complete; Phase 1 match-engine base complete; documented Phase 2 season-simulation sequence complete; Phase 3 balance calibration complete; Phase 4 player stats and match detail complete; Phase 5 match event detail documented.
- Active implementation step: `docs/steps/05-match-event-detail/01-shot-event-contract.md`.
- Code status: monorepo skeleton, dependency-free domain core contracts, deterministic shared RNG/date utilities, JSON save storage boundary, executable enforcement, `pnpm cli doctor`, pure team-strength derivation, serializable match context/config contracts, deterministic one-minute match stepping with engine-local goal scorer attribution, batch full-match simulation, durable domain match reports with scorer IDs on goal events, deterministic double round-robin calendar generation, copy-on-write fixture result application, deterministic derived league-table computation, season player goal-stat aggregation, fake deterministic content, `pnpm cli simulate-season --seed=demo-001` with real top-scorer output and optional round fixture detail, and `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` exist; balance report now includes explicit table points spread.
- Runtime: Node `v24.16.0` from `.nvmrc`.
- First command milestone: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001` achieved.
- First balance milestone: `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` achieved.
- Source of truth: `requirements.md`.

## Current Active Step

- Step: `docs/steps/05-match-event-detail/01-shot-event-contract.md`
- Status: Not started
- Last verification: Phase 5 documentation-only planning update; no code checks required.
- Next action: Implement only the richer structured shot-event contract from `docs/steps/05-match-event-detail/01-shot-event-contract.md`.

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
| `docs/steps/01-match-engine/02-match-context.md` | Done | Serializable match context and engine config contracts were created. | `MatchContext` carries fixture ID, seed, explicit home/away team contexts, precomputed strengths, tactical distribution inputs, and `MatchEngineConfig`; `buildMatchRngKey` defines the stable `seed + "match" + fixtureId` derivation data without consuming RNG. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/match-context.test.ts`; `pnpm check`; engine forbidden import/API scan; JSDoc scan |
| `docs/steps/01-match-engine/03-step-match.md` | Done | Deterministic one-minute match stepping was created. | `MatchSimulationState` keeps match-local minute, score, stats, and marker flags; `stepMatch` advances one minute, randomizes home/away processing order through the match RNG, generates Bernoulli opportunities from aggregate team strengths, and resolves them through `OccasionResolver` with `AggregateOccasionResolver`; step events remain engine-local until the later domain `MatchReport` step. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan |
| `docs/steps/01-match-engine/04-simulate-match.md` | Done | Batch full-match simulation over `stepMatch` was created. | `simulateMatch(context)` derives one match RNG stream from `seed + "match" + fixtureId`, initializes local `MatchSimulationState`, loops over `stepMatch` until full time, returns serializable fixture ID, final minute, score, stats, and sparse step events, and fails with typed `SimulateMatchError` if the safety guard is exceeded; golden-output tests now lock full-match reproducibility. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan |
| `docs/steps/01-match-engine/05-match-report.md` | Done | Durable domain match report and event contracts were created. | `domain` owns `MatchReport`, `MatchStats`, `MatchScore`, `MATCH_EVENT_SCHEMA_VERSION`, and sparse language-agnostic `MatchEvent` variants; `engine` maps local simulation events to report events through `createMatchReport` without prose, storage schemas, fixture updates, or new simulation logic. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/01-calendar-generation.md` | Done | Deterministic double round-robin calendar generation was created. | `domain` owns minimal `Competition`, `Fixture`, and `Round` contracts; `engine` generates an even-club double round-robin calendar by shuffling explicit club IDs with `deriveRng(seed, "schedule", seasonId, competitionId)`, applying the Berger circle method, mirroring return fixtures, assigning weekly `GameDate`s, and generating sequential `fixture:` IDs. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/calendar.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/02-fixtures-and-results.md` | Done | Completed match reports can now be applied to fixture results without mutating original state. | `domain` owns compact `FixtureResult` as the table source of truth; `engine` exposes `applyMatchReportToFixture` with typed errors, fixture/report ID validation, default overwrite guard, optional debug overwrite, and copy-on-write replacement of the fixture lookup. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/03-league-table.md` | Done | League tables are now derived deterministically from played fixture results. | `domain` owns `LeagueTableRow` and simple point `LeagueTableRules`; `engine` exposes `computeLeagueTable` over explicit club IDs, fixture lookup, fixture ID order, and rules, ignoring unplayed fixtures and sorting by points, goal difference, goals for, then stable club ID. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/league-table.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/04-simulate-season-cli.md` | Done | The first gameplay milestone command now simulates one deterministic fake 18-team season and prints the final table. | `content` generates fictional clubs, players, lineups, role weights, table rules, and match config; `engine` owns a tested `simulateSeason` use-case; `apps/cli` exposes `simulate-season --seed` and composes exported engine primitives to print table, top-scorer availability, best defense, and worst attack. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; invalid-arg CLI check; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/05-season-balance-report.md` | Done | Added deterministic aggregate season balance reporting and a strict CLI gate mode. | `simulation-tools` owns content-free aggregate calibration; `content` owns broad hand-authored targets; `engine` publicly exports `simulateSeason`; CLI wires fake content into the report without importing `domain` directly. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts`; `pnpm check`; default and strict-fail CLI smoke checks; forbidden API/dependency scans |
| `docs/steps/03-balance-calibration/01-calibration-target-profile.md` | Done | Added stricter `calibration-v1` target profile and CLI support without changing simulation behavior. | `default` remains the broad smoke profile; `calibration-v1` exposes the current under-scoring/draw-heavy gap; `strict-fail-smoke` remains the intentional failure profile for CLI tests. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts`; `pnpm check`; default strict CLI report passed; `calibration-v1` strict CLI report failed as expected |
| `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` | Done | Tuned fake match-engine rates and reworked conversion bands so the 20-season `calibration-v1` sample passes near 2.8 goals per match. | Config-only tuning uses base opportunity rate `0.09`, cap `0.24`, conversion probabilities `0.105/0.20/0.35`, and home advantage `1.10`; no engine algorithms changed. | Baseline `calibration-v1` 20-season report failed; first tuning reached goals `3.197`; rework reached goals `2.773` with strict report PASS; `pnpm check` passed |
| `docs/steps/03-balance-calibration/03-table-spread-review.md` | Done | Added explicit average table points spread to balance reporting and confirmed the tuned 20-season sample remains plausible. | `simulation-tools` now reports `table_points_spread` as average first-place minus last-place points; content target profiles include broad/default and stricter `calibration-v1` bands. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused calibration/CLI tests; `pnpm check`; `calibration-v1` strict 20-season report passed |
| `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` | Done | Fake content now produces a stronger top-to-bottom hierarchy while preserving current scoring calibration. | Widened generated player base ability gradient from roughly `7.2..12.5` to roughly `6.6..13.3` and reduced slot noise from `0.5` to `0.35`; no engine algorithms or scoring probabilities changed. | `pnpm --filter @game/content run typecheck`; focused content/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md` | Done | Every engine-local goal step event now carries a deterministic scorer from the scoring side lineup. | `attributeGoal` derives an independent `goal-attribution` RNG stream from seed, fixture, minute, side, and pre-goal score, then picks a weighted scorer by lineup role; this avoids consuming the main match RNG and preserves aggregate match outcomes/calibration. | `pnpm --filter @game/engine run typecheck`; focused match-engine Vitest files; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md` | Done | Durable domain goal events now preserve the scorer ID from engine-local goal step events. | `GoalMatchEvent` includes `scorerPlayerId`; `createMatchReport` copies it exactly from the engine event; `MATCH_EVENT_SCHEMA_VERSION` was bumped from `1` to `2` because the durable event schema changed. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-report/fixture tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001` |
| `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md` | Done | Simulated seasons now expose deterministic player goal totals derived from durable match reports. | `computeSeasonPlayerGoalStats` reads `MatchReport` schema v2 goal events, maps `home/away` sides to fixture clubs, includes fixed-lineup registered players with zero goals, and sorts by goals descending then stable player ID; `simulateSeason` returns `playerGoalStats`. | `pnpm --filter @game/engine run typecheck`; focused player-stat/simulate-season tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001` |
| `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md` | Done | CLI season output now prints a real deterministic top scorer instead of the aggregate-engine placeholder. | `simulate-season` now calls engine `simulateSeason` directly and formats `result.playerGoalStats[0]` with player display name, club short name, and goal count; it does not recompute stats in CLI. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md` | Done | CLI can now print deterministic fixture results and goal scorers for one requested round. | `simulate-season --round=<number>` reuses the existing `simulateSeason` result, prints fixtures in round order, includes final score and scorer/minute details from durable reports, and rejects invalid or missing round arguments cleanly. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/README.md` | Done | Created the Phase 5 documentation path for richer structured match-event detail. | Phase 5 starts with a shot-event contract, then optional assists, goalkeeper save attribution, player match stats, and CLI match detail v2; it stays deterministic, CLI-first, and avoids full duel chains or UI. | Documentation-only update; no code checks required |
| `docs/steps/05-match-event-detail/01-shot-event-contract.md` | Not started | Active next step. | Extend durable and engine-local shot outcome context with small structured fields without changing scoring behavior. | Pending |
| `docs/steps/05-match-event-detail/02-assist-attribution.md` | Planned | Future Phase 5 step. | Add deterministic optional assist attribution to goal events after the shot-event contract exists. | Pending |
| `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` | Planned | Future Phase 5 step. | Attribute saved-shot events to the defending goalkeeper after assist work is complete. | Pending |
| `docs/steps/05-match-event-detail/04-player-match-stats.md` | Planned | Future Phase 5 step. | Derive minimal per-player match stats from durable match reports after goal/assist/save event data exists. | Pending |
| `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` | Planned | Future Phase 5 step. | Expose richer structured match detail through the CLI without UI or duplicate simulation paths. | Pending |

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
- Match context is serializable and self-contained: future match simulation should consume `MatchContext` without reading `GameState`, content files, storage, or UI preferences.
- Match RNG derivation data is standardized as `seed + "match" + fixtureId`; the context step defines the key but does not create or consume an RNG stream.
- Match stepping is local and serializable: `MatchSimulationState` owns minute, score, stats, and marker flags; durable domain `MatchEvent`/`MatchReport` types are still deferred to their documented step.
- Batch match simulation is reproducible end-to-end: `simulateMatch` derives the match RNG internally and the fixed golden output test locks the complete result shape and event sequence.
- Match reports are durable domain data: `MatchReport` stores schema version, fixture ID, final minute, score, stats, and sparse structured events; narration, fixture application, storage schemas, and retention remain separate future steps.
- Calendar generation is deterministic and date-first: fixtures carry both `roundNumber` and `GameDate`; the first implementation supports even-club double round-robin leagues, one round every seven days, no cups/breaks/rescheduling.
- Fixture results are the source of truth for future standings: `FixtureResult` stores `played`, `homeGoals`, and `awayGoals`; the rich `MatchReport` is only an optional reference.
- Fixture result application is copy-on-write over `GameState & FixtureStateSlice`; `game-state.ts` was not modified because it was not listed in the active step's expected files.
- League tables are derived, not persisted: `computeLeagueTable` reads only compact fixture results in explicit fixture order and uses stable club ID ordering as the final tie-breaker.
- The first season CLI milestone uses fictional generated content only: 18 fake clubs, generated players, fixed 4-4-2 lineups, content-provided role weights, and no real football data.
- `simulate-season` is deterministic by seed and prints a final table plus best defense and worst attack; player-level top scorer is explicitly unavailable until the match engine attributes goals to players.
- `simulateSeason` is now exported from `@game/engine` because balance tooling needs the season use-case through the package boundary.
- `packages/simulation-tools` is the content-free place for deterministic aggregate reports; it may use `domain`, `engine`, and `shared`, while apps supply concrete content and target profiles.
- `balance-report` uses broad hand-authored calibration targets from content, reports goals per match, result rates, table points, and upset proxy, and exits nonzero only when `--strict` is enabled and a metric fails.
- Phase 3 balance calibration starts with target/profile separation before tuning: `default` remains a broad smoke profile, while `calibration-v1` is the stricter gate used to expose under-scoring and draw-heavy output.
- Current `calibration-v1` baseline for `seed-prefix=balance-demo`, `seasons=3`: goals per match `1.127` fails `2.000..3.200`; home win rate `0.296` fails `0.330..0.550`; draw rate `0.444` fails `0.180..0.330`; first-place points `57.000` fails `66.000..90.000`.
- Match rate tuning is config-only so far: fake content now uses base opportunity rate `0.09`, max opportunity rate `0.24`, conversion probabilities `0.105/0.20/0.35`, and home advantage `1.10`.
- Current tuned `calibration-v1` sample for `seed-prefix=test-balance`, `seasons=20`: goals per match `2.853`, home win rate `0.416`, draw rate `0.235`, away win rate `0.350`, first-place points `71.450`, last-place points `23.500`, table points spread `47.950`, upset rate `0.331`; all pass.
- Table spread review is an explicit report metric now: `table_points_spread` means average first-place points minus last-place points across the simulated season batch.
- Fake content strength spread is now wider and less noisy by slot: the top generated clubs should separate more reliably from bottom generated clubs before future richer match mechanics exist.
- Phase 4 focuses on player-visible match detail: goal attribution, durable scorer events, season player goal stats, CLI top scorers, and minimal fixture detail.
- Goal attribution is engine-local in step 04/01: goal step events include `scorerPlayerId`, but durable domain `MatchReport` goal events and CLI output still do not expose scorers until later Phase 4 steps.
- Goal attribution uses an independent deterministic `goal-attribution` RNG stream, not the main match RNG, so adding scorer IDs does not change match results, league tables, or balance metrics.
- Match event schema version `2` adds durable `scorerPlayerId` to goal events; season/player-stat code should read this field from `MatchReport` goal events instead of engine-local step events.
- `simulateSeason` now returns `playerGoalStats`, derived from durable report goal events and fixed-lineup registrations; CLI consumes this result for the top-scorer line without recomputing stats.
- Current `pnpm cli simulate-season --seed=demo-001` top scorer: `Player01 No06 (PRO01) - 15 goals`.
- `simulate-season --round=<number>` prints deterministic fixture-level results and scorer lines from existing simulated season reports; it does not run a separate match/season simulation path.
- Phase 4 is intentionally not the full duel engine, match-day UI, storage migration, market, growth, staff, youth, facilities, or economy phase.
- Phase 5 is documented as match event detail: richer shot context, optional assists, goalkeeper save attribution, player match stats, and CLI match detail v2.
- Phase 5 must stay deterministic and language-agnostic; it should not implement full possession chains, live match-day UI, storage browsing, management systems, or rendered commentary.

## Open Decisions And Follow-Up

- `pnpm-lock.yaml` was created by the required `pnpm install` verification even though it was not listed in the step `Expected files`; keep it as the workspace lockfile.
- `pnpm install` resolved TypeScript `^5.8.3` to `5.9.3`; keep this acceptable unless a later step needs a pinned compiler version.
- `packages/domain/tsconfig.json` enables `allowImportingTsExtensions` so Node 24 can execute TypeScript tests directly.
- `packages/shared/tsconfig.json` also enables `allowImportingTsExtensions`, matching `domain`, because the workspace currently runs `.ts` files directly under Node 24.
- `packages/storage/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/engine/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/content/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because generated content now imports workspace source packages directly.
- `apps/cli/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because the CLI imports local `.ts` command modules and workspace source packages directly under Node 24.
- `tsconfig.base.json` sets `noEmit: true`, because current packages are typechecked and executed directly from `.ts` files; this satisfies TypeScript's `allowImportingTsExtensions` requirement without producing unresolved emitted JavaScript imports.
- `vitest.config.ts` includes both `packages/**/*.test.ts` and `apps/**/*.test.ts` so CLI command tests are part of `pnpm check`.
- Phase 5 documentation exists; the active implementation step is `docs/steps/05-match-event-detail/01-shot-event-contract.md`.
- When a future documented step lists `packages/domain/src/state/game-state.ts`, consolidate `fixtures` and `fixtureIds` into the base `GameState` contract instead of keeping them only as a use-case slice.

### 2026-06-19 — `docs/steps/05-match-event-detail/README.md`

- Status: Done
- Outcome: Created Phase 5 documentation and five implementation step documents for richer structured match-event detail.
- Adopted solution: Phase 5 will proceed from shot-event contract enrichment to optional assist attribution, goalkeeper save attribution, player match-stat derivation, and CLI match detail v2; full duel chains, UI, storage browsing, management systems, and rendered prose remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/05-match-event-detail/01-shot-event-contract.md` next.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`

- Status: Done
- Outcome: Added minimal CLI fixture result/detail inspection for one deterministic round.
- Adopted solution: `simulate-season --round=<number>` reuses the existing `simulateSeason` result, finds the requested round by explicit round order, formats fixture IDs, club short names, final scores, and goal scorer/minute details from durable match reports; invalid round values and missing rounds fail cleanly.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (10 tests); `pnpm check` (22 files, 118 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; create the next numbered step group before implementing more gameplay scope.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`

- Status: Done
- Outcome: Replaced the CLI top-scorer placeholder with deterministic player-level output.
- Adopted solution: `apps/cli` now composes through engine `simulateSeason` and formats the first `playerGoalStats` row as `Top scorer: Player Name (CLUB) - N goals`; the CLI no longer owns a manual season simulation loop or recomputes scorer totals.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (6 tests); `pnpm check` (22 files, 114 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`; reuse the `simulateSeason`-based CLI flow for fixture detail and do not restore duplicate simulation logic.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`

- Status: Done
- Outcome: Added deterministic season player goal-stat aggregation from durable `MatchReport` goal events.
- Adopted solution: Created `computeSeasonPlayerGoalStats` in `engine/season-engine`; it reads report schema v2 goal events, maps event side to fixture club, includes explicit player registrations for zero-goal players, sorts by goals descending then stable player ID, and is exposed through `simulateSeason(...).playerGoalStats`.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts` (8 tests); `pnpm check` (22 files, 113 tests); `pnpm cli simulate-season --seed=demo-001`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`; consume `playerGoalStats` in CLI output instead of recomputing stats or reading reports there.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`

- Status: Done
- Outcome: Promoted goal scorer IDs from engine-local events into the durable domain `MatchReport` event contract.
- Adopted solution: `GoalMatchEvent` now carries `scorerPlayerId`; `createMatchReport` copies the field from goal `shot_outcome` events without recalculating attribution; `MATCH_EVENT_SCHEMA_VERSION` is now `2` to mark the durable schema change.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts` (22 tests); `pnpm check` (21 files, 109 tests); `pnpm cli simulate-season --seed=demo-001`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`; aggregate goals from durable `MatchReport` goal events with `scorerPlayerId`, not from engine-local events or prose.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md`

- Status: Done
- Outcome: Added deterministic engine-local goal scorer attribution for every simulated goal.
- Adopted solution: Created `packages/engine/src/match-engine/goal-attribution.ts` with role-weighted scorer selection from the scoring side lineup; `stepMatch` now adds `scorerPlayerId` only to goal `shot_outcome` events; the attribution stream is derived separately from seed, fixture, minute, side, and pre-goal score so aggregate simulation results remain unchanged.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/goal-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check` (21 files, 107 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals `2.853`, first-place points `71.450`, table spread `47.950`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`; promote existing engine-local `scorerPlayerId` values into durable report events without recalculating attribution or adding assists, season aggregation, CLI top scorers, UI, storage, or full duel chains.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/README.md`

- Status: Done
- Outcome: Created Phase 4 documentation and five implementation step documents for player stats and match detail.
- Adopted solution: Phase 4 starts with deterministic goal attribution, then durable scorer events, season player stats, CLI top scorers, and minimal fixture detail; UI, storage, full duels, assists, cards, injuries, substitutions, market, growth, staff, youth, facilities, and economy remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md` next.

### 2026-06-19 — `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md`

- Status: Done
- Outcome: Increased fake content team-strength hierarchy while keeping the current scoring calibration intact.
- Adopted solution: Changed only `packages/content/src/generators/fake-players.ts`: widened the club base ability gradient to `6` points and reduced deterministic slot noise to `0.35`; added a content test that locks a visible role ability edge between top and bottom generated clubs; updated the CLI calibration smoke test because the short `calibration-v1` sample now passes.
- Verification: Baseline `demo-001` champion had `61` points; after tuning `demo-001` champion has `65` points, bottom has `19`, and spread is `46`; 20-season `calibration-v1` report passed with goals `2.853`, first-place points `71.450`, last-place points `23.500`, table spread `47.950`, and upset rate `0.331`; `pnpm --filter @game/content run typecheck`; focused content/CLI tests; `pnpm check` (20 files, 101 tests).
- Follow-up: Stop here; choose or document the next numbered step before implementing more gameplay scope.

### 2026-06-19 — `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` planning

- Status: Not started
- Outcome: Created the next documented calibration step after reviewing that `goals_per_match` is healthy but table hierarchy can be too soft.
- Adopted solution: Reopen Phase 3 for one narrow fake-content strength-spread tuning step; preserve current scoring calibration unless the step proves strength spread alone is insufficient.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` next.

### 2026-06-17 — `docs/steps/03-balance-calibration/03-table-spread-review.md`

- Status: Done
- Outcome: Reviewed table spread as a first-class calibration signal instead of inferring it from separate first/last-place point rows.
- Adopted solution: Added `table_points_spread` to `simulation-tools` and content target profiles; `calibration-v1` accepts `36..60`, and the tuned `test-balance` 20-season sample reports `40.400`.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts` (11 tests); `pnpm check` (19 files, 99 tests); `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; choose or write the next numbered step before implementing anything beyond Phase 3.

### 2026-06-17 — `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` rework

- Status: Done
- Outcome: Moved goals per match from the upper-bound `3.197` sample toward the requested `~2.8` target while keeping `calibration-v1` strict mode passing.
- Adopted solution: Reduced only fake content conversion probabilities from `0.12/0.23/0.40` to `0.105/0.20/0.35`; opportunity rates, home advantage, engine algorithms, targets, and CLI shape were left unchanged.
- Verification: Before rework, `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals `3.197`; after rework it passed with goals `2.773`, draw rate `0.250`, first-place points `66.500`, and table spread `39.050`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused CLI/report tests; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; default strict smoke report passed.
- Follow-up: Stop here; next implementation still requires choosing or writing a new numbered step.

### 2026-06-17 — `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md`

- Status: Done
- Outcome: Tuned the fake match-engine config so the 20-season `calibration-v1` sample passes without engine algorithm changes.
- Adopted solution: Adjusted only content-provided `MatchEngineConfig`: base opportunity rate `0.045 -> 0.09`, cap `0.16 -> 0.24`, conversion bands `0.08/0.17/0.32 -> 0.12/0.23/0.40`, and home advantage `1.06 -> 1.10`.
- Verification: Baseline `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` failed with goals `1.125` and draw rate `0.426`; after tuning the same command passed with goals `3.197`, draw rate `0.222`, and first-place points `68.050`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts`; `pnpm check` (19 files, 99 tests); default strict smoke report passed.
- Follow-up: Start `docs/steps/03-balance-calibration/03-table-spread-review.md`; inspect whether passing table spread is actually plausible and whether goals being near the upper bound needs target or config follow-up.

### 2026-06-17 — `docs/steps/03-balance-calibration/01-calibration-target-profile.md`

- Status: Done
- Outcome: Added the `calibration-v1` target profile and exposed it through `pnpm cli balance-report --target-profile=calibration-v1`.
- Adopted solution: Kept `default` broad, kept `strict-fail-smoke` for intentional CLI failures, and added `calibration-v1` as a stricter profile that currently fails without changing match simulation behavior.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts` (10 tests); `pnpm check` (19 files, 98 tests); `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=default --strict` exited `0`; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=calibration-v1 --strict` exited `1` as expected.
- Follow-up: Start `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` using the recorded `calibration-v1` failures as the baseline.

### 2026-06-17 — `docs/steps/03-balance-calibration/README.md`

- Status: Done
- Outcome: Created the Phase 3 balance calibration step group.
- Adopted solution: Phase 3 starts with a strict `calibration-v1` target profile, then rate tuning, then table-spread review; this keeps measurement, tuning, and standings review separate.
- Verification: Documentation-only planning step after reading `requirements.md`, `docs/PROJECT_RULES.md`, and `docs/PROJECT_STATUS.md`; no code checks required.
- Follow-up: Implement `docs/steps/03-balance-calibration/01-calibration-target-profile.md` only.

### 2026-06-16 — `docs/steps/02-season-simulation/05-season-balance-report.md`

- Status: Done
- Outcome: Created `packages/simulation-tools` and `pnpm cli balance-report`, producing deterministic aggregate season metrics with PASS/FAIL target evaluation.
- Adopted solution: `simulation-tools` runs content-free calibration batches over the public engine `simulateSeason`; content provides broad fictional target profiles; CLI supplies fake league input and supports strict nonzero failure mode without importing `domain` directly.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts` (9 tests); `pnpm check` (19 files, 97 tests); `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3`; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=1 --target-profile=strict-fail-smoke --strict` exited nonzero as expected; forbidden API/dependency scans.
- Follow-up: Do not implement more features until the next numbered step document exists and is selected as active.

### 2026-06-16 — `docs/steps/02-season-simulation/04-simulate-season-cli.md`

- Status: Done
- Outcome: Created `pnpm cli simulate-season --seed=demo-001`, producing a deterministic fake 18-team season table.
- Adopted solution: Fictional content generates clubs, players, lineups, role weights, table rules, and match config; engine has a tested `simulateSeason` flow; CLI parses `--seed`, composes exported engine primitives, and prints final table, top-scorer availability, best defense, and worst attack.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check` (17 files, 88 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --unknown` exited nonzero; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/05-season-balance-report.md`; aggregate deterministic balance data without adding persistence, UI, real data, or future management systems.

### 2026-06-16 — `docs/steps/02-season-simulation/03-league-table.md`

- Status: Done
- Outcome: Added deterministic derived league-table contracts and computation from played fixture results.
- Adopted solution: `LeagueTableRules` defines the point system, `LeagueTableRow` stores derived standings data, and `computeLeagueTable` accumulates wins/draws/losses/goals/points from played fixtures only, then sorts by points, goal difference, goals for, and stable club ID.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/league-table.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/04-simulate-season-cli.md`; wire the first CLI season milestone without adding playoffs, promotions, persistence, or UI.

### 2026-06-16 — `docs/steps/02-season-simulation/02-fixtures-and-results.md`

- Status: Done
- Outcome: Added compact fixture results and a pure use-case that applies a completed `MatchReport` to a fixture.
- Adopted solution: `FixtureResult` stores played flag and final goals as the future table source of truth, while `applyMatchReportToFixture` validates fixture/report identity, rejects default overwrites, supports explicit debug overwrite, and returns a copy-on-write state with only the fixture lookup replaced.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/03-league-table.md`; derive standings from fixture results only, without reading match events, simulating matches, or adding persistence.

### 2026-06-15 — `docs/steps/02-season-simulation/01-calendar-generation.md`

- Status: Done
- Outcome: Created deterministic double round-robin calendar generation for one competition.
- Adopted solution: `generateRoundRobinCalendar` validates an even explicit club list, derives a `schedule` RNG stream from seed, season ID, and competition ID, shuffles clubs with Fisher-Yates, builds Berger first-half pairings, mirrors the return half with home/away inverted, assigns seven-day-spaced `GameDate`s, and emits stable sequential `fixture:` IDs.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/calendar.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/02-fixtures-and-results.md`; add fixture result application without simulating matches, computing tables, persistence, or mutation in place.

### 2026-06-15 — `docs/steps/01-match-engine/05-match-report.md`

- Status: Done
- Outcome: Created durable domain `MatchReport`/`MatchEvent` contracts and engine conversion from simulation output.
- Adopted solution: `MatchEvent` is a sparse discriminated union with marker events plus separate `goal`/`save`/`miss`/`block` shot outcomes sharing `ShotContext`; `createMatchReport` copies score, stats, final minute, fixture ID, schema version, and known event fields only, dropping future engine-local fields and never storing rendered text.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/01-calendar-generation.md`; keep fixture application, league tables, storage schemas, narration, and retention out until their documented steps.

### 2026-06-15 — `docs/steps/01-match-engine/04-simulate-match.md`

- Status: Done
- Outcome: Created deterministic batch full-match simulation over the existing one-minute `stepMatch` loop.
- Adopted solution: `simulateMatch(context)` derives the match RNG from `seed + "match" + fixtureId`, initializes local match state, loops until full time with a safety guard, and returns serializable final minute, score, stats, and sparse engine-local step events; golden-output and JSON equality tests close the full-match reproducibility gap.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/05-match-report.md`; convert existing step/simulation output into durable domain `MatchEvent`/`MatchReport` data without narration, storage schemas, fixture updates, or new simulation logic.

### 2026-06-15 — `docs/steps/01-match-engine/03-step-match.md`

- Status: Done
- Outcome: Created deterministic one-minute match stepping with local simulation state, aggregate chance generation, and resolver-backed opportunity resolution.
- Adopted solution: `stepMatch` advances one minute without mutating input state, randomizes home/away processing order from the match RNG, generates per-team Bernoulli opportunities from aggregate strengths, and resolves shot outcomes through `AggregateOccasionResolver` behind `OccasionResolver`; sparse step events are engine-local until the future `MatchReport` contract exists.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/04-simulate-match.md`; add the batch driver over `stepMatch` without CLI, fixture updates, reports, or narration.

### 2026-06-15 — `docs/steps/01-match-engine/02-match-context.md`

- Status: Done
- Outcome: Created serializable match context and match engine config contracts with focused validation tests.
- Adopted solution: `MatchContext` describes fixture ID, seed, explicit home/away team contexts, precomputed `TeamStrength`, tactical distribution inputs, and `MatchEngineConfig`; validation is done with typed `MatchContextError`; `buildMatchRngKey` returns stable derivation data for future `deriveRng(seed, "match", fixtureId)` use.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/match-context.test.ts`; `pnpm check`; engine forbidden import/API scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/03-step-match.md`; do not add full match simulation, reports, or drivers outside that step.

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
