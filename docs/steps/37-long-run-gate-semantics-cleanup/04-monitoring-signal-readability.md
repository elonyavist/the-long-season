# Step 04 - Monitoring Signal Readability

## Goal

Make monitoring signals readable enough that a developer or designer can inspect
the report without opening raw internals.

This step is about interpretation, not tuning.

## Context

Phase 36 says the report should keep these signals visible:

- top assist seasons;
- creator goal-share concentration;
- champion streaks;
- tight table-spread worlds;
- active player population ranges.

The report already includes snapshots, but this step should verify whether the
final presentation clearly answers the user-fun questions:

- Is this a believable football story?
- Is this a repeated long-run collapse?
- Does this reduce user agency or squad-building meaning?

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Review Markdown report sections for:
  - production warning snapshots;
  - dynasty warning snapshots;
  - table-spread warning snapshots;
  - active player population ranges.
- Add compact interpretation fields only if the current output is ambiguous.
- Prefer structured values over prose where possible.
- Keep report output deterministic and concise.
- Add tests for any new fields or formatting.
- Update the cleanup report with the final readability decision.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add verbose narrative text to every world row.
- Do not add UI.
- Do not change gameplay behavior.
- Do not change thresholds just to make the report shorter.
- Do not duplicate existing report sections.

## Required checks

- focused tests for touched simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`;
- `git diff --check`.

## Definition of Done

- Monitoring sections are readable without chat context.
- The report still exposes enough evidence to decide whether a warning is fun,
  healthy, or harmful.
- No duplicate or obsolete report paths are left behind.
