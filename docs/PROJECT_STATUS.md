# Project Status

This file is the project handoff snapshot for LLMs and junior developers. Update it after every step attempt, completed step, rework decision, and adopted solution change.

## Current State

- Phase: Phase 0 foundation complete; Phase 1 match-engine base complete; documented Phase 2 season-simulation sequence complete; Phase 3 balance calibration complete; Phase 4 player stats and match detail complete; Phase 5 match event detail complete; Phase 6 CLI inspection and stat completeness complete; Phase 7 match engine causal v1 complete; Phase 8 tactic and lineup MVP complete; Phase 9 manual tactical changes v1 complete; Phase 10 player dynamic states complete; Phase 11 manual lineup rotation v1 complete; Phase 12 squad selection and formation core complete; Phase 13 localization foundation complete; Phase 14 engine audit and core quality review complete; Phase 15 core cleanup before career systems complete; Phase 16 career systems dependency map complete; Phase 17 market MVP permanent transfers complete.
- Active implementation step: none; next action is to decide/document the next phase, recommended as career state and transfer persistence.
- Code status: monorepo skeleton, dependency-free domain core contracts, selected-lineup/tactic setup domain contracts, deterministic shared RNG/date utilities, JSON save storage boundary, executable enforcement, `pnpm cli doctor`, pure team-strength derivation, engine `buildTacticTeamContext` setup builder, serializable match context/config contracts, deterministic one-minute match stepping with structured shot context, complete current derived player match stats, engine-local deterministic `ChanceActors` selection for creator/shooter/primary defender/goalkeeper, and `stepMatch` attribution wired through one coherent chance actor set, batch full-match simulation, explicit `ManualTacticChangeSchedule` contract over already-built `MatchTeamContext`s, segmented fixture simulation via `simulateMatchWithManualTactics`, optional `simulateSeason.fitnessLifecycle` spend/recovery with returned `finalPlayerStates`, `simulateSeason` selected setup overrides and fixture lineup overrides, in-memory permanent-transfer market contracts, deterministic true-data player valuation, player willingness, transfer feasibility/apply preview, durable domain match reports with schema version `7`, scorer IDs, optional assist IDs, optional non-duplicated goal creator IDs, goalkeeper save IDs, shooter IDs for generated non-goal shot events, block primary defender IDs, and structured shot context on goal/shot events, deterministic double round-robin calendar generation, copy-on-write fixture result application, deterministic derived league-table computation, season player goal and summary aggregation, fake deterministic content with default 11-player lineups plus reserve players, `pnpm cli simulate-season --seed=demo-001` with real top scorer, top assist, and top goalkeeper-save output, optional round fixture detail, clean `--fixture=<fixtureId>` structured match detail with all-starter player stats plus compact causal `creator=` and `defender=` fields, `--setup-demo=pro01-balanced|pro01-attacking|pro01-defensive` CLI inspection that applies deterministic PRO01 selected lineup/tactic overrides through `simulateSeason.setupOverrides`, `--manual-tactic-switch=<minute>:<profile>` fixture inspection that applies a user-declared manual tactic switch only when the selected club is playing the requested fixture, `--condition-demo=pro01-season` season inspection for deterministic PRO01 fitness consequences, `--fixture=<fixtureId> --lineup-demo=pro01-first-team|pro01-rotated` manual lineup inspection, and localized `--market-demo=pro01-affordable-permanent|pro01-star-rejected` permanent-transfer inspection; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` exists and balance report includes explicit table points spread.
- Runtime: Node `v24.16.0` from `.nvmrc`.
- First command milestone: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001` achieved.
- First balance milestone: `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` achieved.
- Source of truth: `requirements.md`.

## Current Active Step

