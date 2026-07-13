# 14 - Visual QA, Accessibility, And Phase Report

## Goal

Close Phase 69 with browser proof, accessibility notes, and an honest decision
on whether the first MVP UI language is now strong enough to continue.

## Scope

- Rebuild Playwright visual QA around the new UI.
- Capture desktop and narrow screenshots for:
  - app entry;
  - dashboard;
  - match preparation;
  - half-time;
  - full time.
- Check keyboard focus and landmark/accessibility basics.
- Write a final phase report with:
  - what changed;
  - what was intentionally preserved;
  - what was removed;
  - remaining UX risks;
  - recommended next phase.
- Update architecture/roadmap/status.

## What NOT to implement

- No new product section.
- No new engine behavior.
- No extra visual changes unless QA finds a current-phase blocker.
- No persistence.

## Expected files

- `apps/web/src/visual-qa/web-ui-full-rebuild.spec.ts`
- `docs/audits/WEB_UI_FULL_REBUILD_VISUAL_QA.md`
- `docs/audits/WEB_UI_FULL_REBUILD_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` only if the next
  phase order changes.

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/web-ui-full-rebuild.spec.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm check
git diff --check
graphify update .
```

## Visual check for the user

Review the generated screenshots and the running app.

Acceptance:

- the UI no longer looks like the rejected implementation;
- the tactical board remains the approved anchor;
- dashboard/preparation/matchday feel like one product;
- desktop and narrow layouts are usable;
- keyboard focus is visible;
- no dead visible action exists.

## Definition of Done

- Visual QA report exists.
- Phase report exists.
- All phase-level checks pass.
- `docs/PROJECT_STATUS.md` marks Phase 69 complete or blocked with a concrete
  reason.
- The next phase recommendation is singular and justified.
