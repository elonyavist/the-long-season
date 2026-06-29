# Career Advancement Use-Case Report

Date: 2026-06-25

Phase: `63-canonical-career-advancement-use-case`

Status: Complete

## Result

Phase 63 created one canonical season-advancement use-case for career state:

- Module: `packages/engine/src/career/advance-career-season.ts`
- Public function: `advanceCareerOneSeason`
- Export surface: `packages/engine/src/index.ts`

The use-case is now the single place where season refresh order is composed.
Adapters still own storage, generated content, CLI rendering, localization, and
batch orchestration.

## Public Interface

`advanceCareerOneSeason(input)` accepts:

- the current `CareerState`;
- the deterministic `worldSeed`;
- a mode:
  - `completedSeason` for durable rollover from a completed season;
  - `reportRefresh` for report-only multi-season advancement;
- adapter-owned table rules or next-season identifiers where needed;
- optional static or callback-generated senior/youth intake candidates;
- optional selected-club youth promotion protection.

It returns:

- the copied next `CareerState`;
- structured facts describing the advancement;
- warning keys that adapters can render or aggregate.

The engine does not write files, translate labels, render text, generate content,
or make hidden manager decisions.

## Canonical Order

The use-case applies career refresh in this order:

1. completed-season validation;
2. season archive, when in durable `completedSeason` mode;
3. senior player development;
4. senior player exits;
5. youth academy lifecycle;
6. youth intake;
7. youth promotion;
8. squad maintenance;
9. transfer turnover;
10. next calendar merge;
11. per-player state rollover.

This order is now covered by focused unit tests.

## Migrated Callers

- `apps/cli/src/commands/career/season-labs.ts`
  - `rolloverCareerSeason` now calls `advanceCareerOneSeason` in
    `completedSeason` mode.
  - `buildCareerDevelopmentReport` advances seven seasons through
    `reportRefresh` mode and derives examples from returned state deltas.
- `apps/cli/src/commands/ten-season-report/report-data.ts`
  - the report-only career refresh callback now calls
    `advanceCareerOneSeason` in `reportRefresh` mode;
  - report metrics are derived from structured facts instead of direct helper
    calls.

## Remaining Allowed Seams

- `progressNextCareerFixture` remains the fixture-level matchday advancement
  entry point. It is not a season rollover path.
- `runCareerLongRunSimulation` remains the batch loop that repeats season
  simulation and calls the supplied refresh callback. It does not own career
  refresh ordering.
- Content generation remains outside the engine. Adapters provide generated
  youth and senior intake candidates through explicit inputs or callbacks.

## Verification Summary

Required checks were run with Node 24:

- `pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts`
- `pnpm exec vitest run packages/simulation-tools/src/long-run/career-long-runner.test.ts`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm cli career --save=phase63-check --development-report`
- `pnpm cli ten-season-report --seed=phase63-world --seasons=10`
- `pnpm check`
- `git diff --check`
- `graphify update .`

Additional phase evidence:

- `docs/audits/CAREER_ADVANCEMENT_PATH_AUDIT.md`
- `docs/audits/CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md`
- `docs/audits/CAREER_ADVANCEMENT_NO_THIRD_PATH_REPORT.md`
- `docs/audits/CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md`

The 50-world/10-season smoke in
`CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md` passed with zero failed worlds and no
structural squad or youth-collapse failures. Remaining warning worlds are story
or monitor signals, not advancement-path failures.

## Residual Risks

- The use-case preserves existing behavior; it does not improve match
  consequences, morale, playing-time satisfaction, or form reactivity.
- Existing warning semantics still depend on the long-run gate thresholds
  created before this phase.
- Web integration is not implemented yet; Phase 63 only made the engine entry
  point safe for future web adapters.
- Content providers remain adapter-owned by design, so future adapters must keep
  using explicit provider callbacks instead of importing content into engine.

## Next Phase Recommendation

Recommended next phase:

`Phase 64 - Match Consequences And Player State Reactivity`

Reason:

career advancement is now centralized, so the next useful gameplay slice is to
make matches matter more across weeks: condition, readiness, form, morale, bench
pressure, and clear structured post-match consequences. This should build on
`advanceCareerOneSeason` and `progressNextCareerFixture`, not create another
advancement path.