- Step: none
- Status: Phase 17 complete
- Last verification: `pnpm check`, season smoke, Italian formation-fit smoke, accepted/rejected/Italian market-demo smokes, strict calibration balance report, no-storage scan, and out-of-scope scan were run.
- Next action: Decide and document the next phase; recommended target is career state and transfer persistence before loans, contracts/wages, transfer windows, scouting fog, AI market behavior, installments, or player exchanges.

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
| `docs/steps/05-match-event-detail/01-shot-event-contract.md` | Done | Durable and engine-local shot outcome events now carry structured shot context. | Added `shotType` and `chanceType` to `ShotContext` and engine-local shot events; values are derived deterministically from existing minute, side, quality, and tactical distribution data without consuming extra RNG or changing outcomes; `MATCH_EVENT_SCHEMA_VERSION` is now `3`. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine/player-stat tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/02-assist-attribution.md` | Done | Goal events can now carry deterministic optional assist IDs. | Added `attributeAssist` with a separate `assist-attribution` RNG stream keyed by seed, fixture, minute, side, pre-goal score, scorer, `shotType`, and `chanceType`; assists are optional, exclude the scorer and goalkeepers, favor midfield creators, and are copied into durable reports without changing match outcomes. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` | Done | Saved-shot events now carry the defending goalkeeper ID. | Added `attributeGoalkeeperSave`, required `goalkeeperPlayerId` on durable save events, bumped `MATCH_EVENT_SCHEMA_VERSION` to `5`, and made missing goalkeeper slots fail clearly. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/04-player-match-stats.md` | Done | Engine can derive compact per-player match stats from durable reports. | Added public `computePlayerMatchStats` with goals, assists, known player shots, shots on target, and saves; explicit registrations include zero-stat players and output sorts deterministically. | `pnpm --filter @game/engine run typecheck`; focused engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` | Done | CLI can now inspect one fixture with structured match-event detail and compact player stats. | Added `simulate-season --fixture=<fixtureId>` rendering from existing season results and engine `computePlayerMatchStats`; output includes event order, goals with optional assists, stable shot/chance keys, saves, misses, blocks, and compact player stats. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/README.md` | Done | Created the Phase 6 documentation path for cleaner CLI inspection and complete current player stats. | Phase 6 starts with fixture-only CLI output, then shot taker attribution, complete player match stats, fixture player-stat rendering v2, and season assist/save summaries. | Documentation-only update; no code checks required |
| `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md` | Done | `--fixture=<fixtureId>` now prints a clean fixture-detail view without the full final table. | The CLI branches to a fixture-only renderer when `--fixture` is present, reusing the same simulated season result and preserving base season and round views. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md` | Done | Generated non-goal shot events now carry deterministic attacking shooter IDs. | Added `attributeShotTaker` on a separate derived RNG stream; generated save/miss/block report events now include `shooterPlayerId`, while goals keep `scorerPlayerId` as the shooter field in the current aggregate model; `MATCH_EVENT_SCHEMA_VERSION` is now `6`. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md` | Done | `computePlayerMatchStats` now counts complete current shot stats from durable report events. | Goals credit `scorerPlayerId`; generated save/miss/block events credit `shooterPlayerId` when present; shots on target follow durable `shot.isShotOnTarget`; saves remain credited to the defending goalkeeper. | `pnpm --filter @game/engine run typecheck`; focused engine and CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md` | Done | Fixture detail now renders a clearer all-starter player-stat table. | The CLI passes home/away lineup registrations into `computePlayerMatchStats`, keeps contribution sorting for active players, and includes zero-stat starters as deterministic rows. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md` | Done | Season output now includes top assist and top goalkeeper-save summaries. | Added engine `computeSeasonPlayerSummaryStats` for goals, assists, and saves from durable reports; `simulateSeason` returns `playerSummaryStats`; CLI selects top assist/save rows from engine-derived stats without parsing rendered text. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; focused player-stat/simulate-season/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/README.md` | Done | Created the Phase 7 documentation path for causal match-event work. | Phase 7 starts with a baseline review, then chance actor selection, step-match integration, durable causal event context, and CLI causal fixture review. | Documentation-only update; no code checks required |
| `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md` | Done | Phase 6 CLI output is coherent enough to become the before/after baseline for causal match work. | No rework before causal actors: keep current fixture detail as the baseline, with the known limitation that richer causal context is still future Phase 7 scope rather than a blocker. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` | Done | Added an engine-local deterministic `ChanceActors` selector with focused tests. | `selectChanceActors` uses a separate `chance-actors` RNG stream, chooses attacking creator/shooter, defending primary defender, and defending goalkeeper from explicit lineup order, excludes goalkeepers from attacking creator/shooter roles, and requires a defending `gk` slot. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md` | Done | `stepMatch` now uses one coherent chance actor set for current player attribution. | `selectChanceActors` is called once per generated opportunity after aggregate outcome resolution; goals use selected shooter as scorer, optional assists use selected creator when credited, non-goal shots use selected shooter, saves use selected goalkeeper, blocked shots keep selected primary defender engine-local for the durable-context step, and obsolete standalone attribution helpers/tests were removed. | `pnpm --filter @game/engine run typecheck`; focused match-engine and player-stat Vitest tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` | Done | Durable match reports now preserve minimal causal actor context. | `MATCH_EVENT_SCHEMA_VERSION` is `7`; goal events may carry `creatorPlayerId` only when it is not already represented by scorer/assist, and block events may carry `primaryDefenderPlayerId`; `createMatchReport` copies these fields from engine-local events without recalculating. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine/player-stat Vitest tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` | Done | CLI fixture detail now renders durable causal context for goals and blocks. | Goal rows append compact `creator=<player>` when durable reports expose a non-duplicated creator; block rows append `defender=<player>` when durable reports expose the primary defender; base season output and fixture-only shape remain otherwise unchanged. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/README.md` | Done | Created the Phase 8 documentation path for the first managerial lever. | Phase 8 starts with a Phase 7 output review, then domain contracts, engine builder, season setup overrides, and CLI tactic/lineup inspection; UI, live match-day, player states, persistence, and management systems remain out of scope. | Documentation-only update; no code checks required |
| `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md` | Done | Phase 7 output accepted as coherent enough for tactic/lineup MVP. | No Phase 7 rework needed before domain tactic contracts; season leaders are plausible, `creator=` does not duplicate assists, `defender=` appears on block events, player stats align, and strict calibration passes. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` | Done | Added dependency-free selected-lineup and tactic setup contracts to domain. | `SelectedLineup` stores club ID plus ordered slot/player/role selections; `TacticSetup` stores five-step `mentality` plus 0-1 `pressing`, `directness`, `width`, and `risk`; helper constructors reject ambiguous lineup/tactic data and preserve serializable shape. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts`; `pnpm check` |
| `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` | Done | Added engine builder from selected lineup/tactic setup to current `MatchTeamContext`. | `buildTacticTeamContext` validates explicit required lineup size, available players, role-weight resolution, and domain setup contracts; selected slots become ordered `LineupSlot`s, strength uses existing `deriveTeamStrength`, and tactic distribution maps only `directness`, `pressing`, `width`, and `risk`. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts`; `pnpm check` |
| `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` | Done | `simulateSeason` can use explicit selected setup overrides while preserving default behavior. | Added ordered `setupOverrides` entries with self-contained lineup, tactic, players, role weights, and required lineup size; overrides call `buildTacticTeamContext`, duplicate/invalid overrides fail with `SimulateSeasonError`, and no-override CLI output remains unchanged. | `pnpm --filter @game/engine run typecheck`; focused engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` | Done | CLI can compare default season output against a deterministic selected lineup/tactic setup. | Added explicit `--setup-demo=pro01-attacking`; the CLI builds a PRO01 selected setup, changes slots `slot:08` and `slot:09` from `midfielder` to `attacker`, applies attacking tactic values through `simulateSeason.setupOverrides`, and prints setup context before season or fixture output. Default output remains unchanged without the flag. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; default season smoke; fixture smoke; setup-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/README.md` | Done | Created the Phase 9 documentation path for manual tactical switching. | Phase 9 starts by reviewing Phase 8 output, then adds saved demo tactic profiles, an explicit manual tactic-change contract, segmented fixture simulation, and CLI inspection for one user-declared switch. Automatic tactical decisions are explicitly out of scope. | Documentation-only update; no code checks required |
| `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md` | Done | Phase 8 output accepted as a technical baseline for manual tactical switching. | `--setup-demo=pro01-attacking` clearly proves setup overrides and prints selected club, tactic values, and role changes; its season-long downside is understood as a reason to add manager-selected profiles and switches, not as a blocker. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` | Done | CLI now supports three deterministic saved setup demos for PRO01. | `--setup-demo` accepts `pro01-balanced`, `pro01-attacking`, and `pro01-defensive`; balanced matches the default PRO01 setup, while attacking and defensive are explicit manager-selectable profiles for later manual switching. | CLI typecheck; focused CLI tests; `pnpm check`; default/profile smoke commands; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md` | Done | Engine now has a deterministic contract for explicit manual tactic changes by minute. | `buildManualTacticChangeSchedule` validates caller-declared side/minute/team-context changes, sorts by minute then home/away, rejects invalid minutes, missing team contexts, invalid sides, and duplicate side+minute pairs, and performs no simulation or automatic tactical decisions. | Engine typecheck; focused manual-tactic-change tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md` | Done | Engine can simulate one fixture with caller-declared manual tactic changes. | `simulateMatchWithManualTactics` delegates to `simulateMatch` when no changes are supplied, otherwise validates `ManualTacticChangeSchedule`, applies side contexts before their declared minute, reuses the same match RNG and `stepMatch`, and keeps report/player-stat compatibility. | Engine typecheck; focused manual-tactic/simulate-with-manual-tactics tests; `pnpm check`; default season smoke; fixture smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md` | Done | CLI can inspect one user-declared manual tactic switch for a requested fixture. | Added `--manual-tactic-switch=<minute>:<profile>` for fixture detail only. The CLI requires `--fixture` and `--setup-demo`, builds the target saved profile, re-simulates the requested fixture through `simulateMatchWithManualTactics` when PRO01 is involved, and prints an explicit profile timeline; if PRO01 is not playing, it reports that the switch does not apply and leaves the fixture unchanged. | CLI typecheck; focused CLI tests; `pnpm check`; default season smoke; fixture smoke; manual-switch smoke for non-applicable and applicable fixtures; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/README.md` | Done | Created the Phase 10 documentation path for the first cross-match player state. | Phase 10 starts by reviewing Phase 9 output, then adds pure fitness spend/recovery rules, bounded fitness strength impact, optional season fitness lifecycle, and CLI condition inspection. Form, morale, injuries, staff, training, and automatic rotation remain out of scope. | Documentation-only update; no code checks required |
| `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md` | Done | Phase 9 output accepted as a stable baseline for player fitness consequences. | Manual switch output clearly shows selected club, initial profile, switch minute, target profile, applicability, and profile timeline; no automatic tactical decision is implied. | Required Phase 10 review CLI commands passed; strict `calibration-v1` balance report passed |
| `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` | Done | Pure deterministic fitness spend/recovery helpers were added. | `DEFAULT_FITNESS_RULES` spends 8 fitness per match and recovers 5 fitness per calendar day, clamps to `0..100`, copy-on-writes player states, rejects missing states and duplicate ordered IDs, and does not wire into season or CLI output yet. | Engine typecheck; focused fitness tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` | Done | Low fitness can now lightly affect team strength through explicit curves. | Fake content exposes fitness curve bands `<=39:0.88`, `<=59:0.94`, `<=79:0.98`, `<=100:1.00`; CLI team-context builders pass the curve to `deriveTeamStrength`. All generated players still start at fitness 100, so default output is unchanged. | Content/engine/CLI typechecks; focused content/engine/CLI tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` | Done | `simulateSeason` can optionally carry deterministic fitness spend/recovery across the season. | `fitnessLifecycle` is opt-in; when supplied, the use-case copy-on-writes player states, recovers tracked players between fixture dates, spends fitness for starters after each fixture, recomputes team strength from current fitness, and returns `finalPlayerStates`. Default no-lifecycle output remains unchanged. | Engine typecheck; focused engine tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md` | Done | CLI can show deterministic PRO01 fitness consequences for the season. | Added explicit `--condition-demo=pro01-season`; it enables the optional season fitness lifecycle, keeps default output unchanged, prints lifecycle rules, the first selected-club fixture, post-match fitness, recovered fitness before the next selected fixture, selected club table impact, and final starter condition. | CLI/engine typechecks; focused CLI tests; `pnpm check`; default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/README.md` | Done | Created the Phase 11 documentation path for manual lineup rotation. | Phase 11 starts by reviewing Phase 10 output, then adds lineup demo profiles, an explicit fixture lineup override contract, season wiring, and CLI lineup/condition inspection. The user chooses who plays; automatic rotation is out of scope. | Documentation-only update; no code checks required |
| `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` | Done | Phase 10 condition output accepted as a baseline for manual lineup rotation. | Existing `--condition-demo=pro01-season` clearly shows selected club, lifecycle state, rules, first fixture, post-match fitness `92`, seven-day recovery to `100`, and final starter fitness `92`. | Default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` | Done | CLI can inspect deterministic PRO01 first-team and rotated lineup profiles without applying them to the season. | Fake content now generates 16 senior players per club while keeping the default 11-player lineup unchanged; `pro01-rotated` uses real reserves No12, No13, No15, and No16 and reports differences from the first team. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/CLI Vitest tests; `pnpm check`; default season smoke; `--lineup-demo=pro01-rotated` smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` | Done | Engine now accepts and validates explicit fixture lineup override input. | `SimulateSeasonFixtureLineupOverride` identifies fixture, club, ordered lineup slots, required size, player lookup, role weights, and optional state curves; `simulateSeason` validates duplicate overrides, missing fixtures/teams, wrong fixture club, and invalid lineup data without applying overrides yet. | Engine typecheck; focused `simulate-season` tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` | Done | `simulateSeason` now applies explicit fixture lineup overrides. | Overrides are indexed by fixture/club, apply only to the matching participant, preserve the club's existing tactic, rebuild strength from the selected lineup and current fitness states, include override players in season registrations, and spend fitness for the actual selected starters. | Engine typecheck; focused `simulate-season` tests; `pnpm check`; default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` | Done | CLI can inspect one explicit user-selected lineup override for one fixture. | `--lineup-demo=<profile>` remains available for profile-only inspection and, when combined with `--fixture=<fixtureId>`, applies the selected PRO01 lineup only if PRO01 plays that fixture; output shows applicability, selected starters, rested first-team players, expected fixture fitness impact, fixture events, and player stats for the actual starters. | CLI typecheck; focused CLI tests; `pnpm check`; default season smoke; condition-demo smoke; `--fixture=fixture:000006 --lineup-demo=pro01-rotated` smoke; strict `calibration-v1` balance report |
| `docs/steps/12-squad-selection-and-formation-core/README.md` | Done | Created the Phase 12 documentation path for squad selection and formation core. | Phase 12 consolidates Phases 08-11 into a real manager-facing squad/formation model: broad curated formation catalog, squad depth, position suitability, formation fit reporting, and CLI inspection of squad gaps and fit trade-offs without prescribing market actions. | Documentation-only update; no code checks required |
| `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md` | Done | Phase 11 outputs were reviewed and accepted before formation work. | CLI season output, PRO01 rotated fixture inspection, and `calibration-v1` strict balance still pass; Phase 12 can build on manual lineup rotation without code rework. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md` | Done | Curated domain formation catalog was added. | `domain/tactics` exposes 22 stable formation keys, structured formation slots, recognized position families, `FORMATION_CATALOG`, deterministic ordered `FORMATIONS`, and lookup/narrowing helpers; no player assignment or squad-fit logic was added. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/formations.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` | Done | Squad-depth domain contract was added. | `domain/squad` exposes explicit squad, starter, and bench/reserve player groups plus validation for duplicates, membership, overlap, and match starter count; it preserves user choice and does not select players automatically. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/squad/squad-depth.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` | Done | Player-position to formation-slot suitability was added. | `domain/tactics` exposes strict `natural`, `adapted`, `weak`, and `invalid` suitability evaluation from `PlayerPosition[]` to formation position families; weak fits do not count as real coverage, so squad gaps remain visible. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` | Done | Engine formation squad-fit reporting was added and later reworked to avoid market-prescriptive wording. | `engine/squad` reports slot coverage, uncovered/weak/adapted slots, natural fits, likely out-of-position players, family depth, broad extra-depth groups, and stable factual `squadFitHints` keys such as `gap:*`, `adapted_only:*`, and `extra_depth:*`; it does not assign players or recommend transfers. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` | Done | CLI formation-fit inspection was added and later reworded as factual squad assessment. | `simulate-season --formation-fit=<formationKey>` renders a standalone inspection for the selected fake club squad, including formation slots, covered/adapted/weak/missing slots, extra-depth groups, and localized squad-fit notes; fake clubs now generate 22 senior players while fixed default lineups stay 11 players. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/13-localization-foundation/README.md` | Done | Created and broadened the Phase 13 documentation path for localization foundation. | Phase 13 supports `it`, `en`, `de`, `es`, and `fr`, keeps English as fallback, covers all current CLI-visible game text rather than only formation-fit labels, adds enforcement against hardcoded presentation strings, and closes with project-wide policy alignment in requirements/rules. | Documentation-only update; no code checks required |
| `docs/steps/13-localization-foundation/01-phase-12-output-review.md` | Done | Current Phases 00-12 user-facing CLI text was inventoried before localization. | Localization scope covers command errors, doctor output, balance reports, season summaries, round/fixture detail, event words, player stats, tactic/setup/manual-switch output, condition/lineup output, formation-fit labels, warnings, and factual squad-fit notes; domain/engine keys remain structured data. | Source scan; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1` |
| `docs/steps/13-localization-foundation/02-language-contract-and-fallback.md` | Done | Added isolated localization package and supported-language contract. | `@game/i18n` defines supported languages `it/en/de/es/fr`, English fallback, parsing helpers, typed message keys, interpolation, and dependency isolation from simulation packages. | `pnpm --filter @game/i18n run typecheck`; focused i18n tests |
| `docs/steps/13-localization-foundation/03-label-catalog-it-en.md` | Done | Added the first English and Italian catalog for current CLI-visible presentation text. | The catalog covers common labels, CLI errors, doctor, balance report, season summary, fixture detail, event words, tactic/setup/manual-switch, condition, lineup, formation-fit, warnings, and factual squad-fit notes. | focused i18n tests |
| `docs/steps/13-localization-foundation/04-cli-language-option.md` | Done | Exposed CLI `--lang` and migrated current CLI presentation output through localization. | `simulate-season`, `balance-report`, `doctor`, and unknown-command output now render headings, labels, statuses, user-facing errors, event words, and formation-fit vocabulary through `@game/i18n`; simulation data and deterministic results stay unchanged. | CLI typecheck; focused CLI tests; localized CLI smokes |
| `docs/steps/13-localization-foundation/05-five-language-label-completion.md` | Done | Completed German, Spanish, and French labels for the current catalog. | All current message keys now have concrete `it`, `en`, `de`, `es`, and `fr` translations; English fallback remains available for future missing catalog entries. | focused i18n tests verify zero missing translations for all five languages |
| `docs/steps/13-localization-foundation/06-hardcoded-presentation-text-enforcement.md` | Done | Added a deterministic guard against new hardcoded CLI presentation text. | `scripts/check-localized-presentation-text.ts` scans current CLI output/error boundaries for direct user-facing string literals and `pnpm check` now runs `pnpm check:localized-text`. | `pnpm check:localized-text`; `pnpm check` |
| `docs/steps/13-localization-foundation/07-project-policy-localization-alignment.md` | Done | Requirements and project rules were verified as the binding localization policy. | `requirements.md` and `docs/PROJECT_RULES.md` state that labels useful to CLI/UI/event rendering/reports/statuses/warnings/hints/errors must be localization keys, while domain/engine keep language-agnostic structured data. | `rg -n "hardcoded|localizzazione|localization|user-facing|UI|CLI" requirements.md docs/PROJECT_RULES.md docs/PROJECT_STATUS.md`; `pnpm check` |
| `docs/steps/14-engine-audit-and-core-quality-review/README.md` | Done | Created the Phase 14 documentation path for complete engine/core audit before market or youth work. | Phase 14 is a non-feature audit gate with seven points: architecture boundaries, determinism, match engine, season engine, tactic/lineup/formation, code quality/dead code/naming, and final report/next-phase decision. | Documentation-only update; no source checks required |
| `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md` | Done | Package seams were audited. | Dependency Cruiser and import scans found no package-boundary violations; CLI remains the presentation/composition adapter and domain/engine remain language-agnostic. | `pnpm depcruise`; `pnpm lint`; forbidden import scans |
| `docs/steps/14-engine-audit-and-core-quality-review/02-determinism-audit.md` | Done | Determinism was audited. | Representative CLI outputs reproduce by seed and forbidden runtime scans found only acceptable storage metadata clock usage; engine has one cleanup finding for `Object.values()` in `simulateSeason`. | focused tests; CLI smokes; repeatability diff; forbidden runtime scan |
| `docs/steps/14-engine-audit-and-core-quality-review/03-match-engine-audit.md` | Done | Match engine was audited. | Current aggregate match engine, chance actors, durable reports, manual tactic segmentation, and player match stats are coherent for current scope; full possession chains remain accepted future scope. | domain/engine typecheck; focused match/player-stat tests; fixture smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/04-season-engine-audit.md` | Done | Season engine was audited. | Calendar, fixture application, table derivation, player summaries, fitness lifecycle, setup overrides, lineup overrides, and balance reporting are connected; `GameState` fixture consolidation remains a pre-persistence cleanup. | engine/simulation-tools typecheck; focused season/use-case tests; season/condition/lineup/balance smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/05-tactic-lineup-formation-audit.md` | Done | Manager-choice boundary was audited. | Tactics, lineups, formation catalog, position suitability, squad fit, setup demos, manual switches, and lineup rotation preserve explicit manager choice and avoid automatic lineup/tactic/market recommendations. | domain/engine/content/CLI typecheck; focused tactics/squad/CLI tests; Italian formation/setup/lineup smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/06-code-quality-dead-code-naming-audit.md` | Done | Code quality, naming, and dead-code risks were audited. | No dead attribution helpers or old hint keys remain; cleanup findings are stale CLI comments, large `simulate-season.ts` locality risk, and the engine `Object.values()` rule violation. | `pnpm lint`; `pnpm check:localized-text`; `pnpm typecheck`; text scans |
| `docs/steps/14-engine-audit-and-core-quality-review/07-audit-report-and-next-phase-decision.md` | Done | Final audit report was created. | `docs/audits/ENGINE_CORE_AUDIT.md` gives score `86/100`, no critical blockers, one high finding, medium/low findings, verified strengths, and recommends a narrow Phase 15 core cleanup before market/youth. | `pnpm check`; final CLI smokes; audit report review |
| `docs/steps/15-core-cleanup-before-career-systems/README.md` | Done | Created the Phase 15 documentation path for narrow cleanup before market/youth/career work. | Phase 15 closes Phase 14 findings: explicit fixture-lineup override order, factual squad-fit naming cleanup, CLI module split, fixture-state decision, and final cleanup report. | Documentation-only update; no source checks required |
| `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md` | Done | Confirmed all Phase 14 cleanup findings still exist before source cleanup starts. | Phase 15 remains scoped to cleanup: ordered fixture-lineup overrides, factual squad-fit naming, CLI module locality, fixture-state decision, and final report. | `rg` scans for object iteration, market wording, fixture state; `wc -l apps/cli/src/commands/simulate-season.ts` |
| `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md` | Done | Removed the engine `Object.values()` order risk from fixture lineup overrides. | `simulateSeason` now validates fixture lineup overrides into an internal `OrderedFixtureLineupOverrides` Module with `byKey` lookup plus caller-ordered `ordered` array; player registrations use the ordered array. | engine/CLI typecheck; focused engine/CLI tests; object-iteration scan; lineup override CLI smoke; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md` | Done | Removed stale market/recommendation wording from current squad-fit implementation comments. | Runtime output stays factual and unchanged; internal comments now describe formation-fit notes and factual coverage targets instead of market hints. | CLI typecheck; focused CLI tests; localized-text check; stale-wording scan; Italian formation-fit smoke; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md` | Done | Split the large CLI `simulate-season` implementation into private modules. | `runSimulateSeasonCommand` remains the public command Interface; profile keys, argument parsing, and formation-fit formatting moved behind private CLI Modules to improve locality without behavior changes. | CLI typecheck; focused CLI tests; required season/fixture/formation/manual-switch smokes; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md` | Done | Consolidated fixture state into the canonical `GameState` contract. | `GameState` now owns `fixtures` and `fixtureIds`; `applyMatchReportToFixture` accepts and returns `GameState` directly, and the obsolete fixture-slice/alias types were removed. | domain/engine/storage typecheck; focused domain/use-case/storage tests; required season and fixture CLI smokes; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md` | Done | Created the Phase 15 cleanup report and next-phase recommendation. | `docs/audits/CORE_CLEANUP_REPORT.md` scores the cleaned core at `92/100`, records all fixed findings, accepts the aggregate-match limitation, and originally recommended market MVP next; Phase 16 now adds a dependency-map gate before implementation. | `pnpm check`; required season/fixture/formation/manual-switch CLI smokes; `calibration-v1` strict balance report |
| `docs/steps/16-career-systems-dependency-map/README.md` | Done | Created the Phase 16 documentation path for mapping shared career-system dependencies before market implementation. | Phase 16 checks whether market can proceed linearly or needs shared career state, economy, calendar, scouting, or youth foundations first. | Documentation-only update; no source checks required |
| `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md` | Done | Market roadmap dependencies were classified before implementation. | `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` now marks which market phases can start now, which require career state/economy/calendar/scouting/prior market work, and where non-market shared phases should interrupt the roadmap. | `find docs/market-roadmap -type f | sort`; roadmap phase `rg`; dependency keyword `rg` |
| `docs/steps/16-career-systems-dependency-map/02-shared-career-state-seams.md` | Done | Shared career-state seams were mapped before market implementation. | `GameState` and `GameStorage` are enough for future persistence, while durable market behavior still needs an explicit career slice, roster ownership evolution, selected-club context, transfer history, and season progression seams. | `GameState`/storage `rg`; squad/tactic/state `rg`; career/save `rg` |
| `docs/steps/16-career-systems-dependency-map/03-economy-and-budget-dependencies.md` | Done | Economy and budget dependencies were mapped before market implementation. | `Money`/`BasisPoints` already exist; the first market MVP may use a narrow transfer-budget Interface, while wages, contracts, installments, future commitments, and full finances remain blocked for later phases. | Economy keyword `rg`; category/reputation `rg`; Money value-object scan |
| `docs/steps/16-career-systems-dependency-map/04-calendar-and-season-transition-dependencies.md` | Done | Calendar and season-transition dependencies were mapped before loans/windows/contracts. | Current `GameDate`, calendar, and fixture dates are enough for a narrow transfer MVP, but loans, windows, registration, contract expiry, promotion/relegation, and multi-season processing require dedicated calendar/season-transition Modules. | Calendar primitive `rg`; loan/window/registration/promotion `rg` |
| `docs/steps/16-career-systems-dependency-map/05-scouting-youth-and-market-overlap.md` | Done | Scouting, youth, and market information seams were mapped. | Market MVP may use true player data behind valuation/willingness Interfaces, but must not hardcode fog, visible potential ranges, youth ownership, loan development, ambition/personality, or presentation text. | Scouting/youth keyword `rg`; player truth data `rg` |
| `docs/steps/16-career-systems-dependency-map/06-phase-order-decision.md` | Done | Finalized the dependency map and next implementation phase decision. | `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` recommends `Phase 17 — Market MVP Permanent Transfers` next, constrained to in-memory permanent transfers with temporary transfer budget, no windows, truth-based player willingness, and no persistence/contracts/loans/scouting fog. | report existence check; required report-section `rg`; project-status `rg`; Phase README documentation-scan rule reviewed |
| `docs/steps/17-market-mvp-permanent-transfers/README.md` | Done | Created the Phase 17 documentation path for a constrained market MVP. | Phase 17 is permanent-transfer only, in-memory, manager-driven, truth-based for valuation/willingness, and explicitly excludes persistence, loans, wages/contracts, windows, scouting fog, AI, installments, and player exchanges. | Documentation-only update; no source checks required |
| `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md` | Done | Confirmed Phase 17 scope from Phase 16 before coding. | Phase 17 may proceed as a constrained, manager-driven, in-memory permanent-transfer MVP; persistence, loans, wages/contracts, windows, scouting fog, AI, installments, and player exchanges remain blocked for later documented phases. | dependency-map/roadmap `rg`; next-step existence check |
| `docs/steps/17-market-mvp-permanent-transfers/02-market-domain-contracts.md` | Done | Added dependency-free domain contracts for permanent transfers. | `domain` now exposes `MarketState`, `ClubTransferBudget`, `PermanentTransferIntent`, feasibility status, structured rejection reasons, `PermanentTransferPreview`, and small validators/helpers while staying free of future-only transfer branches. | domain typecheck; focused transfer entity tests; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/03-player-valuation-v1.md` | Done | Added deterministic true-data player valuation v1. | `engine/market` now exposes `derivePlayerValuation` with explicit config, `Money` output, current/potential ability averages, age/category/reputation/position multipliers, clamping, and focused tests; it does not use generated content or mutate state. | engine typecheck; focused player valuation tests; out-of-scope scan; `pnpm check`; runtime scan false-positive noted for `GameDate` naming |
| `docs/steps/17-market-mvp-permanent-transfers/04-player-willingness-v1.md` | Done | Added deterministic permanent-transfer willingness v1. | `engine/market` now exposes `derivePlayerWillingness`, rejecting unrealistic sporting/reputation downgrades for strong prime players while accepting plausible same-level or younger non-star moves; output is structured and language-agnostic. | engine typecheck; focused player willingness tests; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/05-transfer-feasibility-and-apply-preview.md` | Done | Combined ownership, temporary budget, valuation, and willingness into in-memory transfer feasibility and apply preview. | `engine/market` now exposes `evaluatePermanentTransfer` and `previewPermanentTransfer`, returning structured rejection reasons or copy-on-write `GameState`/`MarketState` previews without touching storage. | engine typecheck; focused transfer feasibility tests; no-storage scan; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/06-cli-market-inspection.md` | Done | Added localized CLI inspection for accepted and rejected permanent-transfer demos. | `simulate-season --market-demo=pro01-affordable-permanent|pro01-star-rejected` renders standalone localized market previews with selected club, buyer/seller, target player, transfer value, buyer budget before/after, reasons, willingness details, and roster preview; no career save is written. | CLI/i18n typecheck; focused CLI/i18n tests; localization guard; `pnpm check`; accepted/rejected/Italian CLI smokes |
| `docs/steps/17-market-mvp-permanent-transfers/07-phase-17-review-and-next-phase-decision.md` | Done | Finalized Phase 17 with a market MVP report and next-phase decision. | `docs/audits/MARKET_MVP_REPORT.md` documents implemented scope, demo outputs, kept boundaries, residual risks, and recommends career state and transfer persistence next. | `pnpm check`; season smoke; Italian formation-fit smoke; accepted/rejected/Italian market-demo smokes; strict calibration balance report; no-storage scan; out-of-scope scan |

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
- Phase 7 follows the roadmap gate rule: review current output before adding causal actor code.
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
- Match event schema version `3` adds structured shot context to durable shot outcome events: `shotType` and `chanceType` are enum-like keys derived without additional RNG consumption.
- Current structured shot context derivation is intentionally aggregate and minimal: it uses minute, side, opportunity quality, and attacking tactical distribution to label `open_play`, `counter`, or `cross`, and `normal` or `header`; it does not create set-piece systems, assists, goalkeeper attribution, or full duels.
- Match event schema version `4` adds optional `assistPlayerId` to durable goal events; current CLI output does not render assists yet, so `simulate-season --round=<number>` remains visually unchanged until `05-cli-match-detail-v2`.
- Assist attribution is optional and independent from the main match RNG; it uses `shotType`/`chanceType` for eligibility, excludes the scorer and goalkeepers, and does not change goals, scores, tables, or balance metrics.
- Match event schema version `5` adds `goalkeeperPlayerId` to durable save events; save attribution uses the defending side's explicit `roleKey: "gk"` lineup slot.
- Save attribution does not change shot outcomes, scores, tables, or balance metrics; it only enriches saved-shot events and fails clearly if a simulated team has no goalkeeper slot.
- `computePlayerMatchStats` derives match player stats only from durable `MatchReport` events; current per-player shots and shots on target are credited only for goals because non-goal shot events do not yet identify the shooter.
- Player match stats are exported from `@game/engine` so the CLI can render match detail without duplicating report parsing.
- `simulate-season --fixture=<fixtureId>` is the first structured match inspection command; use `--round=<number>` to discover fixture IDs, then `--fixture` to inspect one match's events and compact player stats.
- Phase 6 is a CLI/stat completeness phase: clean fixture-only output first, then shot taker attribution, complete current player match stats, clearer fixture player-stat rendering, and minimal season assist/save summaries.
- `simulate-season --fixture=<fixtureId>` now uses a fixture-focused output path and intentionally omits the final table/top-scorer season summary.
- Match event schema version `6` adds `shooterPlayerId` to generated non-goal durable shot events (`save`, `miss`, `block`); goal events intentionally do not duplicate it because `scorerPlayerId` is the shooter in the current aggregate model.
- Match event schema version `7` adds minimal durable causal context: optional non-duplicated `creatorPlayerId` on goals and optional `primaryDefenderPlayerId` on blocks; CLI fixture detail renders these as compact `creator=` and `defender=` fields when present.
- `computePlayerMatchStats` now derives complete current shot counts: goals count through `scorerPlayerId`, non-goal shot events count through `shooterPlayerId` when present, and save events also credit the defending goalkeeper.
- `simulate-season --fixture=<fixtureId>` now registers all home and away starters when rendering player stats, so zero-stat starters appear after contribution rows.
- `simulateSeason` now also returns `playerSummaryStats`, derived from durable reports and fixed-lineup registrations; current fields are goals, assists, and goalkeeper saves.
- Current `pnpm cli simulate-season --seed=demo-001` season summaries: top scorer `Player01 No06 (PRO01) - 15 goals`; top assist `Player02 No09 (PRO02) - 12 assists`; top goalkeeper saves `Player02 No01 (PRO02) - 94 saves`.
- Phase 7 now has an engine-local causal actor building block: `selectChanceActors` selects creator, shooter, primary defender, and goalkeeper without consuming the main match RNG.
- `stepMatch` now consumes that building block for player attribution only: scores, tables, opportunity counts, and balance metrics remain stable, while player-level goals/assists/shots can change for fixed seeds.
- The old standalone match-engine attribution helpers for scorer, assist, shot taker, and goalkeeper saves have been retired after `stepMatch` integration because they no longer had production callers; current attribution lives in `chance-actors.ts` plus the small assist-credit decision inside `step-match.ts`.
- Current `pnpm cli simulate-season --seed=demo-001` season summaries after causal actor integration: top scorer `Player05 No10 (PRO05) - 23 goals`; top assist `Player01 No06 (PRO01) - 11 assists`; top goalkeeper saves `Player02 No01 (PRO02) - 94 saves`.
- Phase 7 CLI fixture review is complete: `fixture:000001` shows creator context on unassisted goals, and `fixture:000002` shows defender context on a blocked shot.
- Phase 8 is documented as tactic and lineup MVP: review Phase 7 output first, then add selected-lineup/tactic contracts, engine setup builder, season setup overrides, and a minimal CLI inspection path.
- Phase 8 output review accepted Phase 7 output as a stable baseline: `fixture:000001` shows `creator=` on unassisted goals without duplicating assists, `fixture:000002` shows `defender=` on a block, player stats align with event rows, and `calibration-v1` strict mode still passes.
- Phase 8 domain contracts are dependency-free: selected lineups are ordered slot/player/role selections, tactic setup has a five-step `mentality` key plus bounded 0-1 `pressing`, `directness`, `width`, and `risk`; `mentality` is setup data only until a later step explicitly maps it to engine behavior.
- Phase 8 engine builder converts selected setup into current match-engine data only: `buildTacticTeamContext` validates size/player/role inputs, derives strength through existing role weights, maps the four existing tactic knobs, and keeps `mentality` as validated data with no independent match effect.
- Phase 8 season overrides are API-only so far: `simulateSeason.setupOverrides` accepts ordered self-contained setup overrides and preserves default output when omitted; CLI inspection is intentionally deferred to `05-cli-tactic-lineup-inspection`.
- Phase 9 is documented around manual manager intent: saved tactical profiles can be selected and later switched by an explicit minute command, while automatic tactical switching based on score/minute/context is out of scope.
- Phase 9 output review accepted Phase 8 as a technical baseline: `pro01-attacking` is useful as an explicit demo/manual tactic option, but it should not be treated as an optimized season-long tactic.
- Phase 9 saved setup demos now expose `pro01-balanced`, `pro01-attacking`, and `pro01-defensive` through one explicit CLI profile registry; these are user-selectable tactic options, not automatic score/minute decisions.
- Phase 9 manual tactic-change contract is engine-only and uses already-built `MatchTeamContext` values, so future segmented simulation can apply caller intent without importing content, CLI, or saved profile registries.
- Phase 9 segmented fixture simulation is wired to CLI fixture inspection only: `simulateMatchWithManualTactics` applies explicit scheduled team contexts by minute, delegates to `simulateMatch` for no-change compatibility, and remains caller-declared rather than automatic.
- `simulate-season --fixture=<fixtureId> --setup-demo=<initialProfile> --manual-tactic-switch=<minute>:<targetProfile>` is now the manual tactic switch inspection path. It shows the selected club inside the manual switch block, whether that club is actually playing the fixture, and the profile timeline.
- Phase 10 is documented around player fitness as the first dynamic cross-match state: pure spend/recovery rules first, bounded strength impact second, optional season lifecycle third, CLI condition inspection last.
- Phase 10 intentionally uses existing `PlayerDynamicState.fitness`; `form` and `morale` remain future systems even though the domain shape already includes them.
- Phase 11 is documented around manual lineup rotation: the user chooses who plays, while the engine and CLI apply and inspect explicit lineup choices without automatic rotation or recommendations.

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
- Phase 10 player dynamic states v1 is complete.
- Step 11/02 established that manual lineup rotation needs real reserve players in fake content; fake clubs now generate 16 senior players while default generated lineups remain 11 starters.
- Step 11/03 intentionally validated fixture lineup override input without applying it; Step 11/04 is responsible for using that contract during match context creation and fitness spend.
- Step 11/04 applies fixture lineup overrides inside `simulateSeason`; the default CLI season and condition-demo outputs remained unchanged because no CLI command passes fixture lineup overrides yet.
- Phase 11 manual lineup rotation v1 is complete. Manual lineup override inspection command to review: `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`.
- Phase 12 is now selected as squad selection and formation core before career persistence. It must make formation choice reveal squad-fit facts and trade-offs without auto-selecting players, recommending market actions, or executing transfers.
- When a future documented step lists `packages/domain/src/state/game-state.ts`, consolidate `fixtures` and `fixtureIds` into the base `GameState` contract instead of keeping them only as a use-case slice.
- Phase 12 squad selection and formation core is complete. Review command: `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`.
- Phase 12 formation-fit report was reworked after manual inspection: CLI slot rows now separate `natural`, `adapted`, and `weak` counts instead of a vague `candidates` total, and adapted-only DM/AM coverage now appears as factual weak-depth notes backed by `adapted_only:*` fit keys.
- Phase 13 is documented as localization foundation. The game supports five language codes (`it`, `en`, `de`, `es`, `fr`) with English fallback; domain/engine keys remain stable and language-agnostic, while CLI/UI presentation layers localize all user-facing text.
- `docs/PROJECT_RULES.md` now includes binding presentation/localization rules: user-facing headings, labels, event words, report metrics, statuses, warnings, hints, and user-facing errors must go through localization once Phase 13 introduces the layer.
- `requirements.md` Area 20 now states the same product rule: labels useful to UI or CLI must not be hardcoded in produced code and must pass through localization keys.
- Phase 14 is documented as a complete engine/core audit before market or youth. It has seven points: architecture boundaries, determinism, match engine, season engine, tactic/lineup/formation, code quality/dead code/naming, and audit report/next-phase decision.
- Phase 14 audit result: score `86/100`, no critical blockers. The current core is healthy, but Phase 15 should be a narrow cleanup/rework phase before market/youth: remove `Object.values()` from engine simulation order, rename stale market-hint comments, split the large CLI `simulate-season` module, and decide whether to consolidate fixtures into `GameState` before persistence/career state.
- Phase 15 is documented as `docs/steps/15-core-cleanup-before-career-systems/`: it closes the Phase 14 findings before market/youth and must end with `docs/audits/CORE_CLEANUP_REPORT.md`.
- Phase 15 core cleanup is complete. The cleaned core score is `92/100`; no critical or high cleanup blockers remain. Its original recommendation was market MVP next, but Phase 16 now inserts a dependency-map gate before market implementation.
- Market roadmap is documented in `docs/market-roadmap/`. The agreed scope removes sell-on percentages, appearance/goal bonuses, complex loan buy options/obligations, multiple-player exchanges, and highly legalistic clauses; it keeps one-player exchange and simple installments for a later structured-deals phase.
- Phase 16 is now a dependency-map phase, not market implementation. It exists to decide whether market MVP can proceed next or whether a shared career-state, economy, calendar, scouting, or youth foundation must come first.
- Phase 17 is documented as `docs/steps/17-market-mvp-permanent-transfers/`: a constrained in-memory permanent-transfer MVP. It must prove transfer contracts, valuation, willingness, feasibility/apply preview, and localized CLI inspection before any persistence, loans, contracts, wages, windows, scouting, AI, installments, or player exchanges.

### 2026-06-20 — Phase 15 core cleanup before career systems docs

- Step: `docs/steps/15-core-cleanup-before-career-systems/README.md`
- Status: Done
- Outcome: Created the Phase 15 cleanup specification and six executable step documents.
- Adopted solution: Phase 15 is a non-feature cleanup phase that fixes or documents Phase 14 risks before market/youth: ordered fixture-lineup overrides, factual squad-fit naming, CLI `simulate-season` module split, fixture-state decision, and final cleanup report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`

