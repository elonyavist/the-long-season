# 10 - Durable Matchday Checkpoints And Full-time Commit

## Goal

Persist the staged match at meaningful decision checkpoints and commit full
time exactly once.

## Scope

- Start pre-match from loaded durable preparation.
- Build the pre-match and every later matchday phase from the loaded career's
  selected club, fixture, roster, saved XI, bench, and tactic. Production must
  never fall back to the demo club, fixture, or players.
- Persist active checkpoint after entering pre-match and after reaching
  half-time.
- Persist half-time substitutions and tactical changes before second-half
  progression.
- Rehydrate pre-match/half-time/full-time presentation from structured saved
  facts.
- At full time, atomically:
  - apply fixture result;
  - apply condition/form/morale consequences;
  - clear the active match checkpoint;
  - retain the final structured report/history required by current state;
  - save the next career stop.
- Make repeated full-time/refresh actions idempotent.
- Replace `matchday-demo` production ownership and delete obsolete branches
  once all callers use the runtime.

## What NOT to implement

- No persistence for every simulated minute.
- No animated playback state in the save.
- No rendered commentary persistence.
- No extra time, penalties, injuries, cards, or team talks.
- No direct storage calls from React components.

## Expected files

- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `packages/engine/src/career/active-match-checkpoint.ts`
- `packages/engine/src/career/active-match-checkpoint.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/11-demo-runtime-removal-and-production-path-cleanup.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/runtime apps/web/src/features/matchday apps/web/src/stores/career-ui-store.test.ts packages/engine/src/career/active-match-checkpoint.test.ts packages/engine/src/career/progress-fixture.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
```

## Visual check for the user

Refresh once at pre-match, once at half-time after a substitution, and once
after full time.

Acceptance:

- the pre-match club, opponent, fixture, XI, bench, and tactic are the exact
  facts from the loaded save, with no `matchday-demo` identities;
- each refresh returns to the correct phase;
- half-time decisions remain applied;
- full-time result and consequences are not duplicated;
- returning to dashboard shows the next correct career state.

## Definition of Done

- Meaningful match checkpoints survive refresh.
- Full-time commit is atomic and idempotent.
- Matchday no longer depends on production demo state.
- Deterministic uninterrupted and resumed results match.
