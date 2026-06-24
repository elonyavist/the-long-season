# 07 - Regression Visual QA And Accessibility

## Goal

Prove that the architecture/tooling rework did not regress the browser
experience.

## Expected files

- `apps/web/src/visual-qa/*`
- `docs/audits/WEB_ARCHITECTURE_REWORK_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Run existing Playwright QA scripts affected by file moves.
- Add or update one Phase 55 QA script only if existing scripts do not cover the
  architecture rework.
- Verify:
  - main menu;
  - dashboard;
  - left Inbox/Posta rail;
  - match-preparation workspace;
  - formation switching;
  - XI and bench selection;
  - tactic selection;
  - save preparation;
  - Continue readiness;
  - desktop viewport;
  - narrow viewport;
  - keyboard access to primary actions.
- Capture screenshots under `/tmp/the-long-season-phase55`.
- Record visual and accessibility findings.

## What NOT to implement

- Do not skip browser QA because tests pass.
- Do not hide visual regressions caused by Tailwind migration.
- Do not accept horizontal overflow or clipped controls.
- Do not redesign the UI in this step.

## Required checks

- Phase 55 Playwright visual QA command
- `test -f docs/audits/WEB_ARCHITECTURE_REWORK_VISUAL_QA.md`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Desktop and narrow screenshots exist.
- Existing playable web flows still work.
- Accessibility risks are documented.
- `docs/PROJECT_STATUS.md` identifies Step 08 as the next action.
