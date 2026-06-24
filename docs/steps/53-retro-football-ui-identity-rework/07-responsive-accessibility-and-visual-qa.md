# 07 - Responsive Accessibility And Visual QA

## Goal

Verify the redesigned retro-football UI in a browser with Playwright,
screenshots, keyboard checks, and accessibility notes.

This step should catch whether the new visual identity works in practice and
whether it still supports the complete Phase 52 preparation journey.

## Expected files

- `apps/web/src/visual-qa/*`
- `docs/audits/WEB_RETRO_FOOTBALL_UI_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add or update Playwright QA for:
  - main menu;
  - shell/top navigation;
  - left Inbox/Posta rail;
  - dashboard control room;
  - open match preparation from dashboard;
  - open match preparation from Inbox/Posta;
  - pitch layout;
  - squad list;
  - tactic selection;
  - save preparation;
  - return dashboard with blockers cleared;
  - Continue reaching matchday-ready behavior;
  - desktop viewport;
  - narrow viewport;
  - keyboard focus path.
- Save screenshots outside the repository under
  `/tmp/the-long-season-phase53`.
- Document:
  - commands run;
  - screenshot paths;
  - desktop findings;
  - narrow findings;
  - keyboard/focus findings;
  - accessibility concerns;
  - football-identity findings;
  - remaining non-blocking issues.

## What NOT to implement

- Do not hide visual issues.
- Do not mark the step complete if the UI still reads as generic dashboard.
- Do not mark the step complete if the preparation journey breaks.
- Do not add production accessibility dependencies unless the audit proves they
  are needed.
- Do not start the next feature phase.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Playwright visual QA command for this phase
- `test -f docs/audits/WEB_RETRO_FOOTBALL_UI_VISUAL_QA.md`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Desktop and narrow screenshots exist outside the repository.
- Keyboard/focus behavior is documented.
- The UI visibly communicates football management.
- The Phase 52 match-preparation journey still works.
- No blocking layout/accessibility issue remains hidden.
- `docs/PROJECT_STATUS.md` identifies Step 08 as the next action.
