# Step 07 - National Exceptional Stock And Annual Youth Intake

## Status

Not started.

## Goal

Maintain credible exceptional-player stock and sustainable annual youth supply
without multiplying ceiling-six prospects per club, division, or intake.

## Accepted Semantics

- National stock: `2..3` established current-six players in credible
  first-team slots at strong Serie A clubs.
- Active age-15-to-20 stored-ceiling-six stock: `4..5`.
- The young count includes senior, academy, free-agent, and loaned players.
- At most one young ceiling-six player is outside Serie A.
- At most one belongs to any club.
- Annual intake tops up vacancies; it does not create four or five new
  ceiling-six players each season.
- No existing player is deleted/downgraded to meet the target.
- Future five-country composition invokes this policy once per country.

## What To Implement

- Centralize one national exceptional-stock allocator across initial senior and
  academy generation.
- Reconcile the annual stock before per-club intake generation and allocate
  only eligible top-up slots.
- Make environment a bounded probability input for interesting/serious
  prospects while exceptional ceilings remain world-budgeted.
- Preserve exact academy size/refill, age-out, promotion, external movement,
  release, and retirement facts.
- Add explicit JSDoc at the national composition root describing future
  country reuse and forbidding multiplication by five inside the current
  one-country world.
- Add diagnostics/tests for full active-stock counting, placement, club
  uniqueness, multi-season replacement, and no inflation.

## What NOT To Implement

- No five-country runtime, youth league UI, facilities, staff, or guaranteed
  intake star.
- No routine rare prodigy outside the national allocation.
- No value/AI change and no `50 x 20`.

## Expected Files

- `packages/content/src/generators/domestic-world.ts`
- `packages/content/src/generators/domestic-world.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/youth-development-level.ts`
- `packages/content/src/generators/youth-development-level.test.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-intake.test.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-lifecycle.test.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/generators/domestic-world.test.ts \
  packages/content/src/generators/player-rarity-budget.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/career-intake-players.test.ts \
  packages/content/src/generators/youth-development-level.test.ts \
  packages/engine/src/career/youth-intake.test.ts \
  packages/engine/src/career/youth-lifecycle.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Initial and annual supply share one national stock owner.
- Young six-ceiling stock, category placement, and per-club uniqueness pass
  with positive observations.
- `3.5+` category bands remain plausible without fixed annual sameness.
- Academy refill sustains the population without world inflation.
- Step 08 is the only next action.
