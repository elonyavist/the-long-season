# Step 06C1A - Formation Identity-Family Concentration Attribution

## Status

Done: `IDENTITY_FAMILY`. The unique minimum family is
`double_width_stock + wide_midfield_stock`: it covers `100%` of both failed
rows and selects `4-4-2` in `86.67% / 85.71%` of complete-population
appearances. All covered selections are unique maxima. No gameplay changed.

## Goal

Decide whether a stable family of at most two generated squad identities owns
the `4-4-2` concentration tail, or whether the two red rows are only a local
sample crossing among otherwise unrelated selector decisions.

## Frozen Method

Reuse the exact B2.1 populations and club selections. For each failed row,
enumerate identity subsets in canonical key order and choose the minimum-cardinal
subset covering at least `80%` of its `4-4-2` selections. A family is stable
only when the same minimum subset:

- covers at least `80%` in every failed row;
- contains at most two identities;
- has a combined `4-4-2` selection share of at least `80%` in both complete
  seed sets;
- does not rely on a tie (`tiedAtBestCount` stays `1` for every covered choice).

The `80%` floor is the unchanged B2.1 owner floor. The only generalization is
from one identity to the minimum set, declared because the first attribution
observed a split owner. No threshold, seed, failed row or formation may move.

## Decision

- `IDENTITY_FAMILY`: one stable family satisfies every rule. A content-owned
  correction may diversify one member while preserving all Step 06A role,
  identity and formation gates.
- `SAMPLING_ONLY`: no stable family exists and every sister division remains
  green. No content change is authorized; only a fresh unchanged population
  checkpoint can clear the red.
- `REFINE`: more than one minimum family or incomplete evidence prevents a
  unique owner.
- `STOP / RETHINK`: B2.1 does not reproduce exactly.

## Result

B2 and B2.1 reproduce. The minimum two-identity family covers all twelve
failed-row selections and is the only qualifying minimum subset. Complete-set
shares are `78 / 90` and `84 / 98`. The canonical artifact is
`simulation-out/phase81a-checkpoint-b2-1a-identity-family.json`, SHA-256
`c0a498bac32d6a3464bb3a3d59870a26eae41bfcc259376b218a46ea8047d6cc`.

The correction owner is `double_width_stock`: `wide_midfield_stock` already
expresses its name through full-backs, wide midfielders and a strike pair;
`double_width_stock` promises wing-backs plus advanced width but currently
supplies another four-midfielder/two-striker skeleton. The next step may change
only that chart and must let the canonical selector choose freely afterward.

## Expected Files

- `apps/cli/src/commands/simulation-report/tactical-agency-b2-attribution.ts`
  and test
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/PHASE_81A_CHECKPOINT_B2_1A_IDENTITY_FAMILY.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `06c1-conditioned-response-and-formation-concentration-attribution.md`
- `README.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-identity-family --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-1a-identity-family.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The minimum family is unique or explicitly rejected, both frozen seed sets are
reported, B2.1 is reproduced, and no formation, identity chart, selector score
or threshold changes inside this observational step.
