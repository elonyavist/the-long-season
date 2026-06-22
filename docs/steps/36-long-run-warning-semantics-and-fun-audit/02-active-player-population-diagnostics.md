# Step 02 - Active Player Population Diagnostics

## Goal

Explain why `active_player_population` warns in every final Phase 35 world.

This is the highest-priority warning because it is systematic and technical: it
does not directly create a fun story for the user, but it may reveal hidden
world-health drift.

## Context

The final Phase 35 gate reports:

- `active_player_population=250`;
- youth roster max observed: `11`;
- clubs above youth target: `0`;
- clubs below youth minimum: `0`;
- minimum squad size observed: `19`;
- clubs below minimum squad size: `0`;
- clubs without natural goalkeeper: `0`.

The current report exposes the warning count, but not enough detail to know
whether the warning is caused by too few players, too many players, narrow
threshold semantics, or a display issue.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect current youth/player population metrics.
- Add diagnostics only if the current report cannot answer:
  - minimum active senior player count;
  - maximum active senior player count;
  - minimum active youth player count;
  - maximum active youth player count;
  - minimum active total player count;
  - maximum active total player count;
  - whether the warning comes from underpopulation or overpopulation.
- Keep output compact and localized if it is user-facing CLI/report text.
- Do not change population behavior in this step.
- Run a small reproducibility check.
- Run the Phase 35 250x30 report after diagnostics if report output changed.
- Update the audit with a classification:
  - healthy fluctuation;
  - threshold semantics issue;
  - report-diagnostic issue;
  - real roster/youth lifecycle issue.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change youth academy size.
- Do not change senior squad maintenance.
- Do not change transfer turnover.
- Do not change player intake, promotion, release, retirement, or development.
- Do not change warning thresholds until diagnostics prove the current
  threshold semantics are wrong.
- Do not tune to remove the warning.

## Required checks

- focused tests for touched files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`;
- `git diff --check`.

## Definition of Done

- The report explains why `active_player_population` warns.
- The audit states whether this warning is a real gameplay/world-health concern.
- No population behavior changes are made unless a separate future step is
  documented.
