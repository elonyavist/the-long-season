# Step 04 - World Calendar V1 Review

## Goal

Review the current calendar model and document what is sufficient for ten-season reporting.

## Context

The full requirements call for country-specific rules, cups, playoffs, and more. Phase 30 only needs a credible enough world calendar for long-run engine reports.

## Expected files

- `docs/audits/WORLD_CALENDAR_V1_REVIEW.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Review existing calendar generation.
- Identify what is sufficient for ten-season report v1.
- Identify missing real-game features that should not block Phase 30.
- Decide whether any minimal calendar code change is required before Phase 30.
- If code changes are required, document a new narrow step before implementing.

## What NOT to implement

- Do not implement calendar code in this review step.
- Do not implement cups.
- Do not implement playoffs.
- Do not implement promotions/relegations unless the review proves Phase 30 is blocked.

## Required checks

- `rg -n "generate.*Calendar|Round|Fixture|competition|season" packages docs`
- `git diff --check`

## Definition of Done

- Calendar limits are explicit.
- Phase 30 knows whether current calendar is enough for the first ten-season report.

