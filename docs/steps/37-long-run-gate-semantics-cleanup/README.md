# Phase 37 - Long-Run Gate Semantics Cleanup

## Goal

Turn the Phase 36 warning decisions into clearer long-run gate semantics without
changing gameplay behavior.

The current long-run gate is technically useful, but it still reports some
healthy or expected situations as generic warnings. This phase should make the
report easier to read and harder to misinterpret before future engine or career
work resumes.

## Product intent

The user should be able to read a long-run report and understand whether the
game world is:

- structurally healthy;
- producing good football stories;
- producing a monitoring signal worth watching;
- showing a real blocker that hurts long-run fun.

The report should not train us to remove believable variance. It should help us
notice when the game becomes less credible or less fun.

## Context

Phase 36 concluded:

- `active_player_population` is a bad threshold-semantics warning with useful
  monitoring value;
- `top_assist_max` is healthy narrative variance with monitoring value;
- `top_creator_goal_share_max` is a useful monitoring warning;
- `champion_streak` is healthy narrative variance with monitoring value;
- `table_points_spread_avg` is healthy narrative variance with monitoring
  value.

The only concrete cleanup candidate is `active_player_population`: the current
single lower-bound threshold expects `612+` total active players, while the
stable current model can correctly sit at `594` active players:

- 18 senior squads around 22 players;
- 18 youth academies with exactly 11 players.

## Step order

1. `01-phase-36-decision-review.md`
2. `02-active-player-population-semantic-split.md`
3. `03-warning-severity-and-report-language.md`
4. `04-monitoring-signal-readability.md`
5. `05-regression-gates-after-semantics-cleanup.md`
6. `06-phase-report-and-next-decision.md`

## Phase constraints

- Do not change match simulation behavior.
- Do not change player generation behavior.
- Do not change youth academy size or lifecycle behavior.
- Do not change transfer turnover, development, or squad-maintenance behavior.
- Do not tune thresholds just to reduce warning counts.
- Do not hide narrative warnings that are still useful for monitoring.
- Do not turn healthy variance into a pass without preserving observability.
- Prefer report semantics, severity naming, and diagnostic clarity.
- Keep all user-facing report text localized.
- Keep engine language-agnostic and storage-free.
- Preserve deterministic output by seed.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- `active_player_population` is split into clear senior, youth, and total-player
  semantics.
- The report distinguishes blockers from monitoring signals.
- Healthy narrative variance remains visible, not hidden.
- Long-run gate status is easier to interpret without chat context.
- No gameplay behavior changes are made.
- The 250x30 long-run gate still passes.
- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md` records the final
  report and decision.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