- Status: Done
- Outcome: Confirmed the Phase 14 findings are still current before changing source code.
- Adopted solution: Keep Phase 15 scoped as cleanup. The confirmed items are engine `Object.values()` in `simulateSeason`, stale CLI market wording around squad-fit notes, a 2685-line `simulate-season.ts` CLI module, and fixture state still living as a slice around `GameState`.
- Verification: `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src`; `rg -n "market|need|recommend|auto-select|automatic|best XI|best-XI" apps/cli/src packages apps docs/audits/ENGINE_CORE_AUDIT.md`; `wc -l apps/cli/src/commands/simulate-season.ts`; `rg -n "FixtureStateSlice|fixtureIds|fixturesById|fixtures" packages/domain/src packages/engine/src/use-cases`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`

- Status: Done
- Outcome: Removed the Phase 14 high finding from `simulateSeason`.
- Adopted solution: Fixture lineup overrides keep the public ordered-array caller interface, then become an internal `OrderedFixtureLineupOverrides` Module with `byKey` for fixture lookup and `ordered` for caller-order registration. No unordered object enumeration remains in the touched engine path.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts`; `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src/use-cases/simulate-season.ts`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`

- Status: Done
- Outcome: Removed stale market/recommendation wording from current formation-fit implementation comments.
- Adopted solution: Kept the runtime CLI output unchanged and factual; internal comments now describe stable formation-fit notes and factual coverage targets.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check:localized-text`; `rg -n "market hint|market-depth|market need|marketNeed|need:|consider:|surplus:" apps/cli/src packages/i18n/src`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`

- Status: Done
- Outcome: Improved CLI Module locality without changing command behavior.
- Adopted solution: `runSimulateSeasonCommand` stays as the public Interface in `apps/cli/src/commands/simulate-season.ts`; profile keys live in `simulate-season/profile-keys.ts`, argument parsing/validation in `simulate-season/parse-args.ts`, and formation-fit output in `simulate-season/formation-fit-output.ts`.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`

