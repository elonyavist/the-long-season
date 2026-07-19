# Step 11 - Aging, Physical Decline, Potential Compression, And Exits

## Status

Done.

## Attempt Notes

- Added one engine-owned monthly aging policy for active players.
- Outfield physical decline now starts at age `32`; age `31` remains a
  maintenance/peak boundary.
- Goalkeepers use a separate later curve: no goalkeeper decline at `34`, with
  mobility/footwork decline beginning later and core goalkeeper decline later
  still.
- Active current physical attributes are floored at `7`; non-physical
  attributes are not blanket-floored.
- Potential is compressed after monthly aging through age-feasible reachable
  room, hard role caps, and `current <= potential`; valid potential never
  increases.
- Player exits now use role-shaped quality instead of raw diagnostic average
  and protect already thin squads from non-retirement exits while retaining
  hard retirement thresholds.
- Youth lifecycle no longer implies invented development without real
  participation facts.
- Long-run player evolution now exposes how many tracked players have lower
  remaining potential room at the end of the run.

## Verification

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-aging-policy.test.ts packages/engine/src/career/player-development.test.ts packages/engine/src/career/player-exits.test.ts packages/engine/src/career/player-season-rollover.test.ts packages/engine/src/career/youth-lifecycle.test.ts packages/simulation-tools/src/long-run/player-evolution.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
```

All required checks passed with Node `24.16.0`.

## Goal

Make aging reduce realistic abilities and reachable ceilings while producing
credible retirement and replacement pressure across long careers.

## Inspectable Outcome

- Outfield physical decline starts from age `32`.
- Goalkeepers have a separate later curve.
- Active-player physical values never fall below `7`.
- Potential stays at least current, may compress, and never increases.
- Old players leave active squads before the world accumulates implausible
  ageless careers.

## Scope

1. Add explicit monthly decline curves by age band, broad role group, and
   attribute family.
2. Begin outfield physical decline at age `32`; keep age `31` as peak or
   maintenance unless another current rule already causes bounded decline.
3. Define a later goalkeeper peak/decline curve backed by role-specific tests.
4. Apply the floor `7` to all five current physical attributes for active
   players.
5. Keep mental and technical decline separate from physical decline.
6. Compress potential to the age-feasible reachable ceiling after growth and
   decline, while enforcing `current <= potential` and non-increasing
   potential.
7. Align exit/retirement decisions with age, role current ability, roster need,
   and deterministic replacement capacity.
8. Preserve selected-club safeguards already required by career ownership.
9. Delete old seasonal decline curves and incompatible exit assumptions.

## Expected Files

- `packages/engine/src/career/player-aging-policy.ts`
- `packages/engine/src/career/player-aging-policy.test.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/career/player-exits.ts`
- `packages/engine/src/career/player-exits.test.ts`
- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-lifecycle.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/long-run/player-evolution.ts`
- `packages/simulation-tools/src/long-run/player-evolution.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No blanket percentage reduction across every attribute.
- No physical decline before age `32` for outfield players.
- No potential increase to repair an invalid state.
- No contract expiry, wage, injury, medical, testimonial, or retirement UI.
- No immortality caused by the physical floor.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-aging-policy.test.ts packages/engine/src/career/player-development.test.ts packages/engine/src/career/player-exits.test.ts packages/engine/src/career/player-season-rollover.test.ts packages/engine/src/career/youth-lifecycle.test.ts packages/simulation-tools/src/long-run/player-evolution.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
```

## Completion Criteria

- Age-31/32 boundary, old-outfield, old-goalkeeper, floor, potential-compression,
  and retirement examples pass.
- No old seasonal decline path remains.
- Long-run player population can renew without age collapse.
- Step 12 is the single next action.
