# 06 - Web Demo Staged Matchday Adapter And Store Flow

## Goal

Connect the web demo matchday adapter and Zustand store to the staged engine
flow without adding persistence.

## Scope

Update the web matchday demo flow so the browser can:

- enter pre-match;
- start/play first half;
- stop at half-time;
- expose half-time facts and actions;
- apply manager-declared substitutions;
- start/play second half;
- reach full time;
- return to an updated dashboard.

The adapter must still call real engine/domain functions and must not parse CLI
output. It may remain in memory because persistence is still deferred until the
matchday experience is good enough to preserve.

## Expected files

- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add localStorage or save adapter persistence.
- Do not redesign the UI in this step.
- Do not add automatic substitutions for the selected club.
- Do not add live animations.
- Do not create a full Tactics screen.
- Do not add cup extra-time/penalty flow.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Tests drive the browser store from pre-match to half-time to full time.
- Tests prove half-time is a real stop before full-time simulation.
- Tests prove declared substitutions are passed through the adapter.
- Tests prove full-time dashboard state still updates after the staged flow.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
