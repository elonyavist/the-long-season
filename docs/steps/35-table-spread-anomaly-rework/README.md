# Phase 35 - Table Spread Anomaly Rework

## Goal

Resolve the remaining long-run gate blocker after Phase 34: rare worlds where
league tables become too compressed over multi-season simulation.

Phase 34 fixed the targeted creator-concentration issue. Its 50 worlds x 10
seasons smoke gate has no failing creator/assist concentration checks, but it
still fails because two worlds have low `table_points_spread_avg`:

- `phase34-concentration-world-00003`: `29.1`;
- `phase34-concentration-world-00040`: `29.7`.

This phase must treat the issue as a table-competitiveness anomaly, not as a
reason to widen thresholds or undo the match-event concentration rework.

## Product intent

The game should produce credible long-run league tables:

- strong teams should usually separate from weak teams over a 34-match season;
- some tight leagues are acceptable and interesting;
- repeated overly compressed tables across seasons should be rare;
- long-run turnover, development, youth, and transfers must not flatten every
  club into the same strength band;
- the fix must preserve scoring balance and the credible player-generation
  model built in Phases 33 and 34.

## Context

Current evidence:

- `calibration-v1` strict balance passes.
- `phase33-generation-world-00173` no longer fails creator concentration.
- Phase 34 smoke gate fails only on `table_points_spread_avg`.
- The two failing worlds still have healthy squad sizes, youth counts, natural
  goalkeepers, and creator concentration values.

The likely sources to audit are:

- team-strength spread after development/turnover;
- club strength hierarchy preservation across seasons;
- lower-table and upper-table point distribution;
- draw/upset patterns in compressed worlds;
- whether the current report exposes enough evidence to identify the cause.

## Step order

1. `01-table-spread-failure-audit.md`
2. `02-table-spread-diagnostics.md`
3. `03-strength-hierarchy-source-review.md`
4. `04-narrow-table-spread-rework.md`
5. `05-smoke-gate-and-balance-check.md`
6. `05a-champion-streak-smoke-rework.md`
7. `06-final-long-run-gate-and-phase-report.md`

## Phase constraints

- Do not widen `table_points_spread_avg` thresholds to make the gate pass.
- Do not change creator/assist concentration thresholds.
- Do not undo the Phase 34 chance-type creator distribution.
- Do not change player role caps, youth academy size, or rarity budgets unless
  the audit proves they directly cause table compression.
- Do not change match scoring probabilities unless table spread cannot be fixed
  through strength hierarchy, content, development, or turnover tuning.
- Do not add UI.
- Do not add new market, staff, scouting, training, or youth features.
- Do not treat out-of-scope smoke-gate failures as cleared; document and fix
  them narrowly before the final gate.
- Preserve deterministic output by seed.
- Keep user-facing labels localized.
- Keep engine language-agnostic and storage-free.
- Do not leave obsolete diagnostics or duplicate spread-calculation paths behind.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched engine/content/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`;
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`;
- `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The two failing Phase 34 smoke worlds are reproduced and explained.
- The report exposes enough table-spread evidence to understand failures without
  inspecting raw internals manually.
- Any rework is narrow, deterministic, and tested.
- `calibration-v1` strict balance still passes.
- The Phase 34 creator-concentration fix remains valid.
- `50` worlds x `10` seasons passes before attempting `250` worlds x `30`
  seasons.
- `250` worlds x `30` seasons has no table-spread failures and no reintroduced
  creator-concentration failures.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
