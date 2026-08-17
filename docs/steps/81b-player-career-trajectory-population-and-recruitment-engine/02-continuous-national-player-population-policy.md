# Step 02 - Continuous National Player Population Policy

## Status

Not started.

## Goal

Make opening seniors, academies and annual intake adapters to one continuous,
long-tailed population Module without special star creation lanes.

## What To Implement

- Before shared edits, run Graphify affected for:
  - `generateFakePlayersForClubs`;
  - `generateSeasonalYouthIntakePlayers`;
  - `generateCareerIntakePlayers`;
  - `buildAnnualWorldIntakeCeilingAllocation`;
  - `buildContextualProspectJointProfile`.
- Implement `PlayerPopulationPolicy` behind one small Interface described in the
  design contract.
- Use one seeded continuous latent-quality draw with a long tail. Use
  piecewise/lookup/linear deterministic math; no engine imports or
  transcendentals in hot generation paths.
- Separate latent quality from readiness/current ability. Division and
  composition context shape readiness independently.
- Select maturation/longevity profiles from versioned policy with independent
  stable substreams.
- Implement deterministic national high-tail opportunity rotation converging
  to `3:2:1` over D1/D2/D3. Equal clubs in a division have reorder-invariant
  base access.
- Keep club identity responsible for role/profile mix only.
- Reuse the policy from all three composition roots. They may choose age,
  quantity, role and context; they may not choose stars or exact latent tier.
- Keep intake quantity self-regulation separate from quality sampling.
- Preserve role-coherent attribute generation and hard caps.
- Replace and delete special annual five/six allocation, top-up and desired
  ceiling inputs once no caller remains.
- Remove stale exports, fixtures, config keys, diagnostics and i18n labels in
  the same step.
- Add real-data search tests proving lower-division rare tail, ordinary/depth
  mass, profile variety and every direction of the allocation rule.

## What NOT To Implement

- No forecast probability or market behavior.
- No per-club talent guarantee.
- No quality rubber-banding from missing elite stock.
- No academy-quality advantage.
- No exact annual `3:2:1` quota.
- No second population formula in opening/intake adapters.

## Expected Files

- `packages/content/src/generators/player-population-policy.ts` **(new)**
- `packages/content/src/generators/player-population-policy.test.ts` **(new)**
- one precisely named versioned policy asset under
  `packages/content/src/balance/` and its loader/schema tests **(new; path fixed
  in this document before implementation)**
- one precisely named domain validation contract under
  `packages/domain/src/balance/` and its test **(new; path fixed before edit)**
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/generators/player-prospect-joint-profile.ts`
- `packages/content/src/generators/player-prospect-joint-profile.test.ts`
- `packages/content/src/generators/player-current-ability-bands.ts`
- `packages/content/src/generators/player-current-ability-bands.test.ts`
- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-generation-bands.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/generators/player-potential-allocation.ts` and test
- `packages/content/src/generators/player-potential-rarity.ts` and test
- `packages/content/src/generators/player-rarity-budget.ts` and test
- `packages/content/src/generators/annual-intake-role-plan.ts` and test only if
  Graphify proves its requested-role Interface must change
- `packages/content/src/index.ts`
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only if the code census changes
  ownership
- this step and Step 03 if measured realities change its population
- `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm --filter @game/content test
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

Focused real-data tests must show:

- all ability tiers intended by the policy are reachable in the aggregate;
- D1/D2/D3 readiness ordering;
- lower-division elite latent tail is non-zero over declared search corpus;
- club/catalog reorder invariance;
- `3:2:1` long-run direction and each division's positive high-tail access;
- no public star/ceiling assignment input exists in production generation;
- opening and intake call the same population owner.

## Definition Of Done

- One population law serves every creation path.
- Current readiness and latent quality are independent dimensions.
- Special star lanes/top-ups have no caller/export/config residue.
- Checkpoint A is the only next action; forecast/engine work remains closed.
