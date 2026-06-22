# Phase 32 - Youth Academy And Squad Pipeline V1

## Goal

Replace part of the artificial long-run squad refresh pressure with a believable youth-academy pipeline.

Phase 31 proved that senior squads can survive `250` worlds x `30` seasons, but the current refresh model still relies on generated external intake pools. Phase 32 introduces controlled youth rosters so clubs can promote, release, or lose young players over time without overpopulating the world.

## Product intent

- Make each club feel like it has a living academy, not only a first-team roster.
- Keep the user's control principle: the system may maintain AI club pipelines, but it must not auto-promote, auto-pick, or auto-sell the user's players as a hidden manager decision.
- Avoid youth-player inflation by defining explicit initial and annual intake bands before implementation.
- Support long careers where some academy players become useful, most become ordinary, and rare exceptions become meaningful stories.
- Preserve lower-division realism: a third-division academy may produce interesting prospects, but not a constant stream of first-division-ready stars.

## Initial numeric model

The first implementation should start conservative:

- First-team target size: `23..25`
- First-team minimum structural size: `18`
- Initial youth players per club: `8`
- Target youth players per club: `8..12`
- Annual youth intake per club: deterministic `2..4`
- Youth intake age: `15..17`
- Youth roster age range: `15..19`
- Youth exit boundary: end of season after age `19`, unless promoted or otherwise retained by an explicit rule
- Expected one-division active player range:
  - Senior: about `18 x 23..25 = 414..450`
  - Youth: about `18 x 8..12 = 144..216`
  - Total: about `558..666`

These numbers are deliberately lower than a full real-world academy model. They give enough story fuel without flooding reports, saves, future UI, or generation time.

## Step order

1. `01-phase-31-findings-and-youth-pipeline-spec.md`
2. `02-youth-academy-domain-contracts.md`
3. `03-initial-youth-roster-generation.md`
4. `04-seasonal-youth-intake.md`
5. `05-youth-aging-development-and-exits.md`
6. `06-youth-promotion-and-senior-pipeline.md`
7. `07-long-run-youth-metrics.md`
8. `08-cli-youth-academy-inspection.md`
9. `09-phase-32-gates-and-final-report.md`

## Phase constraints

- Do not implement UI.
- Do not implement scouting, staff, facilities, youth matches, contracts, salaries, or loans in this phase.
- Do not expose exact hidden potential as user-facing truth.
- Do not turn youth intake into guaranteed stars.
- Do not inflate the world with unlimited youth players.
- Do not auto-select the user's lineup, tactic, or market strategy.
- Do not auto-promote youth players for the user's selected club unless the step explicitly documents it as a non-committal preview.
- Preserve deterministic output by seed.
- Keep generated players fictional, role-coherent, and division-aware.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched domain/content/engine/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=50 --seasons=10 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`;
- `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`;
- if runtime is acceptable or runner parallelization exists, a larger explicit gate decided by the Phase 32 final report;
- `git diff --check`.

## Definition of Done

- Each club has a deterministic youth roster that remains bounded over time.
- Annual youth intake exists and does not overpopulate the world.
- Youth players age, develop, and leave/promote through explicit deterministic rules.
- Senior squad refresh can use youth promotions without hiding manager decisions for the user's club.
- Long-run reports expose senior/youth totals, min/avg/max youth sizes, youth intake, youth exits, youth promotions, and active-player totals.
- The final Phase 32 report decides whether the youth pipeline is credible enough to continue toward broader career simulation, market refinement, or UI exploration.
