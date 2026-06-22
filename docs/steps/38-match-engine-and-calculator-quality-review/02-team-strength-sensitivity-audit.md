# Step 02 - Team Strength Sensitivity Audit

## Goal

Check whether team-strength calculations respond to football-relevant changes in
the expected direction.

The question is not "can we make a number move?" The question is whether a user
who improves the right player or chooses the right role would see a believable
effect.

## Context

Team strength is the first major calculator layer. If role weights or player
attributes do not affect strength in understandable ways, later match output can
pass aggregate reports while still feeling arbitrary.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- engine tests or simulation-tools diagnostics only if the audit needs executable
  proof
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Build or reuse deterministic focused tests/diagnostics for controlled lineup
  changes.
- Compare at least these scenarios:
  - striker finishing/composure/pace improvement;
  - defender tackling/positioning/anticipation improvement;
  - goalkeeper reflexes/handling/positioning improvement;
  - midfielder passing/vision/stamina improvement;
  - same player in natural vs adapted/weak role if already supported by the
    current calculator surface.
- Confirm effects are directional and not dominated by irrelevant attributes.
- Identify any suspicious sensitivity, such as:
  - irrelevant attributes moving strength too much;
  - role-relevant attributes barely moving strength;
  - one department dominating overall strength too aggressively;
  - fitness curves overwhelming base ability.
- Record findings and any proposed next-step fixes with user-facing reasons.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not rewrite team strength broadly.
- Do not change role weights unless a narrow bug is proven and fixed inside this
  step with tests.
- Do not change generated player attributes.
- Do not change balance target profiles.
- Do not start Step 03.

## Required checks

- focused tests for any touched engine/simulation-tools files
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Directional sensitivity is documented with deterministic evidence.
- Any suspicious sensitivity is recorded as either acceptable, a future fix, or
  an in-step narrow bug fix.
- The audit explains findings in football terms.
- `docs/PROJECT_STATUS.md` points to Step 03 as the next active step.
