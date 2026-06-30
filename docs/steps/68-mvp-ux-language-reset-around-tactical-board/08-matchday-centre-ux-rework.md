# 08 - Matchday Centre UX Rework

## Goal

Rework matchday so it feels like a football-manager match centre instead of a
log/report table.

## Scope

Implement the approved matchday direction:

- compact dominant scoreboard;
- period state: pre-match, first half, half-time, second half, full time;
- visual event timeline/cards instead of raw log feel;
- useful player rating/condition table;
- half-time tactical workspace entry that reuses the approved board language;
- full-time consequences separated from live match information;
- one primary action per phase.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/styles/*.css`
- `packages/ui/src/career/career-matchday-phase-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change match outcomes.
- Do not add live replay.
- Do not add team talks.
- Do not add cards/injuries/extra time/penalties.
- Do not add persistence.
- Do not make consequences appear during live phases.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
git diff --check
```

## Done when

- Matchday no longer reads as a debug log.
- Player ratings and condition are useful during half-time decisions.
- Full-time consequences are clearly post-match only.
- The phase still uses structured engine/UI facts only.
