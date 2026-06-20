# Engine Core Audit

Date: 2026-06-20

Scope: Phases 00-13, with specific focus on the core introduced or expanded in Phases 08-13: tactics, selected lineups, manual tactical switches, player fitness, manual lineup rotation, formation fit, factual squad-fit notes, and localization.

## Executive Summary

Score: 86 / 100

The current project is solid enough to continue, but not directly into a large market or youth feature without one narrow cleanup/rework step first.

The core strengths are real: package dependency rules pass, deterministic checks pass, CLI smokes reproduce, the match/season pipelines are covered by focused tests, manager choice is respected, localization is enforced, and the current fixture/formation/lineup inspection output is understandable.

The main risks are not gameplay bugs today. They are maintainability and determinism discipline risks:

- `packages/engine/src/use-cases/simulate-season.ts` uses `Object.values()` in engine code while building player registrations for fixture lineup overrides. The observed output is currently stable because downstream player-stat rows sort deterministically, but the code violates the project determinism rule and should be fixed before adding more season-state complexity.
- `apps/cli/src/commands/simulate-season.ts` is now a very large presentation/composition module. The public interface is still small, but the implementation mixes argument parsing, demo profile construction, engine orchestration, localization formatting, fixture rendering, condition rendering, lineup rendering, tactic rendering, and formation-fit rendering. This is acceptable for the current CLI-only phase, but it should be deepened before CLI output grows again.
- `GameState` still does not own fixtures and fixture IDs directly; season simulation currently uses a slice around `GameState`. This is already known in `docs/PROJECT_STATUS.md` and should be addressed when persistence/career state starts.

Recommended next action: create a narrow Phase 15 core cleanup/rework phase before market or youth. After that, proceed to the market MVP rather than youth first, because Phase 12 already exposes factual squad-fit trade-offs that market can make actionable through explicit user decisions.

## Findings

### Critical

None found.

### High

1. Engine uses `Object.values()` in a simulation path.
   - File: `packages/engine/src/use-cases/simulate-season.ts:417`
   - Problem: `playerRegistrations()` iterates `Object.values(fixtureLineupOverrides)`. Project rules explicitly ban `Object.values()`, `Object.keys()`, and `Object.entries()` for order-sensitive simulation.
   - Impact: No current output mismatch was observed. Season player rows sort with deterministic tie-breakers, so this is not an active gameplay bug. It is still a rule violation in engine code and can become risky when fixture lineup overrides expand.
   - Recommendation: replace the record-only iteration with an explicit ordered fixture-lineup override list or ordered override keys derived from caller input order.

### Medium

1. `simulate-season` CLI module is carrying too many responsibilities.
   - File: `apps/cli/src/commands/simulate-season.ts`
   - Evidence: 2,685 lines; functions include `parseArgs`, `simulateSeasonForCli`, `formatFixtureOnlyOutput`, `formatSeasonOutput`, `formatFormationFitOutput`, `buildConditionDemo`, `buildLineupDemo`, `buildLineupFixtureInspection`, and `buildSetupDemo`.
   - Problem: The module has one useful external interface, but its implementation now mixes several presentation and composition concerns. This reduces locality for future CLI changes.
   - Recommendation: split into private CLI modules for parsing, demo profiles, season composition, fixture formatting, formation-fit formatting, and condition/lineup formatting. Keep `runSimulateSeasonCommand` as the small public interface.

2. Season state model still uses a fixture slice around `GameState`.
   - Files: `packages/engine/src/use-cases/apply-match-report-to-fixture.ts`, `packages/engine/src/use-cases/simulate-season.ts`, `packages/domain/src/state/game-state.ts`
   - Problem: Fixtures are central to season/career state but are not yet part of the base `GameState` contract.
   - Impact: Acceptable for CLI simulation, but persistence/career saves will need one canonical state shape.
   - Recommendation: consolidate fixtures and fixture IDs into `GameState` before career persistence or market state depends on completed fixture history.

3. Current match engine is credible but still aggregate.
   - Files: `packages/engine/src/match-engine/step-match.ts`, `packages/engine/src/match-engine/chance-actors.ts`, `packages/engine/src/match-engine/occasion-resolver.ts`
   - Problem: Actors are selected coherently, but the engine still resolves an aggregate opportunity rather than a full possession or duel chain.
   - Impact: Acceptable current scope. Market and youth can rely on player quality affecting strength and event attribution, but future match-day depth will need nominal duels, substitutions, cards, injuries, and set pieces.
   - Recommendation: keep this as an accepted limitation until a dedicated match-day phase.

### Low

1. Stale CLI comment wording still says market.
   - File: `apps/cli/src/commands/simulate-season.ts:1553`
   - File: `apps/cli/src/commands/simulate-season.ts:1574`
   - Problem: Comments say `market hint` and `market-depth target` even though the current implementation intentionally renders factual squad-fit notes.
   - Impact: No runtime behavior issue. Naming drift can confuse future contributors.
   - Recommendation: rename comments in the cleanup phase.

