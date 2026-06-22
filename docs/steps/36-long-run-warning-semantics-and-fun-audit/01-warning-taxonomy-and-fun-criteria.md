# Step 01 - Warning Taxonomy And Fun Criteria

## Goal

Create the decision framework for interpreting long-run warnings through
gameplay value, not through a desire to make reports green.

## Context

Phase 35 ended with no failing checks, but every world still warns on at least
one key. Before adding diagnostics or changing code, this step defines how to
judge warning meaning.

The core product rule is:

> The math is a diagnostic instrument. User fun, credibility, readability, and
> emergent football stories are the goal.

## Expected files

- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`.
- Read `docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`.
- Create `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`.
- Record the Phase 35 final warning set:
  - `active_player_population=250`;
  - `top_assist_max=29`;
  - `top_creator_goal_share_max=26`;
  - `champion_streak=5`;
  - `table_points_spread_avg=3`.
- Define the warning classification vocabulary:
  - `healthy narrative variance`;
  - `useful monitoring warning`;
  - `bad threshold semantics`;
  - `missing diagnostics`;
  - `real engine/content/career logic issue`.
- Define the fun-first evaluation questions:
  - Does this warning create a believable football story?
  - Would the user notice it as an interesting narrative or as nonsense?
  - Does it hurt career readability over multiple seasons?
  - Does it reveal a hidden structural collapse?
  - Does it need better diagnostics before any code change?
- Add an initial hypothesis for each warning type without changing code.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change simulation behavior.
- Do not change thresholds.
- Do not add CLI output.
- Do not run new long-run gates unless needed for manual confirmation.
- Do not start fixing specific warnings in this step.

## Required checks

- `git diff --check`

## Definition of Done

- The audit file has a clear warning taxonomy.
- Each current warning has an initial hypothesis.
- The next step is `02-active-player-population-diagnostics.md`.
- `docs/PROJECT_STATUS.md` is updated.
