# 01 - Phase 46 Output Review

## Goal

Review the current architecture and presentation boundaries before defining any
UI-facing contract.

This step should confirm whether the codebase is ready for a first career UI
slice and identify the narrowest useful seam for the first screen. It should not
move source code.

## Expected files

- `docs/audits/CAREER_UI_SLICE_READINESS_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the current architecture documentation:
  - `docs/ARCHITECTURE.md`
  - `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
  - `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md`
- Read the latest presentation and report boundary documents:
  - `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md`
  - `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md`
  - `docs/audits/TEN_SEASON_REPORT_BOUNDARY_REVIEW.md`
  - `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_REPORT.md`
- Read the current career command modules enough to trace:
  - summary output;
  - saved preparation output;
  - matchday advancement output;
  - roster and condition output.
- Create `docs/audits/CAREER_UI_SLICE_READINESS_REVIEW.md`.
- In the review, classify current Modules into:
  - reusable career state/data facts;
  - CLI-only rendering;
  - future UI-facing view candidates;
  - package-boundary risks;
  - localization risks;
  - first-screen blockers.
- Apply the architecture deletion test to any proposed new Module: if deleting
  it would only move trivial mapping into the caller, do not recommend it.
- Identify the narrowest low-risk candidate for Step 02.
- Do not modify source code in this step.

## What NOT to implement

- Do not create a UI package.
- Do not add CLI flags.
- Do not change runtime behavior.
- Do not add translations.
- Do not change career saves.
- Do not edit engine, content, storage, simulation-tools, or i18n source.

## Required checks

- `test -f docs/audits/CAREER_UI_SLICE_READINESS_REVIEW.md`
- `git diff --check`

## Definition of Done

- The review explains whether Phase 45 and Phase 46 created enough locality for
  a UI-facing career dashboard seam.
- The review names the first screen candidate and any blockers.
- `docs/PROJECT_STATUS.md` records Step 01 as complete or blocked.
