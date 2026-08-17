# Step 05 - Development, Aging, Injury And Retirement Realization

## Status

Blocked behind Step 04.

## Goal

Make current ability evolve from latent trajectory without mutable-ceiling
ratchets, with base training, bounded opportunity, differentiated aging, rare
permanent serious-injury damage and mandatory retirement at 37.

## What To Implement

- Graphify affected for `monthlyDevelopmentPolicy`,
  `developPlayersFromParticipationRows`, `applyPlayerAgingPolicy`, injury
  consequence owner and `applyEndOfSeasonPlayerExits`.
- Add one trajectory realization function used by monthly development.
- Ensure eligible active players receive base training even with zero match
  participation. Use real lifecycle months; do not synthesize report rows.
- Keep opportunity, performance, environment and variance as bounded
  multipliers. Prove maximum minutes cannot exceed the policy cap.
- Derive growth room/window by ability family from current, trajectory, date and
  damage. Never mutate latent facts.
- Replace aging potential compression with current-ability decline only.
- Use one versioned role/family maturation/decline register. No copied curve in
  engine/report/UI.
- Preserve deterministic monthly ordering and record it in tests.
- Add rare permanent physical damage downstream of serious injury using
  canonical match/career consequence facts. Both damage and no-damage outcomes
  must be reachable on real data. Ordinary injuries remain temporary.
- Add season-end mandatory retirement for completed age `>=37`; preserve
  earlier stochastic exits and squad maintenance.
- Replace/remove diagnostics named potential compression. Add structured
  realization, decline and damage facts only when non-derivable later.
- Mutation tests:
  - zero-minute base training removal is caught;
  - latent mutation is caught;
  - opportunity cap removal is caught;
  - physical damage leaking into technical/mental is caught;
  - age-37 survivor is caught.

## What NOT To Implement

- No direct goals/assists/selection age modifier.
- No automatic permanent damage for every serious injury.
- No loan bonus.
- No AI market behavior.
- No second lifecycle or report-side formula.

## Expected Files

- `packages/engine/src/career/player-development-policy.ts` and test
- `packages/engine/src/career/player-development.ts` and test
- `packages/engine/src/career/player-aging-policy.ts` and test
- `packages/engine/src/career/advance-career-month.ts` and test
- `packages/engine/src/career/advance-career-season.ts` and test
- `packages/engine/src/career/player-exits.ts` and test
- `packages/engine/src/player-state/completed-player-age.ts` and test
- `packages/engine/src/match-engine/match-injury.ts` and test only when
  Graphify confirms this owner must emit the serious-injury branch
- `packages/domain/src/match/match-consequence.ts` and focused test only for
  non-derivable permanent-damage facts
- `packages/domain/src/career/player-availability.ts` and test only if its
  persisted contract changes
- `packages/engine/src/career/match-availability-consequences.ts` and test
- `packages/engine/src/career/career-match-state-consequences.ts` and test
- `packages/domain/src/balance/player-state-curves.ts` and test
- `packages/content/src/balance/player-state-curves.ts` and test
- `packages/content/src/balance/player-state-curves.json`
- `packages/content/src/balance/player-development-environment.json` only if
  the canonical realization policy consumes a changed versioned field
- `packages/engine/src/index.ts`
- exact old potential-compression diagnostic owners/tests named by `rg` and
  Graphify, copied into this list before deletion
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only if production truth changes
  ownership or a preregistered formula before measurement
- this step and Step 06; `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine test
pnpm --filter @game/domain test
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

- Development consumes trajectory through one Interface.
- Latent facts never change during advancement.
- Base training, bounded acceleration, family aging and rare damage are real
  reachable branches.
- No potential ratchet/helper/diagnostic remains.
- Age-37 season-end retirement is absolute and tested.
- Checkpoint B is the only next action.
