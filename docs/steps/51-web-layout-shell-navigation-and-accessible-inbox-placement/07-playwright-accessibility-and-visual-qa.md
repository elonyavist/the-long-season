# 07 - Playwright Accessibility And Visual QA

## Goal

Verify the new shell with browser automation, screenshots, and documented
accessibility observations.

This step should catch layout and navigation problems before the next phase
builds match preparation inside the shell.

## Expected files

- `apps/web/src/visual-qa/*`
- `docs/audits/WEB_SHELL_ACCESSIBILITY_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Update or add a Playwright visual QA script for:
  - main menu;
  - New career;
  - dashboard shell;
  - top navigation;
  - left Inbox rail;
  - Continue stop;
  - narrow viewport.
- Save screenshots outside the repository, under `/tmp/the-long-season-phase51`.
- Check visible focus behavior where practical.
- Record:
  - commands run;
  - screenshot paths;
  - desktop findings;
  - narrow viewport findings;
  - keyboard/focus findings;
  - any remaining non-blocking issues.
- If Chromium is missing, run `pnpm playwright:install`.

## What NOT to implement

- Do not add production accessibility dependencies unless this step documents
  why they are needed.
- Do not hide visual issues.
- Do not mark the step complete if the main shell is blank, clipped, or
  keyboard-blocked.
- Do not implement match preparation.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Playwright visual QA command for this phase
- `test -f docs/audits/WEB_SHELL_ACCESSIBILITY_VISUAL_QA.md`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Desktop and narrow viewport screenshots exist outside the repository.
- The audit documents visual and keyboard/focus findings.
- No blocking shell layout or accessibility issue remains hidden.
- `docs/PROJECT_STATUS.md` identifies Step 08 as the next action.
