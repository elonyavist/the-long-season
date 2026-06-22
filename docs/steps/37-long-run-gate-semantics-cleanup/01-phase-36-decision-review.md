# Step 01 - Phase 36 Decision Review

## Goal

Convert the Phase 36 audit decisions into a concrete cleanup plan for Phase 37.

This step is documentation-only. It must not change report behavior yet.

## Context

`docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` says the remaining warnings are not
gameplay bugs. The main action is to make future long-run reports clearer.

The most important decision is:

- do not add players just to satisfy `active_player_population`;
- instead, split population diagnostics into senior, youth, and total semantics.

## Expected files

- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`.
- Create `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`.
- Summarize the Phase 36 decisions in the new report.
- Identify which warnings need semantics cleanup and which should remain
  monitoring-only.
- Confirm that Phase 37 is not a gameplay tuning phase.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code.
- Do not change thresholds.
- Do not change CLI output.
- Do not change game behavior.
- Do not start Step 02.

## Required checks

- `test -f docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `git diff --check`

## Definition of Done

- The cleanup report exists.
- The report states that Phase 37 is a report-semantics cleanup phase.
- The report identifies `active_player_population` as the only required
  semantics rework.
- `docs/PROJECT_STATUS.md` points to Step 02 as the next active step.
