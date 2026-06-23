# 08 - Web Prototype QA And Next Phase Report

## Goal

Close Phase 49 with visual, architectural, and product-readiness evidence.

This step should decide whether to continue with a second UI slice or return to
engine/career systems before expanding the web app.

## Expected files

- `docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md`.
- Summarize what Phase 49 built:
  - web workspace;
  - app entry;
  - settings;
  - visual foundation;
  - demo dashboard adapter;
  - career dashboard screen.
- Record package dependency direction after the web app exists.
- Record any visual/design issues found during manual inspection.
- Record any product issues found in the first web flow.
- Record what remains intentionally out of scope.
- Update `docs/ARCHITECTURE.md` with the `apps/web` source areas and entry
  points.
- Recommend exactly one next phase.
- Do not create the next phase documents unless explicitly requested.

## What NOT to implement

- Do not add new screens.
- Do not add gameplay behavior.
- Do not implement storage persistence.
- Do not implement economics, contracts, salaries, stadiums, ticket prices, or
  finance simulation.
- Do not hide visual issues.
- Do not start the next phase.

## Required checks

- `test -f docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test` if tests exist.
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- Manual browser inspection of:
  - app entry;
  - settings controls;
  - career dashboard;
  - desktop viewport;
  - narrow viewport.
- `git diff --check`

## Definition of Done

- Phase 49 has a clear implementation report.
- The first web prototype is buildable and inspectable.
- `docs/ARCHITECTURE.md` reflects the web app boundary.
- `docs/PROJECT_STATUS.md` marks Phase 49 complete or blocked.
- Exactly one next phase is recommended.
