# 10 - Matchday Broadcast Pre-Match And Phase Frame

## Goal

Replace the matchday debug/report feeling with a broadcast-style match centre
frame.

This step implements the pre-match and phase shell only: scoreboard, phase
context, primary action, and layout skeleton.

## Scope

- Rebuild `CareerMatchdayScreen` around `CareerMatchdayPhaseView`.
- Scoreboard is compact and dominant.
- One primary action controls the current phase.
- Timeline/feed areas are framed for later steps.
- Consequences are not shown before full time.

## What NOT to implement

- No engine changes.
- No new event kinds.
- No full-time result redesign yet.
- No half-time board decision UI yet.
- No log-table feed.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts` if a small
  presentation helper is needed.
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Navigate from prepared match to pre-match.

Acceptance:

- the screen feels like a match centre, not a table dump;
- the next action is obvious;
- scoreboard dominates without wasting vertical space;
- no consequences are mixed into live match state.

Stop after this step for user approval before continuing.

## Definition of Done

- Pre-match frame uses the new broadcast language.
- It still consumes existing phase-view facts.
- Status and roadmap are updated.