- Status: Done
- Outcome: Removed the temporary fixture-state slice before career persistence work.
- Adopted solution: `GameState` now owns fixture lookup and deterministic fixture ID order; `applyMatchReportToFixture` accepts and returns canonical `GameState`; the obsolete `FixtureStateSlice` and `ApplyMatchReportToFixtureState` exports were removed instead of kept as compatibility leftovers.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/domain/src packages/engine/src/use-cases packages/storage/src`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 15 and created the durable cleanup handoff report.
- Adopted solution: `docs/audits/CORE_CLEANUP_REPORT.md` records the Phase 15 fixes, scores the cleaned core at `92/100`, keeps the aggregate-match engine as an accepted limitation, and originally recommended market MVP before youth; Phase 16 now refines this with a dependency-map gate.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Superseded by Phase 16 dependency-map docs; execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-21 — Phase 17 market MVP permanent transfers docs

- Status: Done
- Outcome: Created `docs/steps/17-market-mvp-permanent-transfers/` after the Phase 16 dependency-map gate.
- Adopted solution: Phase 17 is a constrained in-memory permanent-transfer MVP: domain contracts, true-data valuation, player willingness, feasibility/apply preview, localized CLI inspection, and final report. Persistence, loans, contracts, wages, windows, scouting fog, AI, installments, and player exchanges remain out of scope.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md`.

