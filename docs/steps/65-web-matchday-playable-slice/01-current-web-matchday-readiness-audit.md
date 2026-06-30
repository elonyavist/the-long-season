# 01 - Current Web Matchday Readiness Audit

## Goal

Map the exact web, UI read-model, and engine seams needed to make matchday
playable without changing behavior yet.

## Scope

Audit:

- dashboard, Inbox/Posta, Continue, and match-preparation web flows;
- Zustand career UI state and existing demo adapters;
- `packages/ui` career dashboard/inbox/match-preparation read models;
- engine career fixture advancement outputs from Phase 63 and Phase 64;
- current Playwright/browser QA setup;
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`;
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- `docs/ARCHITECTURE.md`.

The audit must identify which facts are already available and which read-model
facts must be added before UI work.

## Expected files

- `docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not create source files.
- Do not change UI layout.
- Do not change engine behavior.
- Do not add routes, stores, labels, or tests.
- Do not mark roadmap rows complete unless this audit genuinely completes a
  documented row.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_AUDIT.md
git diff --check
```

## Done when

- The audit names the safest integration path from prepared web state to real
  engine fixture progression.
- The audit lists exact source files expected in later steps.
- The audit states whether Phase 65 can remain in-memory and why persistence is
  intentionally deferred to Phase 66.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
