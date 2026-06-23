# 06 - Pre-UI Engine Confidence Report

## Goal

Close Phase 47 with a final confidence decision.

This step should say whether the project can proceed to Phase 48 UI readiness,
or whether a specific engine/content/career issue must be fixed first.

## Expected files

- `docs/audits/PRE_UI_ENGINE_CONFIDENCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/PRE_UI_ENGINE_CONFIDENCE_REPORT.md`.
- Summarize all Phase 47 evidence:
  - confidence scope;
  - match sample review;
  - career loop sample review;
  - player generation sanity review;
  - fun signals and blocker classification.
- Record all checks and commands used.
- State one final decision:
  - proceed to Phase 48 UI readiness;
  - proceed with named non-blocking risks;
  - blocked by a specific issue.
- If proceeding, set the next action to:
  `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/01-phase-47-output-review.md`.
- If blocked, name the exact next step or phase required before UI readiness.
- Do not start Phase 48 in this step.

## What NOT to implement

- Do not start UI readiness code.
- Do not create React/web app files.
- Do not tune gameplay.
- Do not change thresholds.
- Do not hide unresolved concerns.
- Do not start the next phase.

## Required checks

- `test -f docs/audits/PRE_UI_ENGINE_CONFIDENCE_REPORT.md`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli ten-season-report --seed-prefix=phase47-final --worlds=10 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The final report makes a clear pre-UI confidence decision.
- Any remaining risk is classified by user-facing impact.
- `docs/PROJECT_STATUS.md` marks Phase 47 complete or blocked and names the next
  action.
