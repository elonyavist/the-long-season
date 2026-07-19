# Step 06 - Youth Generation And Rarity Pipeline Consolidation

## Status

Done.

## Goal

Route initial academies and seasonal youth intake through the same validated
player assembly pipeline without weakening the youth-specific population and
rarity rules.

## Inspectable Outcome

- Senior and youth players share construction invariants but not inappropriate
  quality distributions.
- Every academy still contains exactly 11 players after refill with one
  goalkeeper, four defenders, four midfielders, and two attackers.
- Youth remain age 15-19, seasonal arrivals remain almost always 15-17, and
  lower-division prospects carry potential rather than immediate dominance.
- Elite/high/interesting/ordinary rarity remains explicit and division-first.

## Scope

1. Migrate initial-youth and seasonal-intake player assembly to the generated
   player factory from Step 05.
2. Keep academy composition, age policy, department allocation, club youth
   reputation, division priority, and rarity budget in dedicated youth policy.
3. Consume canonical role profiles and validated construction.
4. Preserve deterministic IDs, names, nationality, archetypes, current ability,
   potential, and random draw order where valid.
5. Add tests for exact academy composition, age bounds, no duplicate player,
   potential/current invariants, role coherence, and per-division rarity caps.
6. Compare initial academy and multi-season refill distributions to the Step 01
   baseline.
7. Delete youth-local copies of construction and potential-clamp logic.

## Implementation Contract

- Shared assembly does not mean shared senior/youth quality bands.
- A strong lower-division youth player may have high role potential but must
  not start as a first-division-ready senior.
- `elite` remains often zero and globally capped by current division-season
  budget; `high` remains rare; `ordinary` remains the majority.
- User-club promotion behavior is not changed.
- Academy population is not increased to solve quality distribution.

## Expected Files

- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/player-potential-rarity.ts`
- `packages/content/src/generators/player-potential-rarity.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-intake.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No academy-size or department-composition redesign.
- No promotion/release/market-decision change.
- No facilities, staff, scouting, or user-facing youth UI.
- No guaranteed wonderkid.
- No rarity threshold relaxation.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/generated-player-factory.test.ts packages/content/src/generators/initial-youth-academies.test.ts packages/content/src/generators/player-potential-rarity.test.ts packages/content/src/generators/player-rarity-budget.test.ts packages/content/src/generators/player-generation-quality.test.ts packages/engine/src/career/youth-intake.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Remove the youth-local duplicated assembly/potential helpers after exact
composition and distribution tests pass. Preserve only youth policies with a
distinct current football purpose.

## Completion Criteria

- Initial and seasonal youth use the common validated assembly path.
- Youth population, role mix, age, rarity, and lower-division quality gates
  remain credible.
- No youth-specific duplicate of domain construction/algebra remains.
- Fixed-seed reports match the allowed baseline contract.
- Step 07 is the single next action.
