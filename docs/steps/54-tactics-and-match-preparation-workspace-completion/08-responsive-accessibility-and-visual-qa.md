# 08 - Responsive Accessibility And Visual QA

## Goal

Run browser QA for the completed tactical workspace and fix layout/accessibility
issues before closing the phase.

## Expected files

- `apps/web/src/visual-qa/*`
- `apps/web/src/styles/*`
- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `docs/audits/WEB_TACTICS_WORKSPACE_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add or update Playwright QA for:
  - main menu to dashboard;
  - dashboard action to preparation workspace;
  - Inbox/Posta action to preparation workspace;
  - formation selection;
  - XI selection;
  - bench selection;
  - tactic selection;
  - save preparation;
  - dashboard blocker clearance;
  - Continue readiness;
  - desktop viewport;
  - narrow viewport;
  - keyboard focus path.
- Capture screenshots under a phase-specific `/tmp/the-long-season-phase54`
  directory.
- Check no horizontal overflow.
- Check pitch slots do not overlap.
- Check table remains scrollable and fixed height.
- Check bench controls remain visible and understandable.
- Check WCAG 2.2 AA working target:
  - visible focus;
  - usable labels;
  - no color-only validation;
  - reachable controls;
  - stable landmarks.

## What NOT to implement

- Do not skip visual QA because unit tests pass.
- Do not hide broken narrow viewport issues.
- Do not add decorative graphics that reduce clarity.
- Do not add animations that make selection harder.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Phase 54 Playwright visual QA command
- `test -f docs/audits/WEB_TACTICS_WORKSPACE_VISUAL_QA.md`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Desktop and narrow screenshots exist.
- The tactical workspace has no visible overflow or broken pitch/table layout.
- Keyboard flow reaches formation, XI, bench, tactic, and save controls.
- Accessibility notes are documented.
- `docs/PROJECT_STATUS.md` identifies Step 09 as the next action.
