# 12 - Matchday Full-Time Compact Result

## Goal

Rebuild full time as a compact football result screen with clear consequences.

The user should understand the result, key events, player ratings, and final
state changes without reading a raw log.

## Scope

- Rebuild full-time phase presentation.
- Scoreboard/result is dominant.
- Key events use visual cards.
- Player table is useful and scrollable.
- Consequences appear only at full time.
- One primary action returns to the dashboard/continue flow.

## What NOT to implement

- No new match events.
- No season-table update redesign.
- No post-match interview.
- No persistence.
- No debug log table.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Finish a match.

Acceptance:

- full-time result feels like football, not diagnostics;
- events and player rows are scannable;
- condition/state consequences are understandable;
- only one final action is prominent;
- no raw event dump dominates the screen.

Stop after this step for user approval before continuing.

## Definition of Done

- Full-time screen matches the new broadcast language.
- Consequences are separated from live match phases.
- Status and roadmap are updated.
