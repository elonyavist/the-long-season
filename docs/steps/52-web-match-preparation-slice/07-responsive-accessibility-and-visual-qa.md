# 07 - Responsive Accessibility And Visual QA

## Goal

Verify the match-preparation section in a browser with Playwright, screenshots,
and keyboard/accessibility notes.

This step should catch layout, focus, overflow, and interaction problems before
the section is considered nearly complete.

## Expected files

- `apps/web/src/visual-qa/*`
- `docs/audits/WEB_MATCH_PREPARATION_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add or update a Playwright QA script for:
  - main menu;
  - New career;
  - dashboard with blockers;
  - open match preparation from dashboard;
  - open match preparation from Inbox/Posta;
  - choose lineup/tactic;
  - save preparation;
  - return dashboard with blockers cleared;
  - Continue reaching matchday-ready behavior;
  - desktop viewport;
  - narrow viewport;
  - keyboard focus path.
- Save screenshots outside the repository under `/tmp/the-long-season-phase52`.
- Document:
  - commands run;
  - screenshot paths;
  - desktop findings;
  - narrow findings;
  - keyboard/focus findings;
  - accessibility concerns;
  - remaining non-blocking issues.

## What NOT to implement

- Do not add production accessibility dependencies unless the audit proves they
  are needed.
- Do not hide visual issues.
- Do not mark the step complete if the screen is clipped, blank, inaccessible,
  or impossible to complete by keyboard.
- Do not start the matchday flow.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Playwright visual QA command for this phase
- `test -f docs/audits/WEB_MATCH_PREPARATION_VISUAL_QA.md`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Desktop and narrow screenshots exist outside the repository.
- Keyboard/focus behavior is documented.
- The match-preparation user journey is complete in the browser QA script.
- No blocking layout/accessibility issue remains hidden.
- `docs/PROJECT_STATUS.md` identifies Step 08 as the next action.

