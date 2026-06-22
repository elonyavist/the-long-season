# Step 02 - Career Loop Playability Spec

## Goal

Define the minimum playable career loop we must be able to exercise before
building UI or adding more career systems.

## Context

The project now has many pieces: generated world, career save, squad, formation
fit, lineup/tactic preparation, next fixture, match simulation, player
development, youth, and rollover. This step turns those pieces into one
manager-facing journey.

## Expected files

- `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Define the manager journey from new save to first post-match review.
- Include the required touchpoints:
  - create or load career;
  - inspect selected club;
  - inspect squad and fitness;
  - choose or confirm formation/tactic/lineup;
  - view next fixture;
  - play the fixture;
  - review match explanation;
  - review post-match squad consequences;
  - understand next action.
- Define playability signals that matter for fun.
- Define friction signals that block fun.
- Mark each signal as currently supported, fragmented, missing, or unknown.
- Keep the spec factual and non-prescriptive.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code in this spec step.
- Do not introduce a UI wireframe.
- Do not prescribe market or youth decisions to the manager.
- Do not define automatic lineup/tactic decisions.
- Do not add metrics only because they are easy to compute.

## Required checks

- `git diff --check`

## Definition of Done

- The audit document contains a clear minimum playable loop.
- The loop is judged from the user's experience, not from package completion.
- Any missing command or data surface needed by later steps is explicit.
- `docs/PROJECT_STATUS.md` is updated.
