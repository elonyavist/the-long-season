# 08 - Documented Architecture Map And Phase Report

## Goal

Create a stable architecture document that explains the project areas and important files after the Phase 43 hardening work.

This document should be useful to a junior developer joining the project. It should explain what each area contains and what it is responsible for, without documenting every single function.

## Expected files

- `docs/ARCHITECTURE.md`
- `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md`
- all prior Phase 43 audit files created by completed steps
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read all Phase 43 audit files.
- Create or update `docs/ARCHITECTURE.md`.
- In `docs/ARCHITECTURE.md`, document:
  - project package graph;
  - dependency direction and why it matters;
  - package responsibilities;
  - main entry points for CLI, engine, content, storage, simulation-tools, i18n, and shared;
  - important files by area;
  - what each important file contains and owns;
  - what each important file must not own;
  - how to trace the main flows:
    - simulate one season;
    - create/load a career save;
    - prepare a match;
    - advance a career fixture;
    - generate a world;
    - run long-run diagnostics;
    - render localized CLI output;
  - common debugging paths;
  - remaining large files and why they are acceptable or scheduled for future work;
  - rules for adding future code without breaking architecture.
- Keep function-level detail light:
  - mention important exported entry points;
  - do not duplicate source code;
  - do not create stale pseudo-API docs.
- Create `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md` with:
  - what Phase 43 changed;
  - what stayed intentionally unchanged;
  - checks run;
  - remaining risks;
  - one recommended next phase only.
- Update `docs/PROJECT_STATUS.md` to mark Phase 43 complete or blocked.

## What NOT to implement

- Do not start the next phase.
- Do not add new gameplay behavior.
- Do not rewrite `requirements.md`.
- Do not modify `docs/PROJECT_RULES.md` unless Phase 43 proves a binding rule is wrong and the change is explicitly justified.
- Do not turn `docs/ARCHITECTURE.md` into a function-by-function API reference.
- Do not include speculation that is not reflected in the current code or an explicit future recommendation.

## Required checks

- `test -f docs/ARCHITECTURE.md`
- `pnpm depcruise`
- `pnpm check`
- `pnpm cli doctor`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli career --save=phase43-check --summary`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- `docs/ARCHITECTURE.md` explains the project areas and important files clearly.
- A junior developer can use the document to find entry points and trace major flows.
- The final report records all major complexity reductions and intentional deferrals.
- Remaining large files have explicit reasons or future-step recommendations.
- Phase 43 is marked complete or blocked with a concrete reason.
- The next action is explicit and limited to one recommended phase.
