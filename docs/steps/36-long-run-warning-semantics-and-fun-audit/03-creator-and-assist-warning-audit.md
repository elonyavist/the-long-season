# Step 03 - Creator And Assist Warning Audit

## Goal

Decide whether `top_assist_max` and `top_creator_goal_share_max` warnings are
healthy player stories or evidence of an attribution/distribution issue.

## Context

The final Phase 35 gate reports:

- `top_assist_max=29`;
- `top_creator_goal_share_max=26`;
- no creator-concentration failures;
- original Phase 33 failing seed now passes.

High assist totals can be fun if they create memorable playmakers. They are a
problem only when they repeatedly come from mechanical over-concentration.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect current creator/assist diagnostics.
- If needed, add compact report evidence for warning worlds:
  - top assist player;
  - top assist count;
  - creator club goals;
  - top creator goal share;
  - top three creator goal share;
  - creator club league position or points if already available;
  - creator role/position if available without widening scope.
- Separate these cases:
  - high raw assists but low share on a high-scoring team;
  - high share on a low-scoring team;
  - repeated concentration in one role/player archetype;
  - plausible standout playmaker season.
- Do not change attribution logic in this step unless the current diagnostics
  are already sufficient and prove a bug.
- Update `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` with the classification.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not cap assists per player or per team.
- Do not lower assist probability just to reduce warning counts.
- Do not change scoring probabilities.
- Do not change chance actor selection unless the audit proves a real repeated
  bias.
- Do not classify a standout player as a bug only because the number is high.

## Required checks

- focused tests for touched files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`;
- `git diff --check`.

## Definition of Done

- The audit explains whether assist/creator warnings are fun variance,
  monitoring signals, threshold issues, or real engine problems.
- Any proposed future fix is tied to user-facing football credibility.
