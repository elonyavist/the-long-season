# 11 - Matchday Half-Time Board Decision

## Goal

Make half-time feel like a real manager decision moment.

The user should see first-half context, provisional player signals, and the
shared tactical board for substitutions/formation changes.

## Scope

- Rebuild the half-time phase layout.
- Reuse the tactical board and bench.
- Show key first-half events as cards, not log lines.
- Show player rows focused on decision-making: rating, condition, role, events,
  and status where available.
- Keep one primary action to start the second half.

## What NOT to implement

- No team talks.
- No new match engine facts.
- No opponent board.
- No hidden automatic selected-club decision.
- No second tactical-board implementation.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/features/tactics-board/**` only for imports/composition if
  needed; do not modify logic.
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday
pnpm exec vitest run apps/web/src/features/tactics-board
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Run a match to half-time and inspect the decision screen.

Acceptance:

- half-time is clearly a pause;
- tactical board is usable and visually stable;
- player information helps substitution decisions;
- there is no noisy log-table layout;
- start second half is the single main action.

Stop after this step for user approval before continuing.

## Definition of Done

- Half-time decision screen is usable and visually coherent.
- Board behavior remains intact.
- Status and roadmap are updated.
