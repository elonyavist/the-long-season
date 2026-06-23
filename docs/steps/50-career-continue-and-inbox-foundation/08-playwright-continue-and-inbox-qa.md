# 08 - Playwright Continue And Inbox QA

## Goal

Verify the first continue/inbox web loop with browser-based QA.

The goal is not just to pass tests. The screen should be readable, credible,
and useful to a manager.

## Expected files

- `apps/web/src/visual-qa/continue-inbox.spec.ts`
- `docs/audits/CAREER_CONTINUE_INBOX_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Ensure Playwright Chromium is available by running `pnpm playwright:install`
  if needed.
- Add a Playwright QA script/test that opens the web app.
- Cover at least:
  - main menu;
  - new career to dashboard;
  - Continue action;
  - resulting attention stop;
  - Inbox panel with action-required message;
  - desktop viewport;
  - narrow viewport.
- Capture screenshots to a deterministic local output path if the existing web
  QA pattern supports it.
- Inspect screenshots for:
  - blank pages;
  - clipped text;
  - overlapping panels;
  - unreadable contrast;
  - broken navigation;
  - hidden or confusing attention message.
- Write `docs/audits/CAREER_CONTINUE_INBOX_VISUAL_QA.md` with findings and any
  fixes made.

## What NOT to implement

- Do not redesign the whole visual system.
- Do not add new product scope to make screenshots look fuller.
- Do not ignore a real visual blocker.
- Do not skip Playwright silently. If it cannot run, document the exact blocker
  in the audit and project status.
- Do not start the next phase.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Playwright QA command used by the step.
- `test -f docs/audits/CAREER_CONTINUE_INBOX_VISUAL_QA.md`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Browser QA covers the continue/inbox flow.
- Desktop and narrow layouts are inspected.
- Any visual blocker is fixed or explicitly documented.
- `docs/PROJECT_STATUS.md` records Step 08 as complete or blocked.
