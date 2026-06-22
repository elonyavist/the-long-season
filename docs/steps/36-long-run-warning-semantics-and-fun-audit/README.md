# Phase 36 - Long-Run Warning Semantics And Fun Audit

## Goal

Turn the remaining long-run warnings from raw statistical signals into gameplay
decisions.

The phase must not exist to make warnings disappear. It exists to answer a more
important question: do the warnings reveal something that makes the game less
credible, less readable, or less fun for the user?

## Product intent

The player should experience a believable football world that produces stories:

- a dominant creator can be fun if it feels like a memorable playmaker;
- a long champion run can be fun if it feels like a credible dynasty;
- a compressed table can be fun if it feels like a tight league;
- population drift is not fun by itself, but it may reveal a hidden world-health
  issue that later hurts saves;
- gates should block structural collapse, not healthy variance.

Mathematics is a diagnostic instrument. It is not the design goal.

## Context

Phase 35 closed with a passing final gate:

- `250` worlds x `30` seasons;
- `7500` total seasons;
- failed worlds: `0`;
- failing check counts: `none`;
- table spread average: `39.83`;
- minimum world-average table spread: `35.67`.

Remaining warnings:

- `active_player_population=250`;
- `top_assist_max=29`;
- `top_creator_goal_share_max=26`;
- `champion_streak=5`;
- `table_points_spread_avg=3`.

These are not blockers yet. They are inspection prompts.

## Step order

1. `01-warning-taxonomy-and-fun-criteria.md`
2. `02-active-player-population-diagnostics.md`
3. `03-creator-and-assist-warning-audit.md`
4. `04-champion-streak-and-dynasty-audit.md`
5. `05-table-spread-warning-audit.md`
6. `06-warning-semantics-decision-report.md`

## Phase constraints

- Do not tune behavior just to remove warning counts.
- Do not widen thresholds without a gameplay explanation.
- Do not hide warnings as pass unless the warning is proven to be a healthy
  narrative signal or a poorly defined diagnostic.
- Do not change match scoring probabilities in this phase unless a warning
  proves a real match-engine logic problem.
- Do not change player generation, youth lifecycle, transfer turnover, or
  development unless a warning proves those systems are hurting career
  credibility.
- Do not start UI work.
- Do not start a new market, staff, scouting, training, media, or facilities
  feature.
- Prefer diagnostics and reports before rework.
- Preserve deterministic output by seed.
- Keep user-facing labels localized.
- Keep engine language-agnostic and storage-free.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- Each remaining warning type is classified as one of:
  - healthy narrative variance;
  - useful monitoring warning;
  - bad threshold semantics;
  - missing diagnostics;
  - real engine/content/career logic issue.
- The classification explains the user-facing gameplay impact, not only the
  metric value.
- Any proposed fix has a user-fun reason.
- Any code change is diagnostic-first and narrow.
- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` records the decision table and
  next action.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
