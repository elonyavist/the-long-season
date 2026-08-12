# Step 06B27 - Soft Earlier Outfield Aging

## Status

Done - implemented and green; L6.7 measured directional but insufficient effect.

## TESI

The game should let a rare veteran remain excellent, but should not let a whole
opening generation improve through its thirties and block ten-season stories.
L6.4 shows the owner directly: every world has a positive mean ability delta for
opening seniors still leading at season ten (`+0.243..+0.964`). Academy supply,
senior-quality development and minutes already work.

Move only the soft outfield aging curve earlier. Do not retire players, cap
leaderboards, penalize selection by age, alter potential, add injuries, change
growth, or change the market.

## Frozen Product Curve

- maximum monthly decline remains `0.045`; physical floor remains `7`;
- outfield physical multiplier: `<30 = 0`, `30-31 = 0.35`, `32-33 = 0.65`,
  `34-35 = 1.00`, `36+ = 1.40`;
- first technical/mental decline age moves one year earlier: attacker `33`,
  defender `34`, midfielder `35`;
- technical multipliers remain `0.18` before age 36 and `0.32` from 36;
- mental multipliers remain `0.08` before age 37 and `0.16` from 37;
- goalkeeper curve, potential compression, RNG stream, rounding and traversal
  order remain byte-identical.

This preserves football stories: physical decline creates room for rotation,
while accumulated technical and mental quality can keep exceptional veterans
valuable.

## Reachability

Real trajectory tests must prove: no outfield decline at 29; physical decline at
30; attacker skill decline at 33; midfielder skill preservation at 34 and
decline at 35; goalkeeper behavior unchanged. A generated-player trajectory,
not only a hand-built fixture, must cross the new branch.

## Expected Files

- `packages/engine/src/career/player-aging-policy.ts` and test;
- `apps/cli/src/commands/simulation-report/aging-curve-reachability.test.ts`:
  generated-world reachability of every new branch;
- `apps/cli/src/commands/simulation-report/role-aware-market-reachability.test.ts`:
  removal of the rejected L6.6 reachability residue;
- this step, 06B27A, phase README and status.

No market, intake, growth, retirement, injury, fatigue, lineup, match, economy,
save or HTML behavior changes here.

## Required Checks

Focused engine tests, real-data reachability, typecheck, dependency check,
`git diff --check`, then `pnpm check` alone.

## Outcome

All implementation checks passed: `310` files and `2431` tests. The new branch
is reachable on generated players. L6.7 then showed a real but insufficient
effect: late-career scorer share fell `0.4667 -> 0.4016` and assist share
`0.3873 -> 0.3460`, while the opening-senior leader ability delta moved only
`+0.5429 -> +0.5035` and remained positive in `7/7` worlds. Generated leader
share fell `0.2595 -> 0.2452`. L6.7 therefore owns the REFINE; 06B27B changes
only physical magnitude.
