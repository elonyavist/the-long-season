# Step 03 - Career State Matchday Readiness Audit

## Goal

Verify that current career state can support matchday preparation without
forcing the manager into automatic choices.

## Context

The manager should be able to see the selected club, current squad, saved match
preparation, and next fixture before a match. If those pieces are fragmented,
this step records the exact friction before any implementation decision.

## Expected files

- `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Start from a deterministic career save.
- Inspect selected club summary.
- Inspect squad and fitness/condition information.
- Inspect any saved lineup or tactic preparation.
- Inspect the next selected-club fixture.
- Record whether the manager can understand who is available and what is saved.
- Record whether any missing view blocks the matchday slice.
- Do not fix the missing view unless this step document is explicitly updated
  before implementation.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not auto-select a lineup.
- Do not auto-select a tactic.
- Do not add transfer, youth, or development decisions.
- Do not build UI.
- Do not broaden CLI output unrelated to matchday readiness.

## Required checks

- `pnpm cli career --save=phase40-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase40-check --summary`
- `pnpm cli career --save=phase40-check --squad`
- focused checks only if this step is explicitly re-scoped to code changes
- `git diff --check`

## Definition of Done

- The audit records whether career state is ready for matchday preparation.
- Any blocker is tied to a concrete user friction point.
- The next action is Step 04 or a documented blocker.
- `docs/PROJECT_STATUS.md` is updated.
