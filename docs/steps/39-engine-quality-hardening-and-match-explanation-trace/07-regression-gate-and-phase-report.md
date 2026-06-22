# Step 07 - Regression Gate And Phase Report

## Goal

Close Phase 39 by proving cleanup and trace work did not weaken the game.

## Context

This phase is successful only if the engine is easier to maintain and easier to
explain while preserving current football credibility.

## Expected files

- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Summarize what was cleaned up.
- Summarize what the trace explains.
- State what remains aggregate or opaque.
- Confirm whether fixed-seed behavior stayed stable.
- Confirm strict balance and long-run report status.
- Decide whether more match-engine work is needed immediately.
- Recommend the next product direction.
- Do not start that next direction.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code behavior in the final report step.
- Do not tune probabilities.
- Do not start the next phase.
- Do not hide any regression.
- Do not recommend fixes only to make numbers prettier.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- representative deterministic repeat/diff for seeded fixture explanation
- `git diff --check`

## Definition of Done

- Phase 39 has a complete final report.
- The report states whether the engine is cleaner and more explainable.
- No unintended behavior change remains.
- The next action is explicit.
- `docs/PROJECT_STATUS.md` records Phase 39 as complete or blocked.
