# 03 - Web Demo Matchday Adapter And Store Flow

## Goal

Connect the web in-memory career flow to real engine fixture progression so the
selected club can play its prepared next fixture from the browser.

## Scope

Implement a web demo adapter and Zustand actions that:

- start from the current demo career/preparation state;
- require complete saved lineup, bench, and tactic before play;
- call the real career fixture progression path, not CLI output;
- store the played match result and updated career state in memory;
- expose a single-use `playMatchdayFixture` style action;
- prevent duplicate play of the same fixture from double-applying consequences;
- rebuild dashboard/Inbox/Posta view data from the updated in-memory state.

This step may add a `matchday` feature folder but should keep it small and
adapter-focused.

## Expected files

- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not build the visual matchday screen yet.
- Do not add browser persistence.
- Do not mutate engine input objects directly.
- Do not parse CLI strings.
- Do not silently auto-complete missing preparation.
- Do not hide blockers when lineup, bench, or tactic is incomplete.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Store tests prove incomplete preparation blocks matchday play.
- Store tests prove complete preparation can play the selected fixture exactly
  once.
- Store tests prove dashboard data changes after the match.
- The adapter boundary is documented and easy to replace with the Phase 66 real
  save adapter.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
