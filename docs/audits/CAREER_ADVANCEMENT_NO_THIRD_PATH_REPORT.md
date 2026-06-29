# Career Advancement No-Third-Path Report

Date: 2026-06-25
Phase: `63-canonical-career-advancement-use-case`
Step: `07-regression-command-pack-and-no-third-path-check.md`

## Result

PASS. The project now has one canonical season-advancement use-case:

- `packages/engine/src/career/advance-career-season.ts`
- `advanceCareerOneSeason(...)`

CLI career rollover, CLI development report, and ten-season/long-run report
refresh now call this Module instead of owning the season advancement order.

## Search Evidence

The broad required search was run:

```sh
rg -n "develop|exit|youth|promotion|maintenance|turnover|rollover|advanceCareer" apps packages
```

That broad search is intentionally noisy because it matches labels, tests,
i18n keys, command names, and helper docs.

A focused advancement-helper scan shows the current real call sites:

```sh
rg -n "developPlayersForSeason|applyEndOfSeasonPlayerExits|applyYouthAcademyLifecycle|applySeasonalYouthIntake|promoteYouthCandidatesToSeniorSquads|maintainCareerSquadShape|simulateTransferTurnover|rolloverPlayersForNextSeason|advanceCareerOneSeason" apps/cli/src packages/simulation-tools/src packages/engine/src -g "*.ts"
```

## Remaining Direct Calls

| Location | Classification | Reason |
|---|---|---|
| `packages/engine/src/career/advance-career-season.ts` | Canonical path | This is the only Module that composes the full season advancement order. |
| `apps/cli/src/commands/career/season-labs.ts` | Adapter call to canonical path | `rolloverCareerSeason` and `buildCareerDevelopmentReport` call `advanceCareerOneSeason`. |
| `apps/cli/src/commands/ten-season-report/report-data.ts` | Adapter call to canonical path | Long-run report refresh calls `advanceCareerOneSeason` and derives metrics from facts. |
| `packages/simulation-tools/src/long-run/career-long-runner.ts` | Allowed batch-loop seam | Owns loop sequencing only; refresh rules are provided by the app callback. |
| `packages/engine/src/career/*test.ts` | Allowed unit-test seam | Focused tests still call lower-level engine helpers directly. |
| `packages/engine/src/career/youth-lifecycle.ts` | Allowed lower-level Module | Youth lifecycle internally develops youth players; it is called by the canonical path. |
| `packages/engine/src/index.ts` | Allowed public exports | Lower-level helper exports remain for focused tests and future narrow tools. |
| `apps/cli/src/commands/career/progression.ts` | Allowed fixture-level seam | Current-fixture progression is not season rollover; it owns matchday execution/preparation consequences. |

## Fixed Duplicate Paths

Previously duplicated season orchestration:

- `apps/cli/src/commands/career/season-labs.ts`
  - no longer owns archive/calendar/player-state rollover order;
  - no longer calls player development directly for development reports.
- `apps/cli/src/commands/ten-season-report/report-data.ts`
  - no longer calls development, exits, youth lifecycle, youth intake,
    promotion, squad maintenance, or transfer turnover directly;
  - now uses Adapter-owned candidate providers so content stays outside engine
    while the ordering stays inside `advanceCareerOneSeason`.

## Long-Run Smoke

Command:

```sh
pnpm cli ten-season-report --seed-prefix=phase63-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md
```

Result:

- Status: PASS
- Worlds: 50
- Seasons: 500
- Failed worlds: 0
- Warning worlds: 13
- Structural failures: none
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Youth roster max observed: 11
- Clubs above youth target: 0
- Clubs below youth minimum: 0

Warnings were story signals (`champion_streak`, `table_points_spread_avg`), not
career-structure failures.

## Residual Risks

- The lower-level engine helper exports remain public because existing focused
  tests and narrow tools use them. This is acceptable, but future adapters must
  not compose them into another season advancement pipeline.
- `apps/cli/src/commands/career/progression.ts` remains a separate fixture-level
  progression seam. It should not be folded into season rollover until a future
  matchday/continue phase defines the full daily advancement loop.
- The canonical Module now supports candidate-provider callbacks. These should
  stay deterministic and content-only; they must not contain gameplay ordering.

## Decision

No third season advancement path remains in adapters. Phase 63 can proceed to
the final report.
