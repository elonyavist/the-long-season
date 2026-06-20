# Core Cleanup Report

Date: 2026-06-20

Scope: Phase 15, `docs/steps/15-core-cleanup-before-career-systems/`.

## Executive Summary

Score after cleanup: 92 / 100

Phase 15 closed the cleanup items that Phase 14 identified before market or youth systems should start.

The current core is ready for the next feature phase. The most important improvements are:

- engine simulation no longer depends on unordered object enumeration for fixture lineup override registrations;
- current formation-fit naming is factual and no longer carries stale market/recommendation language;
- the large CLI `simulate-season` command was split into smaller private Modules while keeping the public command Interface stable;
- fixture lookup and deterministic fixture order now belong to the canonical `GameState`;
- obsolete fixture-slice compatibility types were removed instead of kept as dead code.

No critical or high cleanup blockers remain. The main accepted limitation is still product scope, not a cleanup blocker: the match engine is aggregate-first and not a full possession/duel engine.

Recommended next phase: Phase 16 market MVP.

Reason: Phase 12 already exposes factual squad-formation trade-offs. Market MVP is the natural next step because it can let the manager act on those facts manually, without automatic recommendations. Youth can follow once the senior squad and market loop exist.

## Step Outcomes

### 01. Phase 14 Findings Review

Finding addressed:

- Confirm whether Phase 14 cleanup findings were still valid before modifying code.

Files changed:

- `docs/PROJECT_STATUS.md`

Adopted solution:

- Kept Phase 15 scoped as cleanup only.
- Confirmed four actionable items:
  - engine `Object.values()` usage in `simulateSeason`;
  - stale market wording in current formation-fit comments;
  - overly large CLI `simulate-season` Module;
  - fixture state still modeled as a slice around `GameState`.

Verification result:

- `rg` scans confirmed object iteration, stale wording, and fixture-state slice locations.
- `wc -l apps/cli/src/commands/simulate-season.ts` confirmed the command Module was 2685 lines before split.

Remaining risk:

- None for this step. It was an audit confirmation step.

### 02. Ordered Fixture Lineup Overrides

Finding addressed:

- `simulateSeason` used `Object.values()` in an engine simulation path.

Files changed:

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`

Adopted solution:

- Kept the public fixture-lineup override input as an ordered caller array.
- Added an internal `OrderedFixtureLineupOverrides` Module with:
  - `byKey` for cheap fixture/club lookup;
  - `ordered` for deterministic caller-order registration.
- Player registrations now iterate the explicit ordered array.

Verification result:

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts`
- `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src/use-cases/simulate-season.ts`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm check`

Remaining risk:

- None for this finding. The unordered engine iteration was removed.

### 03. Squad-Fit Naming Cleanup

Finding addressed:

- Current implementation comments still used market/recommendation wording even though the user-facing output is factual and not an instruction to buy/sell.

Files changed:

- `apps/cli/src/commands/simulate-season.ts`
- `docs/PROJECT_STATUS.md`

Adopted solution:

- Kept runtime output unchanged.
- Renamed internal comments from market-oriented wording to formation-fit and factual coverage wording.

Verification result:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`
- `pnpm check:localized-text`
- `rg -n "market hint|market-depth|market need|marketNeed|need:|consider:|surplus:" apps/cli/src packages/i18n/src`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm check`

Remaining risk:

- None for current CLI output. Future market UI/CLI must still avoid presenting automatic recommendations unless a documented phase explicitly adds them.

### 04. CLI Simulate-Season Module Split

Finding addressed:

- `apps/cli/src/commands/simulate-season.ts` had become too broad and mixed parsing, profile keys, output formatting, orchestration, and localization presentation.

Files changed:

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season/profile-keys.ts`
- `apps/cli/src/commands/simulate-season/parse-args.ts`
- `apps/cli/src/commands/simulate-season/formation-fit-output.ts`
- `docs/PROJECT_STATUS.md`

Adopted solution:

- Kept `runSimulateSeasonCommand` as the public command Interface.
- Moved private responsibilities into focused CLI Modules:
  - profile constants and profile key types;
  - argument parsing and validation;
  - formation-fit presentation formatting.
- Reduced the main command file from 2685 lines to 1861 lines.

Verification result:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm check`

Remaining risk:

- The CLI command is still large. This is acceptable for Phase 15 because the public Interface is stable and the largest private concerns are now separated. Future market/youth CLI output should add new private Modules instead of expanding the main file again.

### 05. GameState Fixture Slice Decision

Finding addressed:

- Fixtures were already central to season/career state but lived outside base `GameState` through `FixtureStateSlice` and `ApplyMatchReportToFixtureState`.

Files changed:

- `packages/domain/src/state/game-state.ts`
- `packages/domain/src/state/game-state.test.ts`
- `packages/engine/src/use-cases/apply-match-report-to-fixture.ts`
- `packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/index.ts`
- `packages/storage/src/json-game-storage.test.ts`
- `docs/PROJECT_STATUS.md`

Adopted solution:

- Added `fixtures` and `fixtureIds` to `GameState`.
- Updated `applyMatchReportToFixture` to accept and return canonical `GameState`.
- Removed obsolete `FixtureStateSlice` and `ApplyMatchReportToFixtureState` exports instead of keeping compatibility leftovers.
- Updated minimal test states to include empty or focused fixture collections.

Verification result:

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm exec vitest run packages/domain/src packages/engine/src/use-cases packages/storage/src`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm check`

Remaining risk:

- No cleanup blocker remains. Career persistence can now build on one canonical state shape for fixtures.

## Final Verification

Final phase checks:

- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

Observed outcome:

- All final phase checks passed.
- `pnpm check` passed: lint, dependency rules, localized presentation text, 35 test files / 265 tests, and workspace typecheck.
- `pnpm cli simulate-season --seed=demo-001` passed and kept the expected deterministic final table with PRO01 first on 65 points.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it` passed and rendered Italian fixture detail with the rotated lineup.
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it` passed and rendered factual Italian formation-fit notes.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking` passed and showed the manual profile timeline.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, table points spread `47.950`, and all metrics inside target.

## Remaining Accepted Limitations

- The match engine remains aggregate-first. It is suitable for current market/youth MVP work, but not yet a full live match-day engine with possession chains, nominal duels, substitutions, cards, injuries, penalties, or advanced set pieces.
- The CLI is still the only interaction surface. This is acceptable because the project is still building deterministic core systems before UI.
- Market and youth systems do not exist yet. Phase 15 deliberately did not start them.

## Next Phase Recommendation

Proceed with Phase 16 market MVP.

Recommended Phase 16 intent:

- Let the manager inspect current squad/formation facts and manually choose market actions.
- Keep the game deterministic and offline.
- Do not auto-recommend signings.
- Do not execute hidden transfers.
- Start with simple market contracts, candidate/player availability, deterministic transfer execution, and CLI inspection.

Youth MVP should follow after the senior market loop exists, because youth intake and development need a squad/market context to become meaningful.
