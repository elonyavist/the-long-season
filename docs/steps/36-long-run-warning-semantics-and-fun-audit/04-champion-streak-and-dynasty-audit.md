# Step 04 - Champion Streak And Dynasty Audit

## Goal

Decide whether `champion_streak` warnings represent healthy dynasties or
structural league stagnation.

## Context

The final Phase 35 gate reports:

- `champion_streak=5`;
- no champion-streak failures;
- Step 05a already reclassified one seven-title ten-season smoke streak as a
  warning after supporting metrics proved the world was healthy.

A dynasty can be fun. The player should occasionally see a club become the team
to beat. It becomes a problem only when the world cannot dethrone strong clubs
because turnover, development, youth, or match separation logic is broken.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect current champion-streak diagnostics.
- If needed, add compact report evidence for dynasty warning worlds:
  - longest streak length;
  - champion club name;
  - champion points during the streak;
  - table spread during the streak;
  - club ability spread before/after;
  - transfer/squad turnover context if already available.
- Classify each warning pattern:
  - healthy dynasty narrative;
  - suspicious lack of turnover;
  - suspicious player-development lock-in;
  - threshold semantics issue;
  - missing diagnostics.
- Do not change champion-streak thresholds in this step unless the evidence
  proves the warning semantics are wrong.
- Update `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not force parity.
- Do not add anti-dynasty logic.
- Do not nerf strong clubs because they are strong.
- Do not hide champion streak warnings without evidence.
- Do not change transfer or development behavior in this step.

## Required checks

- focused tests for touched files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`;
- `git diff --check`.

## Definition of Done

- The audit states whether current dynasty warnings are desirable narrative,
  acceptable monitoring, or real system risk.
- Any proposed future action protects football credibility and long-run user
  enjoyment.
