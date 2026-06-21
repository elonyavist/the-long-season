# Step 05 - Phase 23 Readiness Review

## Goal

Re-score the project after hardening and decide whether `Phase 23 - Playable Career Loop MVP` can start.

## Context

Phase 21 scored the project at `88 / 100`. This phase should not chase a fake perfect score by adding features. It should raise confidence by removing ambiguity and obvious maintainability risk before the playable loop.

## Expected files

- `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md`
- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Summarize what Phase 22 changed.
- Record which Phase 21 risks are now resolved, reduced, or still accepted.
- Assign a new readiness score.
- Confirm whether Phase 23 can start.
- If Phase 23 cannot start, record the blocker and do not point status at Phase 23.

## What NOT to implement

- Do not implement Phase 23.
- Do not hide unresolved risks.
- Do not rewrite history in completed Phase 21 docs.
- Do not mark the project as `100 / 100` unless there are no known material risks for starting Phase 23.

## Required checks

- `pnpm check`
- `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase22-hardening-world --inspect`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The hardening report exists.
- The active status clearly says whether Phase 23 is ready.
- Any remaining risk is explicitly accepted or turned into a blocker.
