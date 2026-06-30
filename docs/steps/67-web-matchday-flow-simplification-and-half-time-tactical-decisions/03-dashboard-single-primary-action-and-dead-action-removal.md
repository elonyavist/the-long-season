# 03 - Dashboard Single Primary Action And Dead Action Removal

## Goal

Make the dashboard a clean command centre with one meaningful primary action
and no dead available buttons.

## Scope

Update the dashboard read model and web screen so:

- dashboard primary action is the manager's next real action;
- `Prepare match` is primary when preparation is incomplete;
- `Go to match` is primary when preparation is complete and the fixture is
  ready;
- `Continue` is primary only when there is no immediate preparation/matchday
  action;
- dead actions such as inspect squad, inspect lineup, inspect tactic, and
  inspect table are not shown as available until those sections exist;
- action list is removed or reduced to genuinely useful secondary actions;
- dashboard remains the centre of the career flow.

## Expected files

- `packages/ui/src/career/build-career-dashboard-view.ts`
- `packages/ui/src/career/build-career-dashboard-view.test.ts`
- `packages/ui/src/career/career-dashboard-actions.ts`
- `packages/ui/src/career/career-dashboard-actions.test.ts`
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/build-demo-career-dashboard.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add Squad/Tactics/Table pages.
- Do not leave invisible or unreachable available actions in the read model.
- Do not keep duplicate dashboard CTAs for the same action.
- Do not change match simulation.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/build-career-dashboard-view.test.ts
pnpm exec vitest run packages/ui/src/career/career-dashboard-actions.test.ts
pnpm exec vitest run apps/web/src/features/dashboard/build-demo-career-dashboard.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Dashboard has one primary next action.
- No dashboard action is marked available without a useful handler.
- The warm path from prepared dashboard to pre-match is obvious.
- Tests prove missing-preparation, ready-matchday, and post-match states.
