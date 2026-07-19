# Step 02 - Current-Profile Generation And Physical-Floor Policy

## Status

Done.

## Goal

Generate a player's current profile from role, division, club tier, age, and
attribute family before any reachable potential is allocated.

## Inspectable Outcome

- Current ability no longer depends on potential or a monolithic archetype
  uplift.
- Generated physical attributes respect the active-player floor of `7`.
- Role-irrelevant attributes remain bounded by canonical role caps.
- Third-division players remain visibly weaker than first-division leaders.

## Scope

1. Add one content-owned current-profile policy with explicit age, division,
   club-tier, role, and family inputs.
2. Keep canonical role weights and hard caps in domain; do not duplicate them.
3. Treat all five current physical attributes consistently with floor `7` for
   generated active players.
4. Preserve rare advanced youth traits, including a plausible age-18 pace `14`,
   without making the whole profile senior-ready.
5. Remove numeric current-ability offsets from generated archetypes when the
   new policy replaces them; retain archetype identity only if still consumed.
6. Route senior, later-career intake, initial-youth, and seasonal-youth current
   profiles through the policy in the same step.
7. Add distribution tests by role, age, division, and club tier.
8. Keep Step 03 as the only owner of new potential allocation behavior.

## Expected Files

- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-generation-bands.test.ts`
- `packages/content/src/generators/player-current-ability-bands.ts`
- `packages/content/src/generators/player-current-ability-bands.test.ts`
- `packages/content/src/generators/player-role-templates.ts`
- `packages/content/src/generators/player-role-templates.test.ts`
- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-archetypes.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No potential rebalance beyond maintaining `potential >= current` until Step
  03 replaces the allocator.
- No global configuration package or second role table.
- No match, development, market, UI, or storage behavior.
- No blanket first-division values applied to lower divisions.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/player-current-profile-policy.test.ts packages/content/src/generators/player-generation-bands.test.ts packages/content/src/generators/player-current-ability-bands.test.ts packages/content/src/generators/player-role-templates.test.ts packages/content/src/generators/player-archetypes.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/career-intake-players.test.ts packages/content/src/generators/initial-youth-academies.test.ts packages/content/src/generators/generated-player-factory.test.ts
pnpm --filter @game/content run typecheck
pnpm cli simulate-season --seed=phase75-current-a --player-generation-report
pnpm cli simulate-season --seed=phase75-current-b --player-generation-report
pnpm depcruise
git diff --check
```

## Completion Criteria

- All four player producers use one current-profile policy.
- Generated current profiles pass role, age, division, club-tier, cap, and
  physical-floor checks.
- Replaced numeric archetype policy is deleted.
- Step 03 is the single next action.
