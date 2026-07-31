# Step 02 - Dynamic Club Tier, Reputation And Season Freeze

## Status

Not started.

## Goal

Replace generation-only club-number tiers with one durable, deterministic
competitive tier and gradually changing reputation recalculated at season
rollover.

## Accepted Semantics

- Per 18-club division: ranks `1..4` title contender, `5..8` playoff,
  `9..14` mid-table, `15..18` survival.
- Tier score is approximately `70%` current roster strength and `30%`
  just-completed sporting result, with explicit promotion/relegation/title
  correction.
- Stable club ID breaks exact ties.
- Tier is frozen for the full next season.
- Current reputation is the only historical memory.
- Reputation moves toward its new target by at most `2` points per rollover.
- No reputation-history collection is stored.

## What To Implement

- Add canonical domain types/state for current competitive tier and its season.
- Derive roster strength from canonical best-XI plus useful bench facts.
- Derive and normalize the completed-result component.
- Recalculate tier after promotion/relegation resolves.
- Update reputation with the bounded convergence rule.
- Route generation, finance, market, and later environment consumers away from
  club-number tier inference where a career tier exists.
- Persist/round-trip the new compatible state.
- Bump the owning beta save version and delete incompatible saves rather than
  migrate them.

## What NOT To Implement

- No environment multiplier, player growth, prospect tuning, public
  projection, valuation, or UI.
- No historical reputation rows, moving averages, or hidden prestige history.
- No five-country policy.

## Expected Files

- `packages/domain/src/entities/club.entity.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/career/club-competitive-tier.ts`
- `packages/domain/src/career/index.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/promotion-relegation.ts`
- `packages/engine/src/career/promotion-relegation.test.ts`
- `packages/engine/src/career/club-season-tier.ts`
- `packages/engine/src/career/club-season-tier.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- beta save/schema/version owners discovered in Step 01
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/club-season-tier.test.ts \
  packages/engine/src/career/promotion-relegation.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Every active club has exactly one current tier for the active season.
- `4/4/6/4`, tie-break, promotion/relegation ordering, and season freeze pass.
- Reputation changes by at most two and no historical collection exists.
- Incompatible beta saves are deleted without compatibility debris.
- Step 03 is the only next action.
