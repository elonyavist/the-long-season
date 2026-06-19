# Causality Baseline Review

## Goal

Review the current Phase 06 output and decide whether it is good enough to build Phase 07 causal match work on top of it, or whether a narrow rework is needed first.

## Why we implement it this way

The roadmap now requires a phase gate before each new phase: check whether the previous work is solid before adding new scope. Phase 06 completed CLI inspection and stat completeness, but Phase 07 will touch match-event semantics. If current outputs are confusing, brittle, or already misleading, causal actor work would amplify that problem.

This step is intentionally a review step. It should produce a clear baseline and next action, not new game mechanics.

## What to implement

- Run and inspect the current deterministic CLI outputs:
  - base season summary;
  - one fixture detail;
  - strict balance report.
- Check whether current output is internally coherent:
  - scorer, assist, shooter, goalkeeper, shots, shots on target, and saves should line up;
  - fixture detail should be readable enough to compare before and after Phase 07;
  - season leaders should still be plausible.
- Identify any narrow issue that should be fixed before causal actor work starts.
- If the current state is good enough, update `docs/PROJECT_STATUS.md` so the active step becomes `02-chance-actor-selection.md`.
- If a rework is needed, document the blocker in `docs/PROJECT_STATUS.md` and stop without starting Phase 07 implementation.

## What NOT to implement

- Do not change code unless a tiny documentation correction is required.
- Do not implement chance actors, durable event changes, CLI rendering changes, tactics, player states, live match-day, or management systems.
- Do not tune scoring, balance targets, fake content generation, team-strength spread, or conversion probabilities.
- Do not add new tests unless a documentation-only command check reveals a broken existing test command that must be documented for the next step.

## Allowed dependencies

- None. This is a review/documentation step.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` only if the review changes the next step scope.

## Required tests/checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm check` only if any source or test file is changed.

## Definition of Done

- `docs/PROJECT_STATUS.md` records whether Phase 06 output is good enough to build on.
- Any blocker or rework need is documented clearly.
- If there is no blocker, the next action points to `02-chance-actor-selection.md`.
- No causal match implementation has started.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review the current Phase 06 outputs by running the required CLI checks. Do not implement causal actor code. Update `docs/PROJECT_STATUS.md` with the review result, next active step, and anything I should manually inspect. Stop after this review.
