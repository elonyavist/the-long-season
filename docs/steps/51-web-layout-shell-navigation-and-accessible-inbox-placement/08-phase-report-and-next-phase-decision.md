# 08 - Phase Report And Next Phase Decision

## Goal

Close Phase 51 with a concise implementation report and exactly one next-phase
recommendation.

The report should state whether the web shell is ready to host match
preparation.

## Expected files

- `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_REPORT.md`.
- Summarize what Phase 51 added:
  - top global navigation;
  - left Inbox/Posta rail;
  - central selected content outlet;
  - WCAG 2.2 AA working target;
  - keyboard/focus findings;
  - Playwright screenshot findings.
- Record package dependency direction after the shell changes.
- Record what remains intentionally out of scope.
- Record any product/design issues found.
- Update `docs/ARCHITECTURE.md` with the new web shell source areas and
  responsibilities.
- Recommend exactly one next phase.
- The expected recommendation is likely `Phase 52 - Web Match Preparation
  Slice`, unless Phase 51 evidence proves a different blocker.
- Do not create Phase 52 documents unless explicitly requested.

## What NOT to implement

- Do not add new screens.
- Do not add gameplay behavior.
- Do not add match preparation.
- Do not add market, contracts, youth, staff, economics, or match playback.
- Do not hide accessibility or visual issues.
- Do not start the next phase.

## Required checks

- `test -f docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_REPORT.md`
- `pnpm --filter @game/ui run typecheck` if UI contracts changed
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Phase 51 has a clear implementation report.
- `docs/ARCHITECTURE.md` reflects the web shell boundary.
- `docs/PROJECT_STATUS.md` marks Phase 51 complete or blocked.
- Exactly one next phase is recommended.
