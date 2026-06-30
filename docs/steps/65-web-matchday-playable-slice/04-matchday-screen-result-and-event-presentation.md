# 04 - Matchday Screen Result And Event Presentation

## Goal

Add the first web matchday screen: pre-match context before play, then result,
events, player stats, and consequences after play.

## Scope

Build a focused matchday screen that:

- is reachable from the app state once matchday attention is active;
- shows selected club, opponent, round, home/away, and preparation status;
- offers one clear "Play match" action when the fixture is playable;
- shows final score after play;
- shows key match events from structured facts;
- shows basic player stats in a compact table;
- shows condition, form, and morale changes as factual rows;
- shows the next available action after the result, usually return to
  dashboard/continue;
- uses localized labels and existing visual identity tokens.

The screen should feel like a manager matchday report, not a generic SaaS
dashboard.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.tsx`
- `apps/web/src/app/App.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/components.css`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not animate the match.
- Do not add in-match decisions.
- Do not add substitutions.
- Do not create an opponent tactical board.
- Do not add long narrative prose.
- Do not overbuild a reusable table library unless the existing app already has
  the pattern.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.tsx
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Done when

- The screen renders blocked, ready-to-play, and played states.
- The result state includes score, key events, player stats, and player-state
  consequences from the read model.
- Labels are localized and no user-facing reusable label is hardcoded.
- UI layout is responsive enough for desktop and narrow browser QA in Step 06.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
