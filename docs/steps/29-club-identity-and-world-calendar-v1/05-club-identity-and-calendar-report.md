# Step 05 - Club Identity And Calendar Report

## Goal

Close Phase 29 and confirm readiness for ten-season reporting.

## Context

Phase 30 should not start until long-run reports can reference readable clubs and known calendar limitations.

## Expected files

- `docs/audits/CLUB_IDENTITY_AND_WORLD_CALENDAR_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Record club naming model.
- Record sample generated clubs for at least two seeds.
- Record calendar model and limitations.
- Confirm whether Phase 30 can start.

## What NOT to implement

- Do not start Phase 30.
- Do not add UI.

## Required checks

- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-b`
- `pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview`
- `git diff --check`

## Definition of Done

- The report exists.
- Long-run report output will be readable enough to review.

