# 03 - Half-Time Snapshot And Player Ratings Foundation

## Goal

Create deterministic player ratings and half-time match facts based on
structured football events, not random cosmetic numbers.

## Scope

Add a pure engine rating/snapshot module that derives:

- live/provisional rating at half-time;
- final rating at full time;
- basic player match involvement summary;
- event contribution markers:
  - goals;
  - assists;
  - shots;
  - shots on target;
  - saves;
  - blocks;
  - visible mistakes/misses where current structured facts support them;
- selected-club first-half condition snapshot where existing state facts allow
  it;
- team score and event summary by phase.

Rating design constraints:

- deterministic;
- bounded;
- explainable from structured facts;
- no hidden random bonus;
- no prose inside engine;
- no fake data when the current report lacks a fact.

The rating formula can be simple in v1, but it must be football-plausible and
tested. For example, a goalkeeper with saves should improve, a goal scorer
should improve, and a player involved in repeated poor attacking outcomes should
not get inflated just from volume.

## Expected files

- `packages/engine/src/match-engine/player-match-rating.ts`
- `packages/engine/src/match-engine/player-match-rating.test.ts`
- `packages/engine/src/match-engine/staged-match-progression.ts`
- `packages/engine/src/match-engine/staged-match-progression.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add UI.
- Do not localize ratings here.
- Do not add random rating noise.
- Do not invent event facts that the match report does not contain.
- Do not model injuries, cards, or advanced morale effects unless existing
  structured facts already support them.
- Do not tune match result balance.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/player-match-rating.test.ts
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Done when

- Half-time and full-time snapshots expose player ratings as structured facts.
- Rating tests cover scorer, assister, goalkeeper saves, quiet player baseline,
  and deterministic ordering.
- Ratings are documented as v1 derived facts, not final balance truth.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
