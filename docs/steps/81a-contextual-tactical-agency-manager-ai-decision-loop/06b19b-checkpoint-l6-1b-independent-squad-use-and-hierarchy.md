# Step 06B19B - Checkpoint L6.1B: Independent Squad Use And Hierarchy

## Status

**Done on 2026-08-11.** The fresh `28 x 10` returned two independent results:
`L6.1B-S = REFINE` and `L6.1B-H = GO: owner_identified:
population_strength`. The process exit is `1` because the report shell fails
closed when either lane is not `GO`; it is not a third merged scientific
decision.

## TESI

The failed pre-06B16 control has no causal relationship with two questions
about the current product: whether usable squad depth is lost at match-day
selection, and whether population strength is translated too weakly into the
table. A fresh current-only cohort can answer both without importing the broken
historical counterfactual. The two answers share world facts for efficiency but
own separate canonical checkpoints, failures and follow-up authorization:
`L6.1B-S` for squad use and `L6.1B-H` for hierarchy.

This step changes no football behaviour. Its squad-use result identifies the
first structural stage with enough real players to meet the historical use
bands; it does not claim that an arbitrary rotation rule will realize them. Its
hierarchy result reuses the existing paired strength replay and cannot invent a
new coefficient.

## Prerequisites And Frozen Before-State

- Step 06B19A is Done with `STOP / RETHINK`.
- Current-product completion was `28/28`; this is viability evidence only.
- L6.1A diagnostics were `matchday_selection` in `28/28` and
  `population_strength` in `28/28`; both must reproduce on new seeds.
- Historical targets remain solely in the A6 register. This step may not copy
  their numeric literals into a second target table.
- The squad-use observer and paired hierarchy replay already exist in production
  report code. This step adds no second selector, season simulator or formula.

## Locked Population

One profile, current product only:

```text
profile: phase81a-independent-owners-l6-1b-28x10
seed prefix: phase81a-independent-owners-l6-1b-v1
worlds: 28
seasons: 10
workers: exactly 7
detail: diagnostic
format: json
```

`28` is retained from the preregistered powered cohort: it is the first whole
seven-worker batch whose planning half-width resolves the frozen `0.5` champion-
points floor, and it matches the existing `20/28` squad-owner rule. Shrinking to
seven after observing `28/28` coherence would weaken the instrument.

The profile rejects world, season, seed and worker overrides. Its checkpoints
use a new ignored directory and cannot read or overwrite L6.1A shards.

Before the full run, a locked `7 x 1` canary on a separate prefix proves:

- the new profile dispatches through `simulation-report`;
- ordinary current and observer-disabled shadow projections are bit-identical
  after removing declared analysis fields;
- candidate >= available >= selector pool >= match-day >= appeared for every
  club-season row;
- both decision sections are present, cannot read one another's result and have
  `balanceDecision = not_evaluated`.

Canary balance values are never evidence.

## What To Implement

### One shared observation, two lane decisions

Reuse `createCareerWorldProjection(...)`, the existing squad-use observations,
`evaluateSquadUseAttribution(...)`, the paired `analysisStrengthGapScale = 1.5`
facts and `tableHierarchyOwner(...)`. The canonical checkpoint contains:

- `execution`: profile identity, seed prefix, worlds, seasons, actual workers,
  scenario failures and reconciliations;
- `squadUseLane`: current bands, per-world stage owners, pooled structural limit,
  own decision and own failed keys;
- `hierarchyLane`: current and paired table metrics, per-world owner, historical
  guardrails, own decision and own failed keys.

There is no combined `decision` or `failedGateKeys`. Execution failure stops
both checkpoints because neither has a complete population; after successful
execution each records exactly one of `GO`, `REFINE` or `STOP_RETHINK` and is
independent of the other's result.

### Squad-use decision

Use the shared historical register readers; do not restate `0.48..0.58` or
`26..31` in this evaluator.

- `GO` with `outcome = no_correction`: both current-product bands hold and
  reconciliation is zero.
- `GO` with `outcome = owner_identified`: at least one current band is red; one
  structural owner appears in at least `20/28` worlds, strictly exceeds the
  runner-up, and the pooled structural limit at that stage places both bands
  inside their register bands.
- `REFINE`: a red family remains but no unique stage can clear both bands.
- `STOP_RETHINK`: missing worlds, nonzero reconciliation, broken nesting or
  observer purity mismatch.

An `owner_identified` result authorizes one owner-specific design step. It does
not authorize a chosen fatigue penalty, minimum-appearance quota or forced
substitution. That design's immediate canary must demonstrate changed real
participations, minutes and lineup quality on paired matches.

### Hierarchy decision

Reuse the frozen table owner and no-new-distance guardrail readers.

- `GO` with `outcome = owner_identified` requires the frozen pooled owner
  `population_strength`, a healthy paired champion delta above the existing
  `0.5` floor in at least `20/28` worlds, the paired cohort mean inside the exact
  First-Division register band, and all five historical guardrails held;
- `GO` with `outcome = no_correction` requires the current cohort itself inside
  the register and records that the L6.1A miss did not recur;
