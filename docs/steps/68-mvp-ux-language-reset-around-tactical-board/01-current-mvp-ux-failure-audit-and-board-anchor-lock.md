# 01 - Current MVP UX Failure Audit And Board Anchor Lock

## Goal

Audit why the current first MVP web UX is rejected and formally lock the
tactical board as the approved visual anchor.

## Scope

Create an audit covering:

- current shell/dashboard/preparation/matchday screenshots and failure points;
- which areas feel like debug tables, generic SaaS, or low-quality chrome;
- which current controls, panels, headings, and tables hurt the football
  manager feeling;
- which parts of the tactical board are approved and must be preserved;
- which parts around the tactical board must be redesigned;
- first-pass UX principles for the next target.

## Expected files

- `docs/audits/MVP_UX_FAILURE_AUDIT.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change source code.
- Do not redesign screens yet.
- Do not add persistence.
- Do not replace or retune the tactical board.
- Do not create a new palette system.

## Required checks

```bash
nvm use 24
test -f docs/audits/MVP_UX_FAILURE_AUDIT.md
git diff --check
```

## Done when

- The audit clearly explains why the current MVP UX is unacceptable.
- The tactical board is explicitly marked as the approved visual anchor.
- The audit distinguishes "keep", "rework", and "remove" areas.
- `docs/PROJECT_STATUS.md` records the adopted conclusion and next action.
