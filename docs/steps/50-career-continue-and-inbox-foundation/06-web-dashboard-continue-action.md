# 06 - Web Dashboard Continue Action

## Goal

Wire the web dashboard's `Continue` action to the structured career
continuation result.

The dashboard should make the first playable loop visible: pressing `Continue`
stops at the next manager-relevant attention event.

## Expected files

- `apps/web/src/career/build-demo-career-dashboard.ts`
- `apps/web/src/career/continue-demo-career.ts`
- `apps/web/src/screens/CareerDashboardScreen.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/App.test.tsx`
- `packages/i18n/src/catalogs/en.ts`
- `packages/i18n/src/catalogs/it.ts`
- `packages/i18n/src/catalogs/de.ts`
- `packages/i18n/src/catalogs/es.ts`
- `packages/i18n/src/catalogs/fr.ts`
- `packages/i18n/src/index.ts` only if new typed keys require it.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a small demo adapter that calls the pure continuation function using the
  existing deterministic demo career facts.
- Keep the demo adapter as the replacement point for future real-save
  continuation.
- Update the dashboard `Continue` button behavior:
  - disabled when the action contract says it is unavailable;
  - when available, calls the continuation adapter;
  - shows the resulting stop state on the dashboard.
- If missing preparation already blocks the career, stop immediately and show
  that no days were advanced.
- Add localized labels for:
  - continue;
  - stopped because preparation is required;
  - stopped on matchday;
  - days advanced;
  - attention required.
- Keep visible strings out of component literals.
- Add focused web tests for the Continue action.

## What NOT to implement

- Do not build the match preparation screen.
- Do not save continuation results to disk or browser storage.
- Do not simulate the fixture.
- Do not add calendar browsing.
- Do not add market, contract, youth, staff, or economics events.
- Do not parse CLI output.
- Do not add hidden recommendations.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/i18n run typecheck`
- Focused i18n tests when label keys change.
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The dashboard has a visible, localized Continue action.
- Continue uses structured career continuation behavior.
- The dashboard clearly reports why advancement stopped.
- No real save persistence or hidden career decisions are introduced.
- `docs/PROJECT_STATUS.md` records Step 06 as complete or blocked.