2. Phase 14 audit docs had two check-command issues and were corrected during this phase.
   - File: `docs/steps/14-engine-audit-and-core-quality-review/03-match-engine-audit.md`
   - File: `docs/steps/14-engine-audit-and-core-quality-review/06-code-quality-dead-code-naming-audit.md`
   - Problem: One command referenced a missing `packages/engine/src/player-stats` path; one scanner regex was fragile.
   - Resolution: Documentation commands were corrected to current paths and a simpler valid regex.

## Verified Strengths

- Package dependency rules are enforced and currently pass.
- Domain remains dependency-free.
- Engine imports only domain/shared at package level.
- Domain and engine do not import localization.
- Content does not import engine.
- CLI imports i18n and owns current presentation rendering.
- Localization covers current CLI-visible text in `it`, `en`, `de`, `es`, and `fr`.
- Hardcoded presentation text enforcement passes.
- Match report events are structured and language-agnostic.
- Manager-choice boundary is respected:
  - no automatic best-XI selection;
  - no automatic lineup rotation;
  - no automatic tactical switch by score/minute;
  - no market action or hidden signing recommendation.
- Current balance profile passes strict mode.
- Representative CLI outputs are deterministic for the same seed.

## 1. Architecture Boundary Audit

Status: Pass with one maintainability watch.

Checks run:

- `pnpm depcruise`: pass, no dependency violations found across 111 modules and 351 dependencies.
- `pnpm lint`: pass.
- `rg -n "from \"@game/(content|storage|i18n|simulation-tools|cli)" packages/domain packages/shared packages/engine`: no matches.
- `rg -n "from \"@game/(engine|content|storage|simulation-tools|cli)" packages/domain packages/shared`: no matches.
- `rg -n "from \"@game/i18n" packages/domain packages/shared packages/engine packages/content packages/simulation-tools`: no matches.

Assessment:

- Package seams are still clean.
- `@game/i18n` is isolated from simulation packages.
- `apps/cli` is correctly the outer composition and presentation adapter.
- `@game/engine` exposes many useful modules through its package root, but no accidental package-boundary violation was found.

Architecture finding:

- The CLI `simulate-season` module is the largest pressure point. It is not a dependency violation, but it should be split into smaller private modules before adding market/youth CLI surfaces.

## 2. Determinism Audit

Status: Pass with one engine-rule rework required.

Checks run:

- `pnpm lint`: pass.
- `pnpm exec vitest run packages/shared/src packages/engine/src packages/content/src apps/cli/src`: pass, 23 files and 209 tests.
- `pnpm cli simulate-season --seed=demo-001`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`: pass.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`: pass.
- Repeated `pnpm cli simulate-season --seed=demo-001` output diff: pass, no diff.
- `rg -n "Math\\.random|new Date\\(|Date\\.now|Intl\\.|toLocale" packages apps scripts`: only storage real-clock metadata found.

Assessment:

- Engine RNG streams are consistently derived from seed plus stable stream names and key parts.
- Storage uses `new Date().toISOString()` for save metadata only, outside engine. This is acceptable and not game-time simulation.
- The main deterministic weakness is not observed output drift, but `Object.values()` in engine code.

Finding:

- See High finding: `Object.values(fixtureLineupOverrides)` in `simulateSeason`.

## 3. Match Engine Audit

Status: Pass for current scope.

Checks run:

- `pnpm --filter @game/domain run typecheck`: pass.
- `pnpm --filter @game/engine run typecheck`: pass.
- `pnpm exec vitest run packages/engine/src/match-engine packages/engine/src/season-engine/player-match-stats.test.ts`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=it`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`: pass.
- `rg -n "attributeGoal|attributeAssist|attributeShot|attributeGoalkeeper|TODO|FIXME|compat|legacy" packages/engine/src/match-engine packages/engine/src/season-engine`: no obsolete attribution helpers found; compatibility wording appears only in current compatibility tests/comments.

Assessment:

- `stepMatch` uses one coherent `ChanceActors` selection for creator, shooter, primary defender, and goalkeeper.
- Durable `MatchReport` schema version is `7`, and current CLI player stats derive from durable report events.
- `simulateMatchWithManualTactics` applies caller-declared side contexts by minute and delegates no-change cases to `simulateMatch`.
- Current limitations are explicit and acceptable: no possession chains, no substitutions, no injuries, no cards, no penalties, and no detailed set-piece system.

Accepted limitation:

- The match engine is still aggregate-first. This is good enough for market/youth MVP work, because player ability, team strength, tactics, and lineup choice already affect results and event attribution. It is not yet enough for a rich live match-day phase.

## 4. Season Engine Audit

Status: Pass with state-model cleanup needed before persistence/career.

Checks run:

- `pnpm --filter @game/engine run typecheck`: pass.
- `pnpm --filter @game/simulation-tools run typecheck`: pass.
- `pnpm exec vitest run packages/engine/src/season-engine packages/engine/src/use-cases packages/simulation-tools/src`: pass, 7 files and 56 tests.
- `pnpm cli simulate-season --seed=demo-001`: pass.
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`: pass.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`: pass.

