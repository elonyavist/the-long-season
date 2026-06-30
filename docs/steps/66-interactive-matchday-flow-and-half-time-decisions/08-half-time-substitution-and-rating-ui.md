# 08 - Half-Time Substitution And Rating UI

## Goal

Make half-time a useful decision screen: the manager sees who is playing well,
who is tired, and can make substitutions before the second half.

## Scope

Add half-time UI for:

- current score;
- first-half key events;
- provisional player ratings;
- condition/fitness facts;
- selected club lineup and bench;
- substitution picker:
  - outgoing on-pitch player;
  - incoming bench player;
  - validation feedback;
- applied substitutions summary;
- start second-half action.

Use existing tactical/bench components where they fit, but do not force the
full tactical board into half-time if it makes the interaction heavy. This
screen should be fast and clear.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add full tactical-board editing at half-time unless the step becomes
  blocked without it.
- Do not add team talks.
- Do not add in-match substitutions outside half-time.
- Do not add automatic selected-club decisions.
- Do not add opponent UI decisions.
- Do not persist substitutions beyond current in-memory demo state.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- The user can understand first-half performance from ratings/events/condition.
- The user can make at least one valid half-time substitution.
- Invalid substitutions are rejected with localized feedback.
- The second half uses the declared substitution state.
- The screen remains fast to use and does not become another dense log page.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
