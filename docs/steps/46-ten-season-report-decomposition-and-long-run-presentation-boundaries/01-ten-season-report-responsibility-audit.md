# 01 - Ten-Season Report Responsibility Audit

## Goal

Map the current ten-season and long-run report responsibilities before moving
code.

This step should identify where command parsing, simulation execution, report
fact building, anomaly aggregation, warning semantics, localization, and CLI
rendering currently live. It should not change source behavior.

## Expected files

- `apps/cli/src/commands/ten-season-report.ts`
- `packages/simulation-tools/src/long-run/*`
- `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the current ten-season report command and long-run simulation-tools
  modules.
- Read the latest relevant audits:
  - `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
  - `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
  - `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md`
  - `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md`
- Create `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md`.
- In the audit, classify current responsibilities into:
  - CLI command parsing;
  - long-run simulation execution;
  - report data and aggregate facts;
  - anomaly and warning status semantics;
  - localized text;
  - CLI section rendering;
  - manual inspection guidance.
- Identify the narrowest low-risk boundary for Step 02.
- Do not move source code in this step.

## What NOT to implement

- Do not change runtime behavior.
- Do not change warning thresholds.
- Do not change report output wording.
- Do not add CLI flags.
- Do not create new source modules.
- Do not edit gameplay packages.

## Required checks

- `test -f docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md`
- `git diff --check`

## Definition of Done

- The audit explains the current flow from CLI command entry point to report
  output.
- The audit identifies which responsibilities are safe to split first.
- `docs/PROJECT_STATUS.md` records Step 01 as complete or blocked.