- `REFINE` covers a persistent red family without the frozen owner;
- execution, reconciliation or purity failures are `STOP_RETHINK`.

Only `GO: owner_identified: population_strength` can open 06B20C. The correction
step must choose a football-facing rule from the strength model, not solve a
coefficient by inverting the observed points delta.

## Output And Audit

Commands:

```bash
pnpm cli simulation-report \
  --profile=phase81a-independent-owners-l6-1b-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-independent-owners-l6-1b-canary-7x1.json

pnpm cli simulation-report \
  --profile=phase81a-independent-owners-l6-1b-28x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-independent-owners-l6-1b-28x10.json
```

After execution create
`docs/audits/PHASE_81A_CHECKPOINT_L6_1B_INDEPENDENT_OWNERS.md` with raw values,
per-world owner counts, both decisions, hashes, real exit codes, wall time and
reproduction commands. Index it in `docs/audits/README.md`.

## Outcome

The `7 x 1` canary completed in `73` seconds with exit `0`. Its ordinary and
observer-disabled shadows matched in all seven worlds and both balance lanes
were `not_evaluated`, as required.

The full cohort completed all `28` worlds and `280` seasons in `4,705` seconds
with exactly seven workers. Reconciliation failures were zero in both lanes.

### L6.1B-S - squad use

| Measurement | Current | Structural limit | Frozen band |
| --- | ---: | ---: | ---: |
| appearance share | `0.6488947620` | `0.5751526659` | `0.48..0.58` |
| distinct users per club-season | `23.0255952381` | `25.9777777778` | `26..31` |

`matchday_selection` was the unique owner in `28/28` worlds, and the structural
limit repaired appearance share. It missed the distinct-user floor by
`0.0222222222`, however. The frozen rule requires both bands to hold; therefore
the canonical decision is `REFINE: not_attributed`, not a rounded-up owner.
This keeps 06B20D closed. A later design may improve the match-day realization
path only after a new preregistered causal instrument distinguishes a real
policy effect from the denominator's near-boundary result.

### L6.1B-H - hierarchy

`population_strength` was the pooled and table owner, with a healthy paired
effect in `28/28` worlds. Mean First-Division champion points moved from
`71.4714285714` to `76.7428571429`; all five no-new-distance guardrails held and
reconciliation was zero. The canonical decision is therefore
`GO: owner_identified: population_strength`, opening only 06B20C.

The canonical JSON hashes and exact reproduction commands are in
[`PHASE_81A_CHECKPOINT_L6_1B_INDEPENDENT_OWNERS.md`](../../audits/PHASE_81A_CHECKPOINT_L6_1B_INDEPENDENT_OWNERS.md).

## Verification

- focused checkpoint/owner/planner suite: `57` tests passed;
- canary: exit `0`; full checkpoint: scientific exit `1` from the squad lane;
- final repository gate shared with 06B19C: `305` files and `2372` tests passed,
  `878` modules with zero dependency violations, all custom checks and
  workspace typechecks green;
- `git diff --check` and final Graphify rebuild are part of the 06B19C
  closeout on the same uncommitted tree.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts` and test: compose
  the two independent lane decisions from already-owned world facts;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test: only
  if a shared total evaluator is required; existing fact formulas and owner
  readers must be reused, not copied;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and registry/
  planner tests: two locked profiles, fixed corpus and new cache identities;
- `packages/i18n/src/labels.ts`: profile discovery labels in all five languages;
- this step, the phase README, the decision-disentanglement tranche and
  `docs/PROJECT_STATUS.md`;
- after execution only,
  `docs/audits/PHASE_81A_CHECKPOINT_L6_1B_INDEPENDENT_OWNERS.md` and
  `docs/audits/README.md`.

No engine, content, market, match policy, target register, HTML, save schema or
web file is expected. If inspection proves a non-derivable fact is missing, add
its true owner here with the reason before editing it.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/simulation-report/owner-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/career-sections.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm cli simulation-report --profile=phase81a-independent-owners-l6-1b-canary-7x1 --workers=7 --format=json --report-output=simulation-out/phase81a-independent-owners-l6-1b-canary-7x1.json
pnpm cli simulation-report --profile=phase81a-independent-owners-l6-1b-28x10 --workers=7 --format=json --report-output=simulation-out/phase81a-independent-owners-l6-1b-28x10.json
pnpm check
git diff --check
graphify update .
```

The canary, full checkpoint and `pnpm check` run alone. Capture the real command
exit code without a pipe.

## What NOT To Implement

No gameplay coefficient, rotation penalty, forced appearance, squad expansion,
injury change, strength multiplier, market/blueprint arm, historical control,
target move, extra seed after output, second report command or duplicate reader.

## Definition Of Done

- the fresh current cohort completes `28/28` with exactly seven workers;
- observer purity and every nesting/reconciliation check hold;
- both named checkpoints return one canonical, independent decision;
- an owner opens only its own conditional step;
- the squad result is explicitly structural, not claimed as realized gameplay;
- no gameplay changes and no dead analysis code enter the tree;
- focused tests, `pnpm check`, diff-check and Graphify are green;
- step, audit, phase README and project status agree.
