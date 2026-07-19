# Step 10 - Related-Role Exposure And Familiarity Progression

## Status

Done.

## Attempt Notes

- Added one domain-owned related-role exposure graph with directional
  football-safe edges and explicit `adapted`/`natural` ceilings.
- Added a role-familiarity mutation helper that updates the player's familiarity
  buckets without changing primary role, archetype, abilities, or potential.
- Added one engine-owned monthly role-adaptation consumer that reads only open
  participation-ledger played-role minutes, ignores tiny samples, and applies
  weak-to-adapted or adapted-to-natural progression after sustained exposure.
- Integrated role adaptation into the monthly development checkpoint before the
  processed participation months are closed.

## Verification

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/player/player-role-profile.test.ts packages/domain/src/entities/player.entity.test.ts packages/engine/src/career/player-role-adaptation.test.ts packages/engine/src/career/player-development.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
```

All required checks passed with Node `24.16.0`.

## Goal

Let sustained real minutes in a related role improve familiarity slowly without
rewriting a player's primary role or archetype.

## Inspectable Outcome

- A center back repeatedly used at full back can progress from weak to adapted
  familiarity after sufficient credible exposure.
- Unrelated roles cannot be learned through accidental or tiny samples.
- Primary role and archetype remain stable.

## Scope

1. Define one canonical related-role adjacency contract in domain.
2. Derive exposure exclusively from the participation ledger's played-role
   minutes.
3. Add deterministic thresholds for weak-to-adapted and adapted-to-natural only
   where the role relation permits it.
4. Require sustained multi-month exposure; ignore tiny emergency samples.
5. Preserve asymmetry where football meaning requires it, such as center back
   to full back versus center back to winger.
6. Apply familiarity updates at monthly checkpoints after participation closes.
7. Keep tactical suitability derived from current familiarity and role ability.
8. Persist through the current role-familiarity storage path without a second
   role model.

## Expected Files

- `packages/domain/src/player/player-role-profile.ts`
- `packages/domain/src/player/player-role-profile.test.ts`
- `packages/domain/src/entities/player.entity.ts`
- `packages/domain/src/entities/player.entity.test.ts`
- `packages/engine/src/career/player-role-adaptation.ts`
- `packages/engine/src/career/player-role-adaptation.test.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/index.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No instant role change, primary-role rewrite, archetype rewrite, or manual
  retraining UI.
- No familiarity gain without real played-role minutes.
- No arbitrary all-to-all role graph.
- No attribute growth duplicated inside role adaptation.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/player/player-role-profile.test.ts packages/domain/src/entities/player.entity.test.ts packages/engine/src/career/player-role-adaptation.test.ts packages/engine/src/career/player-development.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
```

## Completion Criteria

- Related-role exposure has one canonical graph and one progression path.
- Sustained exposure changes familiarity; unrelated/tiny exposure does not.
- Player identity remains stable and storage round trip passes.
- Step 11 is the single next action.
