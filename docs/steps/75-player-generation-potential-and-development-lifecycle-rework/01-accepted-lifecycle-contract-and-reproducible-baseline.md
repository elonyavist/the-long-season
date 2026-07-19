# Step 01 - Accepted Lifecycle Contract And Reproducible Baseline

## Status

Done.

## Goal

Turn the accepted product decisions into measurable invariants and capture the
current fixed-seed behavior before changing generation or development code.

## Inspectable Outcome

- One audit maps every current coefficient, age curve, potential gap, monthly
  or seasonal trigger, participation fact, role-familiarity path, exit rule,
  save field, and long-run metric.
- The audit includes the concrete invalid examples that motivated the phase.
- Baseline commands and hashes are reproducible under Node 24.

## Scope

1. Confirm Phase 74 completion and use its final report as the structural
   starting point.
2. Record current profiles and potential gaps for representative ages, roles,
   divisions, and club tiers.
3. Reproduce examples equivalent to age-26 stamina `4.5 -> 12.5`, crossing
   `4.3 -> 9`, or pace `10 -> 18` when present.
4. Map the current once-per-season development and decline curves.
5. Map where starts, minutes, substitutions, ratings, and played roles exist or
   are discarded.
6. Map AI lineup reuse and squad-participation distribution over one season.
7. Record current youth rarity, academy inputs, exits, retirement proxies, and
   10/30/50-season player-population behavior.
8. Record the accepted beta-save reset and package ownership decisions.
9. Define exact invariant and distribution checks for Steps 02-15.

## Expected Files

- `docs/audits/PLAYER_LIFECYCLE_REWORK_BASELINE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## What NOT To Implement

- No source, schema, coefficient, threshold, RNG, or output change.
- No guessed target chosen only because the current value looks untidy.
- No old-save deletion before Step 06 establishes the new baseline.
- No Phase 74 blocker fix hidden inside this audit.

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli simulate-season --seed=phase75-baseline-a --player-generation-report
pnpm cli simulate-season --seed=phase75-baseline-b --player-generation-report
pnpm cli career --save=phase75-baseline-a --seed=phase75-baseline-a --new-world-preview
pnpm cli career --save=phase75-baseline-a --development-report
pnpm cli ten-season-report --seed-prefix=phase75-baseline --worlds=50 --seasons=10 --report-output=/tmp/phase75-baseline-50x10.md
git diff --check
```

## Completion Criteria

- Every later policy has a named owner and measurable acceptance rule.
- Baseline commands, seeds, outputs, and known anomalies are recorded.
- No production behavior changed.
- Step 02 is the single next action.
