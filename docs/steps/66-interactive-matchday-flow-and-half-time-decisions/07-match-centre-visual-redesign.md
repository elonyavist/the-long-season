# 07 - Match Centre Visual Redesign

## Goal

Replace the report/table-log matchday screen with a serious football-manager
match centre.

## Scope

Redesign `CareerMatchdayScreen` around:

- compact dominant scoreboard;
- clear current phase panel:
  - pre-match;
  - first half;
  - half-time;
  - second half;
  - full time;
- visual event timeline instead of a plain log list;
- event cards with hierarchy and minimal icons;
- useful player table:
  - player;
  - rating;
  - condition;
  - role/position;
  - key contribution counts;
  - status;
- full-time-only consequences area;
- clear primary action:
  - start first half;
  - go to half-time decisions when stopped;
  - start second half;
  - return to dashboard after full time.

The UI must fit the accepted retro-premium football identity. It must not look
like a generic SaaS dashboard or a debug report.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change engine behavior.
- Do not add substitution UI yet.
- Do not add global theme palettes.
- Do not add live animation-heavy viewer.
- Do not show consequences before full time.
- Do not hardcode visible labels outside i18n.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Done when

- Tests cover visible phase actions and full-time consequence placement.
- The event area is no longer a raw table/log list.
- The scoreboard is visually dominant but compact.
- Player rows prioritize rating/condition/contribution over raw stat clutter.
- Labels are localized in all five supported languages.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
