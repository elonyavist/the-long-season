# Step 06B11 - Table-Hierarchy Population-Strength Correction

## Status

**Done on 2026-08-09.** The first-division senior population hierarchy is
widened inside the existing rarity lanes; no match or lower-division rule moved.

## User-Facing Goal

Strong clubs should win more often because their footballers are genuinely
better, while surprise seasons remain possible. No club receives points,
goals or match probability from its division label or expected rank.

## Entry Evidence

The paired L5.1 replay held calendars, players, selections and random streams
constant and scaled only centred kickoff-strength gaps by `1.5`. First-division
spread moved `40.8143 -> 47.6000` and PPG deviation `0.3284 -> 0.3894`, both
crossing their historical lower bounds. Draw reduction was only `0.0109`, so
the owner is `population_strength`, not match translation or draw resolution.

Production inspection found the precise compression. `applyTierModifier(...)`
deliberately truncates inside the division rarity lane: a positive tier offset
raises the lower edge and a negative one lowers the upper edge. The current
truncation produces only two thirds of the population distance required by the
paired attribution.

## Frozen Correction

Strengthen the existing within-lane truncation for **first-division seniors**
by exactly `1.5 x`. The first
implementation attempt translated the complete band and was rejected by the
full gate before any checkpoint: it created natural six-star and wage-budget
violations. Keeping both edges inside the original lane is therefore a product
invariant, not a calibration inconvenience. Use these offsets:

| Tier | Current effective mean shift | New truncation offset |
|---|---:|---:|
| title contender | `+1.25` | lower edge `+3.75` -> mean `+1.875` |
| playoff contender | `+0.40` | lower edge `+1.20` -> mean `+0.60` |
| mid-table | `-0.40` | upper edge `-1.20` -> mean `-0.60` |
| survival | `-1.00` | upper edge `-3.00` -> mean `-1.50` |

Every new mean shift is `1.5 x` the current effective one. This consumes the
causal scale measured by 06B10C without tuning against the 06B12 output.
Division/rareness bounds, role buckets, archetype adjustments, rarity budgets
and the match engine remain unchanged.

A second focused pre-check rejected applying the scale to every population:
it made a Second Division youth ceiling infeasible and raised Third Division
wages beyond their existing policy. That was outside the attributed population.
Youth bands and every Second/Third Division band therefore remain byte-identical.

## What NOT To Implement

- no tier, reputation, rank or division term in match outcomes;
- no direct team-strength multiplier;
- no change to goals, draw rate, tactics, selection or RNG;
- no Big Five target applied to Second or Third Division;
- no save migration: existing player abilities remain facts and are never
  reinterpreted.

## Expected Files

- `packages/content/src/generators/player-current-ability-bands.ts` and tests;
- `packages/content/src/generators/fake-players.test.ts` for generated-world
  reachability of the widened hierarchy;
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`: the shared canonical-world
  identity hash moves because first-division player abilities are identity
  facts. Both sides must move in the same edit or the record proves nothing;
- this step, phase README and `docs/PROJECT_STATUS.md`;
- the next checkpoint document only after this implementation is green.

## Required Checks

- exact range-translation tests at all four tiers;
- real generated first-division top/survival lineup hierarchy remains ordered
  and materially wider;
- generation rarity and role-coherence tests remain green;
- `pnpm check` alone, `git diff --check`, `graphify update .`.

## Exit

Implementation green opens Checkpoint L5.2. Only its locked `7 x 2` cohort may
say whether the population correction is sufficient.

## Verification

- focused generation/rarity/potential/finance suite: `7` files, `55` tests;
- real first-division starting-XI role-quality edge exceeds `2.5`;
- the rejected full-band translation failed natural-six, wage and youth-ceiling
  invariants and was removed rather than re-recorded;
- shared CLI/web identity hash moved together to `0268597d`;
- `pnpm check`: `302` files, `2318` tests, `874` modules, exit `0`;
- `git diff --check` and graph update are repeated with checkpoint closeout.