### 2026-06-20 — Market roadmap planning

- Status: Done
- Outcome: Created the market-specific roadmap and individual phase overview documents.
- Adopted solution: `docs/market-roadmap/` now defines candidate market phases for permanent transfers, career persistence, loans, contracts/wages, scouting quality, AI club behavior, negotiation, transfer windows, structured deals, and market balance review. The plan deliberately removes sell-on percentages, appearance/goal bonuses, complex loan buy options/obligations, multiple-player exchanges, and highly legalistic clauses.
- Verification: Documentation-only update; no source checks required.
- Next action: Superseded by Phase 16 dependency-map docs; execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-20 — Phase 16 career systems dependency map docs

- Status: Done
- Outcome: Created `docs/steps/16-career-systems-dependency-map/` before opening market implementation.
- Adopted solution: Phase 16 is a dependency-map gate that will decide whether market MVP can proceed next or whether shared career state, economy, calendar, scouting, or youth foundations must be inserted first. This keeps `docs/steps/` linear instead of treating `docs/market-roadmap/` as a direct implementation order.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-20 — Phase 14 engine audit and core quality review

- Status: Done
- Outcome: Completed the seven-point engine/core audit and created `docs/audits/ENGINE_CORE_AUDIT.md`.
- Adopted solution: The project can continue after one focused cleanup phase. The audit found no critical blockers, one high determinism-discipline finding in `simulateSeason`, medium maintainability/state-model findings, and low naming/documentation issues.
- Verification: `pnpm depcruise`; `pnpm lint`; `pnpm check:localized-text`; `pnpm typecheck`; `pnpm test`; focused match/season/tactic/CLI tests; CLI smoke commands; deterministic repeatability diff; `pnpm check`.
- Next action: Create Phase 15 documentation for core cleanup before implementing market or youth.

### 2026-06-20 — Phase 14 engine audit and core quality review docs

