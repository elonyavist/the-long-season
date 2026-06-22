# Step 01 - Phase 38 Baseline And Behavior Lock

## Goal

Capture the current match-engine behavior before any hardening or trace work.

This step defines what must stay stable unless a later step proves and documents
a narrow bug.

## Context

Phase 38 says the engine is acceptable and does not need broad tuning. Before
cleanup, the project needs a compact behavior lock so that refactors and trace
emission do not accidentally change the game.

## Expected files

- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Summarize the Phase 38 decision.
- Record representative baseline commands and observed key outputs for:
  - one season;
  - one fixture detail;
  - strict balance report;
  - 50x10 long-run report.
- Identify which outputs must remain stable:
  - final table ordering for fixed seeds, unless intentionally changed;
  - fixture score and event order for fixed seeds;
  - player stat aggregation for fixed seeds;
  - strict balance pass/fail;
  - long-run pass/fail.
- Identify which outputs may evolve without being a bug:
  - new optional trace sections;
  - improved report wording;
  - added diagnostics that do not change simulation.
- Do not change code behavior.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not refactor code.
- Do not add trace contracts.
- Do not tune probabilities.
- Do not add tests unless needed to document baseline comparison.
- Do not start Step 02.

## Required checks

- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The audit report records the baseline and behavior-lock rules.
- No gameplay behavior is changed.
- `docs/PROJECT_STATUS.md` points to Step 02 as the next active step.
