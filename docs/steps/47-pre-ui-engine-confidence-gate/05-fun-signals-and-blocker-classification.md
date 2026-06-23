# 05 - Fun Signals And Blocker Classification

## Goal

Consolidate the match, career, and generation reviews into a fun-first blocker
classification.

The goal is not to prove the engine is mathematically perfect. The goal is to
decide what would harm the user's first UI experience.

## Expected files

- `docs/audits/PRE_UI_FUN_SIGNALS_AND_BLOCKERS.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the Step 02, Step 03, and Step 04 audit reports.
- Create `docs/audits/PRE_UI_FUN_SIGNALS_AND_BLOCKERS.md`.
- Build a concise decision table with:
  - finding;
  - affected system;
  - user-facing symptom;
  - severity;
  - classification;
  - recommended action;
  - whether it blocks UI readiness.
- Explicitly identify positive fun signals, for example:
  - believable upset paths;
  - interesting prospects;
  - meaningful fatigue/condition decisions;
  - table tension;
  - player growth/decline stories;
  - club identity variety.
- Explicitly identify risks that can wait until after the first UI.
- If a blocker exists, define the narrow next implementation step needed to fix
  it.
- Do not implement fixes in this step unless a previous step already scoped one
  inside expected files.

## What NOT to implement

- Do not tune the engine.
- Do not hide warnings.
- Do not create UI contracts.
- Do not turn every imperfection into a blocker.
- Do not ignore a real user-facing problem just because checks pass.

## Required checks

- `test -f docs/audits/PRE_UI_FUN_SIGNALS_AND_BLOCKERS.md`
- `git diff --check`

## Definition of Done

- Findings are classified by user-facing impact.
- The report clearly states what blocks UI and what does not.
- `docs/PROJECT_STATUS.md` records Step 05 as complete or blocked.
