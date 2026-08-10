# Step 06B12E - Final Table Owner Correction

## Status

Done on 2026-08-09. 06B12F owns the final table verdict.

## User-Facing Reason

League tables should separate clubs because better squads consistently create
small advantages, while the match model should keep a believable number of
goals without manufacturing draws. This is the last numeric correction in the
table tranche; another failed validation stops it rather than starting a tuning
loop.

## Frozen Correction

- advance First Division `2.0 -> 2.25`, keep Second `1.0`, and move Third
  `1.25 -> 1.3`. The initially declared `1.5` and then `1.4` Third-Division
  steps were rejected before validation because a real generated squad crossed
  the existing EUR 500k annual-wage guardrail; the guardrail was not relaxed;
- keep all senior values inside authored rarity lanes and every youth scale at
  `1.0`;
- use one shared, approximately one-percent conversion correction:
  `0.0575/0.110/0.193` for low/medium/high quality;
- preserve opportunity volume, actor choice, on-target logic, keeper contest,
  RNG draw count and result application.

The values are frozen before any 06B12F output. They are the next discrete
semantic step from the hierarchy-only evidence, not a fitted optimizer.

## What NOT To Implement

- no direct draw resolver, score rewrite, rank bonus or division-specific match
  probability;
- no further numeric candidate after 06B12F;
- no age, origin, formation or transfer term;
- no target change or beta compatibility residue.

## Expected Files

- `packages/content/src/generators/player-current-ability-bands.ts` and tests;
- `packages/content/src/generators/gameplay-config.ts` and tests;
- real generation, wage, rarity, ceiling and report-histogram tests;
- shared CLI/web identity hash tests, together;
- this step, 06B12D, phase README and project status;
- next validation document only.

## Required Checks

Focused owner tests, real reachability, `pnpm check`, `git diff --check`, and
`graphify update .`.

## Implementation Evidence

- real Third-Division report remains fully reconciled at `127/223/46/0`;
- shared CLI/web canonical identity hash moves together to `ee653cba` after the
  wage-safe scale;
- all focused generation, wage, rarity and ceiling checks remain green.
- `pnpm check`: `302` files, `2326` tests, `874` modules, exit `0` after
  rejecting the wage-breaking `1.5/1.4` Third-Division candidates.
