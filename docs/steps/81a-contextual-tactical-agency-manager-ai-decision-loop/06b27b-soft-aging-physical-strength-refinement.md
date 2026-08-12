# Step 06B27B - Soft Aging Physical-Strength Refinement

## Status

Done - implemented, measured, rejected and removed.

The focused/full gates passed before measurement. L6.7B did not produce a
monotone assist or trajectory response, so the original shipped aging policy is
restored and no analysis profile remains.

## TESI

L6.7 proves the direction but not enough magnitude. Do not move technical or
mental decline earlier again: experience should remain a route for exceptional
veterans. Strengthen only the already-reachable physical decline.

## Frozen Refinement

- maximum monthly decline `0.045 -> 0.060`;
- physical multipliers: `<30 = 0`, `30-31 = 0.55`, `32-33 = 0.85`,
  `34-35 = 1.00`, `36+ = 1.40`;
- first skill-decline ages and all technical/mental multipliers stay exactly as
  accepted in 06B27;
- goalkeeper curve, floor, potential compression, growth, fatigue, injuries,
  retirement, selection, market and RNG remain unchanged.

A player at 30 loses physical tools progressively, not eligibility. High
technical/mental quality and deterministic variance can still sustain a rare
older leader.

## Expected Files

- `packages/engine/src/career/player-aging-policy.ts` and test;
- generated-world aging reachability test;
- 06B27C, phase README and status.

## Required Checks

Focused tests and full `pnpm check` alone before L6.7B runs.
