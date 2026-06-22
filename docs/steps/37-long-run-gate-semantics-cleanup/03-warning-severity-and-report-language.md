# Step 03 - Warning Severity And Report Language

## Goal

Make long-run report severity language match gameplay meaning.

The report should distinguish:

- blockers that require code or design rework;
- monitoring signals worth watching;
- healthy narrative variance that should remain possible.

## Context

Phase 36 concluded that most warnings are good monitoring signals, not bugs:

- standout playmakers can be fun;
- rare dynasties can be fun;
- tight leagues can be fun;
- creator-share warnings are useful because they catch over-concentration early.

The report should preserve these signals without making every healthy story look
like a defect.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect current anomaly result/status vocabulary.
- Decide whether the report needs explicit severity names such as:
  - `fail`;
  - `warn`;
  - `monitor`;
  - `story`.
- Keep machine-readable keys stable where possible.
- Keep final gate status strict for true failures.
- Ensure monitoring/story signals do not cause the phase to look blocked when
  no failure exists.
- Update CLI/Markdown output wording through localization keys.
- Update tests for report status, labels, and warning counts.
- Update the cleanup report with examples before and after the wording change.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not remove the underlying metrics.
- Do not silence `top_assist_max`, `top_creator_goal_share_max`,
  `champion_streak`, or `table_points_spread_avg`.
- Do not change thresholds unless a severity split requires a non-behavioral
  classification boundary.
- Do not change match, player, youth, or transfer behavior.

## Required checks

- focused tests for touched simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed=phase35-table-spread-world-00065 --seasons=30`;
- `pnpm cli ten-season-report --seed=phase35-table-spread-world-00238 --seasons=30`;
- `git diff --check`.

## Definition of Done

- The report language makes clear which signals are blockers and which are
  monitoring/story signals.
- Healthy narrative variance remains visible.
- User-facing labels are localized.
- No gameplay behavior changes are made.