- Status: Done
- Outcome: Created the Phase 14 audit documentation and made architecture boundary audit the active next step.
- Adopted solution: Phase 14 is a stop-and-review phase, not a feature phase. It will write `docs/audits/ENGINE_CORE_AUDIT.md`, score the current engine/core from `0` to `100`, classify findings, and decide whether to proceed to market, youth, or a focused core rework phase.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md`.

### 2026-06-20 — Phase 13 localization foundation

- Status: Done
- Outcome: Added `@game/i18n`, CLI `--lang` support, five-language current label coverage, localized current CLI presentation output, and a localized-text enforcement check.
- Adopted solution: Domain/engine continue emitting stable structured keys; CLI presentation maps those keys to localized labels in `it`, `en`, `de`, `es`, and `fr` with English fallback for future missing keys.
- Verification: `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/cli run typecheck`; focused i18n/CLI Vitest files; localized CLI smokes for Italian/German/French; `pnpm check:localized-text`; `pnpm check`.
- Next action: Phase 14 is now documented as engine audit and core quality review; execute the architecture boundary audit next.

### 2026-06-20 — Phase 12/13 squad-fit language rework

- Status: Done
- Outcome: Removed market-prescriptive wording from formation-fit output and localized additional enum-like values that were visible in CLI output.
- Adopted solution: Engine formation-fit report now exposes factual `squadFitHints` using `gap:*`, `adapted_only:*`, and `extra_depth:*`; CLI renders these as localized squad-fit notes, not market advice. Fixture event `shotType`/`chanceType`, setup mentality values, and lineup role keys now render through localization.
- Verification: focused engine/CLI/i18n tests; `pnpm check`; localized smoke commands for Italian fixture detail, Italian formation-fit, and Italian setup-demo output.
- Next action: Use Phase 14 for the complete engine/core audit before deciding market, youth, or focused rework.

### 2026-06-20 — `docs/steps/13-localization-foundation/README.md`

- Status: Done
- Outcome: Created and then broadened Phase 13 documentation and implementation step documents for localization foundation, including a final policy-alignment step.
- Adopted solution: Phase 13 now starts with a review of all user-facing CLI/source text created across Phases 00-12, including events, balance reports, season summaries, fixture detail, player stats, tactic/lineup/condition output, formation/squad-fit output, and user-facing errors. It then adds a supported-language/message-key contract, an `it/en` catalog, CLI `--lang` integration across current presentation output, `de/es/fr` completion, hardcoded-presentation-text enforcement, and final requirements/project-rules policy alignment. Domain/engine keys remain stable and untranslated.
- Rule update: Added project rules and requirements text requiring user-facing presentation text to go through localization once Phase 13 introduces it, while keeping domain/engine reports structured and language-agnostic.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/13-localization-foundation/01-phase-12-output-review.md` next; do not add localization code before reviewing the current user-facing text surface.

### 2026-06-20 — Phase 12 formation-fit report readability rework

- Status: Done
- Outcome: Improved the Phase 12 formation-fit CLI output so a user can distinguish true natural depth from adapted or weak cover.
- Adopted solution: Slot rows now render `best`, `natural`, `adapted`, and `weak` counts; engine fit hints now include `adapted_only:defensive_midfielder` and `adapted_only:attacking_midfielder` when those families are covered only by adapted players; the CLI renders those as factual weak-depth notes.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`.
- Follow-up: Re-run `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1` and verify that `rb` no longer looks like it has 10 natural candidates, while DM/AM adapted-only coverage is clearly visible.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md`

- Status: Done
- Outcome: Added a standalone CLI formation-fit inspection path and expanded fake senior squads to 22 players per club without changing the default fixed 11-player lineup.
- Adopted solution: `simulate-season --formation-fit=<formationKey>` builds a squad-depth snapshot for the selected generated club, runs the engine formation-fit report, and prints formation slots, covered slots, adapted/weak slots, missing slots, extra-depth groups, and localized squad-fit notes. The CLI explicitly states that no lineup is auto-selected and no transfer action is created.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Manually inspect `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; verify that adapted DM/AM slots and surplus wide/center-back hints are understandable before deciding Phase 13.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md`

- Status: Done
- Outcome: Added deterministic engine reporting for how a squad fits a selected formation.
- Adopted solution: `packages/engine/src/squad/formation-squad-fit.ts` consumes domain formation catalog data, squad depth, and player natural positions to report covered, adapted, weak, and uncovered slots plus family depth, likely out-of-position players, extra-depth groups, and stable factual `squadFitHints`. It does not assign players to slots or recommend transfers.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` next; keep default season simulation output unchanged.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md`

- Status: Done
- Outcome: Added strict deterministic suitability between player natural positions and formation slot requirements.
- Adopted solution: `packages/domain/src/tactics/position-suitability.ts` classifies fit as `natural`, `adapted`, `weak`, or `invalid`; full backs/wing backs, central midfield bands, wide players, and strikers have explicit non-equivalent adaptation rules so formation gaps remain visible.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` next; do not auto-select lineups.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md`

- Status: Done
- Outcome: Added a dependency-free squad-depth contract for explicit user-selected starters and bench/reserves.
- Adopted solution: `packages/domain/src/squad/squad-depth.ts` validates ordered squad, starter, and bench/reserve player IDs, rejects duplicates, membership errors, and starter/bench overlap, and keeps the exact eleven-starter rule in `validateMatchSquadDepth` so non-match squad inspection stays flexible.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/squad/squad-depth.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` next; do not build formation-fit reports yet.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md`

- Status: Done
- Outcome: Added a dependency-free domain formation catalog for the major professional shapes planned in Phase 12.
- Adopted solution: Formation data lives in `packages/domain/src/tactics/formations.ts` as stable keys, structured slots, broad departments, tactical lines, side/channel metadata, and recognized position-family requirements. The catalog is exported through `packages/domain/src/tactics/index.ts` and the root domain surface.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/formations.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` next; do not compute formation fit or assign players automatically.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/README.md`

- Status: Done
- Outcome: Created Phase 12 documentation and six implementation step documents for squad selection and formation core.
- Adopted solution: Phase 12 pauses career persistence work to consolidate the core manager loop around formation choice, squad depth, player-slot suitability, and squad-fit reporting. The formation catalog should cover common major-league shapes, while reports should expose coverage gaps, weak central roles, and extra-depth groups as structured data for manager interpretation.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md` next; do not add formation code before reviewing Phase 11 output.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/README.md`

- Status: Done
- Outcome: Created Phase 11 documentation and five implementation step documents for manual lineup rotation v1.
- Adopted solution: Phase 11 will first review completed Phase 10 condition output, then add deterministic PRO01 lineup demo profiles, an explicit fixture lineup override contract, season wiring for user-selected lineup overrides, and a CLI lineup/condition inspection path. The phase explicitly preserves the rule that the user chooses who plays; automatic rotation, fatigue-based recommendations, substitutions, injuries, form, morale, career mode, and UI remain out of scope.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` next; do not add lineup profiles before the Phase 10 output review is recorded.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md`

- Status: Done
- Outcome: Accepted Phase 10 condition output as a stable baseline for manual lineup rotation.
- Adopted solution: Existing `--condition-demo=pro01-season` output is clear enough to compare first-team and rotated selections later. It shows selected club `PRO01`, lifecycle enabled, match cost `8`, daily recovery `5`, first PRO01 fixture, post-match fitness `92`, seven-day recovery to `100`, and final starter fitness `92`.
- Verification: Direct Node 24 CLI smoke for `simulate-season --seed=demo-001`; direct Node 24 CLI smoke for `simulate-season --seed=demo-001 --condition-demo=pro01-season`; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` next; add profile selection/inspection but do not apply lineups to fixtures or seasons yet.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md`

- Status: Done
- Outcome: Added explicit PRO01 lineup demo inspection for `pro01-first-team` and `pro01-rotated`.
- Adopted solution: After user authorization, fake content now generates 16 senior players per club while keeping the default 11-player lineup unchanged; the rotated profile replaces four first-team slots with real deterministic reserves and remains inspection-only.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/content/src/generators/league-system.test.ts apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --lineup-demo=pro01-rotated`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` next; define the engine contract before applying lineup overrides.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md`

- Status: Done
- Outcome: Added the engine contract and validation path for explicit fixture lineup overrides.
- Adopted solution: `SimulateSeasonFixtureLineupOverride` is serializable caller intent for one fixture/club lineup; `simulateSeason` now validates duplicates, missing fixtures, missing teams, wrong fixture clubs, lineup size/slot/player shape, and role/player strength data while leaving actual application to the next step.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` next; apply the validated contract during fixture simulation and fitness spend.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md`

- Status: Done
- Outcome: Wired explicit fixture lineup overrides into season simulation.
- Adopted solution: `simulateSeason` indexes validated fixture/club overrides, applies the selected lineup only to the matching fixture participant, preserves existing tactic distribution, rebuilds strength from current fitness states when lifecycle is enabled, registers override players for season stats, and spends fitness for actual selected starters.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --condition-demo=pro01-season`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` next; expose one CLI inspection path without adding automatic rotation.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md`

- Status: Done
- Outcome: Added CLI fixture-level inspection for manually selected lineup profiles.
- Adopted solution: `--lineup-demo=<profile>` still supports profile-only inspection; when combined with `--fixture=<fixtureId>`, it applies the selected PRO01 lineup only if PRO01 plays the fixture, keeps non-applicable fixtures unchanged, prints selected starters, rested first-team players, expected per-fixture fitness impact, re-simulated fixture events, and player stats for actual starters.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --condition-demo=pro01-season`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Phase 11 is complete. Manually inspect `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`, especially selected starters, rested players, expected fitness impact, and player stats for actual starters.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/README.md`

- Status: Done
- Outcome: Created Phase 10 documentation and five implementation step documents for player dynamic states v1.
- Adopted solution: Phase 10 will first review the completed Phase 9 output, then add pure deterministic fitness spend/recovery helpers, bounded fitness strength impact through explicit multiplier curves, optional season fitness lifecycle, and a CLI condition inspection view. The phase uses existing `PlayerDynamicState.fitness` and explicitly excludes injuries, form, morale, staff, training, growth, automatic rotation, and career persistence.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md` next; do not add fitness rules before the Phase 9 output review is recorded.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md`

- Status: Done
- Outcome: Phase 9 output is good enough to build player fitness consequences on top of it.
- Adopted solution: Keep Phase 9 as the baseline. Default season output works, fixture-only output remains clean, non-applicable manual switches explicitly say `Applies to fixture: no`, applicable switches show `Selected club: PRO01`, initial/target profiles, switch minute, and timeline, and no output implies automatic tactical decisions.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` next; add pure fitness spend/recovery rules without touching season simulation or CLI output.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md`

