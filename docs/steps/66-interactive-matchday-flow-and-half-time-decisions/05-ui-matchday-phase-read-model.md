# 05 - UI Matchday Phase Read Model

## Goal

Replace the Phase 65 result-only read model with a phase-aware matchday view
contract that can drive pre-match, first-half, half-time, second-half, and full
time screens.

## Scope

Add or revise `@game/ui` contracts for:

- match phase status;
- scoreboard facts;
- active period label keys;
- visual timeline event rows;
- key event cards;
- half-time snapshot facts;
- player rating rows:
  - player;
  - club;
  - role/position if available;
  - rating;
  - condition;
  - core event counts;
  - status;
- half-time substitution action state;
- full-time-only consequence rows;
- next action facts.

The read model must keep visible copy as keys/data, not rendered prose. It must
remain usable by web and future presentation surfaces.

## Expected files

- `packages/ui/src/career/career-matchday-phase-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.test.ts`
- `packages/ui/src/career/career-matchday-view.ts`
- `packages/ui/src/career/career-matchday-view.test.ts`
- `packages/ui/src/career/index.ts`
- `packages/ui/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not import engine into `packages/ui`.
- Do not import React, web, storage, content, or i18n into `packages/ui`.
- Do not render localized prose here.
- Do not include consequences before full time.
- Do not invent event/rating facts when missing.
- Do not implement web UI yet.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run packages/ui/src/career/career-matchday-view.test.ts
pnpm --filter @game/ui run typecheck
git diff --check
```

## Done when

- Tests cover pre-match, first-half, half-time, second-half, and full-time view
  states.
- Tests prove consequences appear only at full time.
- Tests prove half-time substitution actions are visible only at half-time.
- Read-model TSDoc explains which layer owns engine facts, UI facts, and
  presentation.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
