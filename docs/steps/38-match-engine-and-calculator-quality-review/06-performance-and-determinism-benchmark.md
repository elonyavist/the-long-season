# Step 06 - Performance And Determinism Benchmark

## Goal

Measure whether the current engine needs optimization now, and verify that
diagnostics have not weakened determinism.

Optimization should happen only when evidence shows it is needed for the next
project milestone.

## Context

The project can run 250x30 long-run gates, but heavier gates and future playable
career loops may need faster report execution. This step should separate real
performance bottlenecks from premature optimization.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- benchmark helper or test only if needed and documented
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Record representative runtime for:
  - one season simulation;
  - 50x10 long-run report;
  - 250x30 long-run gate if reasonable inside the current step;
  - strict balance report.
- Repeat at least one seeded command and confirm deterministic output or stable
  key metrics.
- Identify obvious hot paths only if evidence points to them.
- Classify optimization need:
  - not needed now;
  - useful before UI;
  - required before larger gates;
  - blocker.
- Do not optimize unless a small, safe, well-scoped improvement is both obvious
  and inside the step's expected files.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not rewrite core loops for speed without evidence.
- Do not add caching that changes determinism or state boundaries.
- Do not reduce simulation detail to make benchmarks faster.
- Do not weaken long-run gates.
- Do not start Step 07.

## Required checks

- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The audit records current runtime observations.
- The audit states whether optimization is needed now.
- Determinism remains verified for representative seeded output.
- `docs/PROJECT_STATUS.md` points to Step 07 as the next active step.