- Status: Done
- Outcome: Added pure deterministic engine helpers for player fitness spend and recovery.
- Adopted solution: `packages/engine/src/player-state/fitness.ts` owns `DEFAULT_FITNESS_RULES` with match cost `8`, daily recovery `5`, and `0..100` clamps over existing `PlayerDynamicState.fitness`. Helpers copy-on-write the state lookup, update only explicitly ordered player IDs, reject missing states and duplicate IDs, and keep form/morale untouched.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/player-state/fitness.test.ts` passed 8 tests; `pnpm check` passed with 28 files and 203 tests; `pnpm cli simulate-season --seed=demo-001` preserved the current table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` next; use explicit multiplier curves and do not start season fitness lifecycle yet.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md`

- Status: Done
- Outcome: Fitness can now lightly affect team strength through explicit content-owned multiplier curves.
- Adopted solution: Fake content exposes `stateMultiplierCurves.fitness` with bands `<=39 => 0.88`, `<=59 => 0.94`, `<=79 => 0.98`, and `<=100 => 1.00`. CLI season and balance team-context builders pass those curves to `deriveTeamStrength`; since generated players start at fitness `100`, default season output and balance metrics remain unchanged.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/engine/CLI tests passed 42 tests; `pnpm check` passed with 29 files and 207 tests; `pnpm cli simulate-season --seed=demo-001` preserved the current table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` next; keep lifecycle optional and do not add CLI condition output yet.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`

- Status: Done
- Outcome: Added a deterministic CLI condition inspection path for PRO01.
- Adopted solution: `simulate-season --condition-demo=pro01-season` enables the optional season fitness lifecycle for inspection only. It keeps the default season output unchanged, rejects combination with `--round` or `--fixture`, prints the lifecycle rules, first PRO01 fixture, first-match fitness spend, recovery before the next selected fixture, final table impact, and final condition for all PRO01 starters.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests passed 28 tests; `pnpm check` passed with 29 files and 215 tests; direct Node 24 CLI smoke for default season passed; direct Node 24 CLI smoke for `--condition-demo=pro01-season` printed final PRO01 starter fitness `92`; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Phase 11 is now documented; use `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` as the next active step before adding lineup profiles.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md`

- Status: Done
- Outcome: Added optional deterministic season fitness lifecycle to `simulateSeason`.
- Adopted solution: `simulateSeason.fitnessLifecycle` carries a copy-on-write player-state lookup only when explicitly supplied. It recovers tracked players once between new fixture dates, spends fitness for both starting lineups after each fixture, rebuilds team strength from current player states plus explicit player/role/curve data, and returns `finalPlayerStates` for inspection. Default no-lifecycle season and balance outputs remain unchanged.
- Verification: `pnpm --filter @game/engine run typecheck`; focused engine tests passed 24 tests; `pnpm check` passed with 29 files and 212 tests; direct Node 24 CLI smoke for `simulate-season --seed=demo-001` preserved the current table; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Completed by `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`; the existing optional lifecycle is now visible through CLI inspection without rotation, injuries, form, morale, career mode, or UI.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md`

- Status: Done
- Outcome: Added CLI inspection for one explicit user-declared manual tactic switch in a requested fixture; reworked the output so the manual switch block also names the selected club.
- Adopted solution: `simulate-season --fixture=<fixtureId> --setup-demo=<initialProfile> --manual-tactic-switch=<minute>:<targetProfile>` now validates the switch input, requires fixture context and an initial setup profile, builds the target saved profile, and uses `simulateMatchWithManualTactics` only for the requested fixture. The `Manual tactic switch` section prints `Selected club: PRO01`, so it is clear which club the switch controls. If the selected club is not playing that fixture, the CLI reports `Applies to fixture: no` and preserves the original fixture detail; if it is playing, the CLI reports `Applies to fixture: yes`, prints a profile timeline, and renders the switched fixture report/player stats. No automatic score/minute decision, live session, pause/resume, substitution, or season-wide switching was added.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` passed 25 tests; `pnpm check` passed with 27 files and 195 tests; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Review the `fixture:000001` non-applicable example and the `fixture:000006` applicable example. If the inspection shape is acceptable, create Phase 10 documentation before implementing new features.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md`

- Status: Done
- Outcome: Added an engine-only segmented fixture simulation path for explicit manual tactic changes.
- Adopted solution: `simulateMatchWithManualTactics` delegates to existing `simulateMatch` when no manual changes are supplied. With changes, it validates the caller-supplied `ManualTacticChangeSchedule`, applies a side's already-built `MatchTeamContext` before the declared minute is stepped, reuses the same match RNG stream and `stepMatch`, and returns a normal `SimulateMatchResult` compatible with `createMatchReport` and `computePlayerMatchStats`. No CLI flags, live sessions, substitutions, or automatic tactic decisions were added.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/manual-tactic-change.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts` passed 14 tests; `pnpm check` passed with 27 files and 191 tests; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md` next; expose a fixture inspection command that builds an explicit switch schedule from saved demo profiles.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md`

- Status: Done
- Outcome: Added a minimal deterministic engine contract for explicit manager-declared tactic changes during a match.
- Adopted solution: `buildManualTacticChangeSchedule` accepts already-built `MatchTeamContext` values for `home` or `away`, validates that change minutes are within `1..minuteCount`, rejects duplicate side+minute pairs and missing team contexts, and returns changes sorted by minute then side. The contract records caller intent only; it does not inspect score, choose profiles, simulate segments, or make automatic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/manual-tactic-change.test.ts` passed 8 tests; `pnpm check` passed with 26 files and 185 tests; `pnpm cli simulate-season --seed=demo-001` preserved the default table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md` next; use the validated schedule to apply explicit context changes while preserving no-change behavior.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md`

- Status: Done
- Outcome: Added a small deterministic CLI registry of saved PRO01 tactic demo profiles.
- Adopted solution: `--setup-demo` now accepts `pro01-balanced`, `pro01-attacking`, and `pro01-defensive`. Balanced applies PRO01's base selected lineup/tactic and therefore matches the default season path; attacking keeps the existing advanced attacker role changes; defensive drops two attackers into midfield. All profiles route through `simulateSeason.setupOverrides` and remain explicit user-selected options, not automatic tactical behavior.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md` next; define the manual switch contract before any segmented fixture simulation.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/README.md`

- Status: Done
- Outcome: Created Phase 9 documentation and five implementation step documents for manual tactical switching.
- Adopted solution: Phase 9 will first review the completed Phase 8 output, then add a small saved-profile registry, an engine contract for explicit manual tactic changes, segmented fixture simulation, and CLI inspection for one declared switch such as `46:pro01-attacking`. The phase explicitly models manager choice and bans hidden automatic tactical AI.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md` next; do not add saved profiles or segmented match code before the review is recorded.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md`

- Status: Done
- Outcome: Phase 8 output is good enough to build manual tactical switching on top of it.
- Adopted solution: Keep Phase 8 as a technical baseline. The default season remains unchanged with `PRO01` first on 65 points; `--setup-demo=pro01-attacking` prints a clear PRO01 selected setup and changes the table with PRO01 sixth on 57 points; this downside is accepted as evidence that attacking should become a manager-selected profile/switch rather than an optimized full-season tactic.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. `pnpm check` was not run because no source or test files changed.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` next; add saved profile options without manual in-match switching yet.

### 2026-06-20 — `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md`

- Status: Done
- Outcome: Added the first CLI inspection path for a selected lineup/tactic setup.
- Adopted solution: `simulate-season --setup-demo=pro01-attacking` builds one deterministic PRO01 setup in the CLI, changes slots `slot:08` and `slot:09` from `midfielder` to `attacker`, applies tactic values `mentality=attacking`, `pressing=0.85`, `directness=0.75`, `width=0.80`, and `risk=0.70`, and passes the result through `simulateSeason.setupOverrides`. The command prints the applied setup before the final table or fixture detail; no flag means the default season and fixture outputs stay unchanged.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` passed 20 tests; `pnpm check` passed with 25 files and 176 tests; `pnpm cli simulate-season --seed=demo-001` preserved the default output with `PRO01` first on 65 points; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001` preserved fixture-only detail; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking` printed PRO01 setup context and changed the table with `PRO07` first on 64 points and `PRO01` sixth on 57 points; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: User should compare `pnpm cli simulate-season --seed=demo-001` with `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking` and decide whether Phase 8 is acceptable or needs a narrow rework before Phase 9 documentation.

### 2026-06-20 — `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md`

- Status: Done
- Outcome: `simulateSeason` now supports explicit selected setup overrides without changing default behavior.
- Adopted solution: Added ordered `SimulateSeasonSetupOverride` entries to `SimulateSeasonInput`. Each override carries `clubId`, selected lineup, tactic setup, required lineup size, players, role weights, and optional state data. The use-case builds override `MatchTeamContext`s once through `buildTacticTeamContext`, uses them for fixture simulation and player registrations, rejects duplicate overrides, and maps invalid selected setup to `SimulateSeasonError`.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/match-engine/tactic-team-context.test.ts` passed 20 tests; `pnpm check` passed with 25 files and 172 tests; `pnpm cli simulate-season --seed=demo-001` stayed on the existing default output with `PRO01` first on 65 points and `Player05 No10 (PRO05)` top scorer on 23 goals; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` next. CLI should call `simulateSeason.setupOverrides` for a deterministic demo setup and preserve default output when no tactic/lineup option is passed.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md`

- Status: Done
- Outcome: Added an engine builder that converts one selected lineup/tactic setup into an existing `MatchTeamContext`.
- Adopted solution: `buildTacticTeamContext` validates positive integer `requiredLineupSize`, exact selected lineup size, domain lineup/tactic contract errors, selected players against caller-supplied players, and role keys against caller-supplied role weights. It converts selected slots to ordered `LineupSlot`s, derives `TeamStrength` through existing `deriveTeamStrength`, and maps `directness`, `pressing`, `width`, and `risk` into `MatchTacticalDistributionInput`; `mentality` is validated but has no separate engine effect in this MVP.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts` passed 9 tests; `pnpm check` passed with 25 files and 167 tests.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` next. Season overrides should call `buildTacticTeamContext` and preserve default output when no override is supplied.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md`

- Status: Done
- Outcome: Added dependency-free selected-lineup and tactic setup contracts to `@game/domain`.
- Adopted solution: `SelectedLineup` stores one club ID and ordered `SelectedLineupSlot` entries with `slotKey`, `playerId`, and `roleKey`. `TacticSetup` stores a five-step `mentality` key and bounded 0-1 `pressing`, `directness`, `width`, and `risk` values. `createSelectedLineup`, `createTacticSetup`, `isTacticMentalityKey`, and `TacticContractError` provide the minimal runtime contract checks without importing engine/content/CLI.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts` passed 10 tests; `pnpm check` passed with 24 files and 158 tests.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` next. The builder should map `directness`, `pressing`, `width`, and `risk` into existing match context inputs, while treating `mentality` as validated setup data until a later documented step gives it a separate effect.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md`

- Status: Done
- Outcome: Accepted Phase 7 output as coherent enough to build the tactic/lineup MVP on top of it.
- Adopted solution: No Phase 7 rework is needed before domain tactic contracts. Base season leaders are plausible; fixture `fixture:000001` shows `creator=` only on unassisted goals; fixture `fixture:000002` shows `defender=` on a blocked shot; player stats still align with events.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. `pnpm check` was not run because no source/test files changed.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` next.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/README.md`

