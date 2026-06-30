# 09 - Visual QA Accessibility And Phase Report

## Goal

Close Phase 68 only after proving the new MVP UX language in the browser.

## Scope

Add or update Playwright visual QA to cover:

- main menu;
- dashboard command centre;
- Inbox/Posta surface;
- match preparation with approved tactical board preserved;
- matchday centre;
- desktop and narrow viewports;
- keyboard focus;
- no horizontal overflow;
- no clipped primary content;
- no debug-table presentation in matchday.

Write a final report covering:

- what changed;
- what the approved tactical board anchor preserved;
- what was removed or redesigned;
- screenshot findings;
- accessibility findings;
- residual risks;
- whether persistence can resume or another UX pass is required.

## Expected files

- `apps/web/src/visual-qa/mvp-ux-language-reset.spec.ts`
- `docs/audits/MVP_UX_LANGUAGE_RESET_VISUAL_QA.md`
- `docs/audits/MVP_UX_LANGUAGE_RESET_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not start persistence.
- Do not hide unresolved UX problems.
- Do not claim the UX is approved if screenshots still fail the stated target.
- Do not start the next phase.

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/mvp-ux-language-reset.spec.ts
pnpm check
git diff --check
graphify update .
```

## Done when

- Visual QA audit exists with screenshot paths.
- Final report exists and is honest about approval or remaining blockers.
- Architecture and roadmaps describe the new MVP UX language direction.
- `docs/PROJECT_STATUS.md` marks Phase 68 complete or blocked.
- The next phase is recommended but not started.
