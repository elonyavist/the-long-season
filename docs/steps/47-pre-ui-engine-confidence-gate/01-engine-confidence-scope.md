# 01 - Engine Confidence Scope

## Goal

Define exactly what must be true before the project starts UI-readiness work.

This step creates the audit frame for the phase. It should define the questions,
sample seeds, commands, and classification rules used by later steps.

## Expected files

- `docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the current project state and recent reports:
  - `docs/PROJECT_STATUS.md`
  - `docs/ARCHITECTURE.md`
  - `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
  - `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_REPORT.md`
  - `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
  - `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md`
- Create `docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md`.
- Define the core pre-UI questions:
  - Do fixture explanations make football sense?
  - Does the season table create believable tension?
  - Does the career loop produce meaningful manager decisions?
  - Do player abilities match role, age, division, and club strength?
  - Do warnings describe real user-facing problems or monitoring noise?
- Define sample seeds and commands for the later steps.
- Define classification categories:
  - pre-UI blocker;
  - post-UI improvement;
  - healthy variance;
  - monitoring signal;
  - false warning;
  - unclear and needs deeper sample.
- Do not change source code in this step.

## What NOT to implement

- Do not run broad tuning.
- Do not change thresholds.
- Do not create UI contracts.
- Do not add CLI flags.
- Do not edit engine/content/storage/source files.

## Required checks

- `test -f docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md`
- `git diff --check`

## Definition of Done

- The audit scope names the exact evidence later steps must collect.
- The classification model prioritizes user fun and credibility over cosmetic
  metric cleanup.
- `docs/PROJECT_STATUS.md` records Step 01 as complete or blocked.