- Status: Done
- Outcome: Created Phase 8 documentation and five implementation step documents for tactic and lineup MVP work.
- Adopted solution: Phase 8 will first review the completed Phase 7 output, then add dependency-free selected-lineup/tactic contracts, an engine setup builder, season setup overrides, and a minimal CLI inspection path. The phase intentionally excludes UI, live match sessions, substitutions, player dynamic states, persistence, market/economy, and broader management systems.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md` next; do not add tactic or lineup code before the review is recorded.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md`

- Status: Done
- Outcome: CLI fixture detail now exposes the durable causal context added in schema v7.
- Adopted solution: Goal event lines append `creator=<player>` only when the durable report carries a non-duplicated creator, while block event lines append `defender=<player>` when the durable report carries the primary defender. The output stays structured and compact; no commentary prose, localization, mechanics, scoring, content, or balance tuning changed.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (16 tests); `pnpm check` (23 files, 148 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Phase 7 is complete. Review `fixture:000001` for `creator=` goal context and `fixture:000002` for `defender=` block context, then create Phase 8 docs before implementing more code.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md`

- Status: Done
- Outcome: Durable match reports now preserve the smallest useful causal actor context from the engine-local chance actors.
- Adopted solution: `MATCH_EVENT_SCHEMA_VERSION` is now `7`; `GoalMatchEvent` can carry `creatorPlayerId` only when the selected creator is not already represented by scorer or assist, and `BlockMatchEvent` can carry `primaryDefenderPlayerId`. `createMatchReport` copies those fields from `stepMatch` events without recalculating actor selection; CLI rendering is intentionally unchanged until the next step.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/season-engine/player-match-stats.test.ts` (41 tests); `pnpm check` (23 files, 147 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` next; render/review the new durable causal fields without adding new match semantics.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md`

- Status: Done
- Outcome: Wired causal chance actors into `stepMatch` attribution without changing aggregate match outcomes.
- Adopted solution: `stepMatch` now calls `selectChanceActors` once per generated opportunity after existing outcome resolution and shot context derivation. Goal scorer is the selected shooter; optional assist credits the selected creator when an independent assist decision passes and creator differs from shooter; save/miss/block shooter is the selected shooter; save goalkeeper is the selected goalkeeper; block events keep `primaryDefenderPlayerId` engine-local for the next durable-context step. The obsolete standalone attribution helpers/tests were removed because they had no remaining production callers. Durable report shape and `MATCH_EVENT_SCHEMA_VERSION` were not changed.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (42 tests); `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/season-engine/player-match-stats.test.ts packages/engine/src/season-engine/player-stats.test.ts` (15 tests); `pnpm check` (27 files, 163 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Observed output change: table and score outputs are stable, but player attribution changed. For `demo-001`, top scorer is now `Player05 No10 (PRO05) - 23 goals`; fixture `fixture:000001` remains `PRO04 5-0 PRO18`, with Player04 No10 scoring a hat-trick and assists credited to Player04 No08, Player04 No07, and Player04 No09.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` next; persist minimal causal context without adding CLI causal rendering yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md`

- Status: Done
- Outcome: Added a minimal deterministic engine-local selector for opportunity actors.
- Adopted solution: Created `packages/engine/src/match-engine/chance-actors.ts` with `ChanceActors` and `selectChanceActors`; actor selection uses a separate `chance-actors` RNG stream keyed by seed, fixture, minute, attacking side, pre-chance score, shot type, and chance type; creator/shooter come from attacking outfield players, primary defender comes from defending outfield players, and goalkeeper comes from the defending `roleKey: "gk"` slot.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts` (8 tests); `pnpm check` (27 files, 161 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md` next; wire the selector into engine-local stepping without changing durable report schema or CLI output yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md`

- Status: Done
- Outcome: Accepted the current Phase 6 CLI output as a coherent baseline for Phase 7 causal match-event work.
- Adopted solution: No pre-Phase-7 rework is needed. The base season output has plausible leaders, fixture `fixture:000001` renders as `PRO04 5-0 PRO18`, five goal rows match five PRO04 scorers, assists and goalkeeper saves line up with the event list, and the current lack of fuller causal context on non-goal events remains the intended Phase 7 improvement area.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. No source/test files changed, so `pnpm check` was not required by this review step.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` next; keep it engine-local and do not wire causal actors into `stepMatch` yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/README.md`

- Status: Done
- Outcome: Created Phase 7 documentation and five implementation step documents for match engine causal v1 work.
- Adopted solution: Phase 7 will first review current Phase 6 output, then introduce engine-local chance actors, wire them into `stepMatch`, promote minimal durable causal context, and render that context in CLI fixture detail; UI, storage, tactics, player states, live match-day, and management systems remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md` next; do not add causal actor code before the baseline review is recorded.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md`

- Status: Done
- Outcome: Season output now shows top assist provider and top goalkeeper by saves alongside the existing top scorer.
- Adopted solution: Extended `packages/engine/src/season-engine/player-stats.ts` with `computeSeasonPlayerSummaryStats`, derived only from durable `MatchReport` events and fixed-lineup registrations; `simulateSeason` exposes `playerSummaryStats`; CLI picks top assist/save rows from that engine-derived result.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts` (25 tests); `pnpm check` (26 files, 153 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Phase 6 is complete; create the next numbered docs step group before implementing more code.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md`

- Status: Done
- Outcome: Fixture detail now shows a clearer all-starter player-stat table.
- Adopted solution: `simulate-season --fixture=<fixtureId>` passes home and away fake-content lineup registrations into engine `computePlayerMatchStats`, keeps contribution sorting, and renders zero-stat starters at the bottom with stable lineup/player ordering.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (26 files, 151 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md` next; do not add extra player stats beyond current goals, assists, shots, shots on target, and saves.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md`

- Status: Done
- Outcome: Player match stats now count all current durable shot events that identify a shooter.
- Adopted solution: `computePlayerMatchStats` credits goal shots through `scorerPlayerId`, credits generated `save`, `miss`, and `block` shots through `shooterPlayerId` when present, uses `shot.isShotOnTarget` for shots on target, and still credits saves to the defending goalkeeper.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-match-stats.test.ts` (5 tests); `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (26 files, 151 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md` next; the fixture player-stat table now has more rows and can be rendered more clearly.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md`

- Status: Done
- Outcome: Added deterministic shooter attribution for generated non-goal shot events.
- Adopted solution: `attributeShotTaker` uses an independent `shot-attribution` RNG stream keyed by seed, fixture, minute, side, score, outcome, shot type, and chance type; `save`, `miss`, and `block` report events now carry `shooterPlayerId`, while goal events keep `scorerPlayerId` as their shooter field to avoid duplicate IDs.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/shot-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (38 tests); `pnpm check` (26 files, 150 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md` next; derive shots from `scorerPlayerId` for goals and `shooterPlayerId` for generated non-goal shot events.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md`

- Status: Done
- Outcome: Cleaned the fixture-detail CLI output so `--fixture=<fixtureId>` no longer prints the full season table.
- Adopted solution: `runSimulateSeasonCommand` now branches to a fixture-only renderer when `--fixture` is present; base season output and `--round=<number>` output continue using the season summary view.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (25 files, 142 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md` next; do not start stat completion until shooter IDs exist on durable shot events.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/README.md`

- Status: Done
- Outcome: Created Phase 6 documentation and five implementation step documents for cleaner CLI inspection and complete current stat derivation.
- Adopted solution: Phase 6 will proceed from `--fixture` output cleanup to shot taker attribution, complete player match stats, fixture player-stat rendering v2, and minimal season assist/save summaries; UI, storage browsing, live match-day, ratings, injuries, cards, and management systems remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md` next.

### 2026-06-19 — `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md`

- Status: Done
- Outcome: Added CLI structured match detail for one fixture.
- Adopted solution: Extended `simulate-season` with `--fixture=<fixtureId>`; the command reuses the existing single season simulation, renders durable report events in event order, includes optional assists, stable `shot`/`chance` keys, goalkeeper saves, misses, blocks, and compact player stats from `computePlayerMatchStats`.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (14 tests); `pnpm check` (25 files, 141 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; create the next numbered step group before implementing more code.

### 2026-06-19 — `docs/steps/05-match-event-detail/04-player-match-stats.md`

- Status: Done
- Outcome: Added deterministic per-player match-stat derivation from durable `MatchReport` events.
- Adopted solution: Created `computePlayerMatchStats` in `season-engine/player-match-stats.ts` and exported it from `@game/engine`; rows include goals, assists, known player shots, shots on target, and saves, support explicit zero-stat registrations, and sort by side/order or contribution with stable player ID tie-breakers.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-match-stats.test.ts packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts` (12 tests); `pnpm check` (25 files, 137 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` next; use `computePlayerMatchStats` from `@game/engine` instead of reparsing events in CLI.

### 2026-06-19 — `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md`

- Status: Done
- Outcome: Added deterministic goalkeeper attribution for saved-shot events.
- Adopted solution: Created `goalkeeper-attribution.ts` to pick the defending side's explicit `gk` lineup slot, copied `goalkeeperPlayerId` into engine-local save events and durable report save events, bumped `MATCH_EVENT_SCHEMA_VERSION` to `5`, and made missing goalkeeper slots fail with a clear error.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/goalkeeper-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (33 tests); `pnpm check` (24 files, 133 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/04-player-match-stats.md` next; save goalkeeper data exists in reports, but current CLI output does not render save details until the later CLI match-detail step.

### 2026-06-19 — `docs/steps/05-match-event-detail/02-assist-attribution.md`

- Status: Done
- Outcome: Added deterministic optional assist attribution for goal events.
- Adopted solution: Created `assist-attribution.ts` with an independent derived RNG stream; goal events now optionally carry `assistPlayerId`, durable reports copy the field without recalculation, and `MATCH_EVENT_SCHEMA_VERSION` is now `4`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/assist-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (32 tests); `pnpm check` (23 files, 127 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` next; current CLI output does not show assists until the later CLI match-detail step.

### 2026-06-19 — `docs/steps/05-match-event-detail/01-shot-event-contract.md`

- Status: Done
- Outcome: Added structured shot context to engine-local and durable match shot events.
- Adopted solution: `ShotContext` now carries `shotType` and `chanceType`; `stepMatch` derives those labels from existing aggregate inputs without consuming additional RNG, `createMatchReport` copies them into durable events, and `MATCH_EVENT_SCHEMA_VERSION` is now `3`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/season-engine/player-stats.test.ts` (28 tests); `pnpm check` (22 files, 120 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/02-assist-attribution.md` next; use the new structured shot context for assist eligibility, but do not change match outcomes.

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