Assessment:

- Calendar, fixture application, league table, season stats, balance report, and fitness lifecycle are connected coherently.
- Default behavior remains stable when optional fitness/setup/lineup overrides are absent.
- Player summaries are derived from durable match reports, not recomputed in CLI.

Finding:

- `GameState` should own fixtures/fixture IDs before career persistence. Today this remains a slice-level workaround in `ApplyMatchReportToFixtureState`.

## 5. Tactic Lineup Formation Audit

Status: Pass.

Checks run:

- `pnpm --filter @game/domain run typecheck`: pass.
- `pnpm --filter @game/engine run typecheck`: pass.
- `pnpm --filter @game/content run typecheck`: pass.
- `pnpm --filter @game/cli run typecheck`: pass.
- `pnpm exec vitest run packages/domain/src/tactics packages/domain/src/squad packages/engine/src/squad apps/cli/src/commands/simulate-season.test.ts`: pass, 5 files and 62 tests.
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`: pass.
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking --lang=it`: covered by focused CLI tests and previous smoke history; final full smoke should remain part of future rework checks.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`: pass.
- `rg -n "market|need|recommend|auto-select|automatic|best XI|best-XI" packages apps docs/steps/12-squad-selection-and-formation-core docs/steps/13-localization-foundation`: found expected historical docs/test text and stale CLI comments, but no user-facing market recommendation path.

Assessment:

- Formation catalog covers 22 curated formations, more than the 12-15 minimum in requirements.
- Suitability categories are strict enough to expose trade-offs: natural, adapted, weak, invalid.
- Formation fit output is factual: coverage, adapted-only slots, missing slots, extra-depth groups.
- CLI explicitly says inspection does not auto-select a lineup or create market action.

Finding:

- Stale source comments still refer to market hints. Runtime output is correct, but comments should be renamed.

## 6. Code Quality, Dead Code, And Naming Audit

Status: Pass with cleanup recommendations.

Checks run:

- `pnpm lint`: pass.
- `pnpm check:localized-text`: pass.
- `pnpm typecheck`: pass.
- `rg -n "TODO|FIXME|legacy|compat|deprecated|temporary|remove later|dead code" packages apps scripts docs`: no active TODO/FIXME found in source; compatibility wording appears in intentional tests/docs/comments.
- `rg -n "marketNeedHints|need:|consider:|surplus:" packages apps docs`: no source matches after the Phase 12/13 rework; only the Phase 14 audit scanner command itself references the old keys.
- `rg -n '"[A-Z][^"]{8,}"' apps/cli/src packages/i18n/src scripts`: noisy by design; current hardcoded presentation enforcement passes.

Assessment:

- No dead attribution helpers remain after the causal actor refactor.
- Public files have useful TSDoc/JSDoc.
- Localization enforcement exists and passes.
- The most important code-quality issue is module size/locality in CLI, not dead code.

Recommended cleanup:

- Replace stale comments around formation fit notes.
- Split `simulate-season.ts` into private CLI modules.
- Replace `Object.values()` in engine.

## 7. Audit Report And Next Phase Decision

Decision: create a narrow core cleanup phase before market or youth.

Recommended Phase 15: Core Cleanup Before Career Systems.

Suggested scope:

1. Remove `Object.values()` from `simulateSeason` and preserve explicit fixture-lineup override order.
2. Rename stale `market hint` / `market-depth` comments to factual `squad fit note` wording.
3. Split `apps/cli/src/commands/simulate-season.ts` into private modules without changing output:
   - argument parsing;
   - demo profile builders;
   - season simulation composition;
   - fixture formatter;
   - formation-fit formatter;
   - condition/lineup formatter.
4. Decide whether `GameState` should absorb fixtures now or wait until persistence/career save steps. If market/youth will need durable season history, do it before those phases.

After that cleanup, the next feature phase should be Minimal Transfer Market MVP before Youth. Reason: the current formation-fit system already creates visible squad-shape pressure. Market is the immediate explicit manager action that lets the user respond to those facts. Youth is still important, but it becomes more meaningful once the senior squad and market action loop exists.

## Checks Summary

Passed:

- `pnpm depcruise`
- `pnpm lint`
- `pnpm check:localized-text`
- `pnpm typecheck`
- `pnpm test`
- `pnpm exec vitest run packages/shared/src packages/engine/src packages/content/src apps/cli/src`
- `pnpm exec vitest run packages/engine/src/match-engine packages/engine/src/season-engine/player-match-stats.test.ts`
- `pnpm exec vitest run packages/engine/src/season-engine packages/engine/src/use-cases packages/simulation-tools/src`
- `pnpm exec vitest run packages/domain/src/tactics packages/domain/src/squad packages/engine/src/squad apps/cli/src/commands/simulate-season.test.ts`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- repeated `pnpm cli simulate-season --seed=demo-001` output diff.

Final full gate:

- `pnpm check`: pass.

## Manual Inspection Commands

Inspect these before approving the next feature phase:

```sh
pnpm cli simulate-season --seed=demo-001
pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=it
pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it
pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking
pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```
