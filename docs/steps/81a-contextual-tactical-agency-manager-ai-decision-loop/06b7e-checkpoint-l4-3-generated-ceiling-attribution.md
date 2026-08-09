# Step 06B7E - Checkpoint L4.3: Generated-Ceiling Attribution

## Status

Done: `OWNER_IDENTIFIED`. Development realization is the owner in `7/7`
worlds; generation quality is explicitly absolved.

## Goal

Separate a weak generated ceiling from failed realization before any prospect
frequency, potential band or development curve can change.

## Frozen Population And Measures

- same seven canary worlds, ten seasons, three competitions, seven workers;
- fresh cache; L4.2 production behaviour is the baseline;
- for each division, record:
  - opening senior current-ability median at world creation;
  - P90 stored role-potential ability of every accepted annual academy intake
    at entry;
  - season-ten P90 current ability of mature annual academy cohorts generated
    in seasons `1..6`;
- use `summarizePlayerDevelopmentAbilities(...)`, the canonical role measure;
  no raw-average, public-projection or reconstructed archetype table;
- median and P90 use nearest-rank quantiles on the sorted exact abilities;
- unknown division/role, empty denominators and potential-below-current are
  instrumentation failures.

## Frozen Attribution

- classify each world from its three divisions, requiring at least two matching
  division readings; the cohort owner requires the same class in `5/7` worlds;
- **generation_quality:** annual intake potential P90 is below the opening
  senior current median;
- **development_realization:** potential P90 clears the median but mature
  current P90 falls below it;
- **downstream_selection_or_outcome:** both P90 measures clear the median while
  the L4.2 renewal target remains broken;
- **REFINE:** any denominator or reconciliation failure prevents attribution.

A complete but heterogeneous result without a `5/7` owner is `STOP / RETHINK`,
not permission to average away division or world differences.

No threshold is a GO target for gameplay. This checkpoint only names the next
owner; it cannot authorize 06B8.

## Expected Files

- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test;
  the existing observer records the three canonical distribution summaries
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test only for
  checkpoint dispatch
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; one locked `7 x 10 x 7` diagnostic profile/cache
- `packages/i18n/src/labels.ts`; visible profile name in all five locales
- `docs/audits/PHASE_81A_CHECKPOINT_L4_3_GENERATED_CEILING_ATTRIBUTION.md` **(new)**
- `docs/audits/README.md`
- this document, phase README, 06B8 and `docs/PROJECT_STATUS.md`

## Required Command

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-generated-ceiling-l4-3-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-generated-ceiling-l4-3-7x10.json
```

## Definition Of Done

One owner is attributed on complete denominators. Only a separately documented
implementation and repeated renewal checkpoint can open 06B8.

## Recorded Outcome And V9 Revalidation

- report: `simulation-out/phase81a-generated-ceiling-l4-3-7x10.json`;
- canonical v9 report hash: `95232b66a9ef55f0d8371face4fb613a`;
- owner: `downstream_selection_or_outcome` in `5/7` worlds and
  `development_realization` in `2/7`;
- denominator failures: `0`; every world exposed all three divisions;
- first-division intake potential P90: `15.03..15.20`, against opening-senior
  medians `13.08..13.21`;
- first-division mature-current P90: `11.73..12.62`;
- all `21` rows match L5 byte-for-byte; frozen input signature
  `6ef3c51a7717bb39ff86e66be6629848`.

The historical pre-development run identified realization in `7/7`; the fresh
v9 rerun proves that repair moved the residual owner downstream. Generation and
development are absolved for the cohort; L5 owns the consultable stop before a
new selection/outcome step is designed.
