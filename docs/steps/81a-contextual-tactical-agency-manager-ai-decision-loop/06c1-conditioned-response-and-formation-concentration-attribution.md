# Step 06C1 - Conditioned Response And Formation Concentration Attribution

## Status

Ready. Checkpoint B2 recorded `REFINE`: both seed sets contain material local
cycles and three best responses, but `high_pressing|balanced` covers about two
thirds of contexts and two out-of-sample competitions exceed the local
formation-concentration gate. This step is observational. It moves no gameplay
coefficient and does not run Phase 2.

## Goal

Identify the smallest real owner of both B2 failures before changing the
engine:

1. separate tactic magnitude, lateral-route leverage and their interaction;
2. separate squad identity, formation selector fit and finite-sample
   concentration in the two `4-4-2 = 6 / 18` rows.

## Frozen Evidence

Reuse the exact B2 populations, seeds, first-round fixtures, one production AI
selection per club and complete `9 x 9` response matrices. A fresh canonical
report may recompute those facts, but no context, seed or failed row may be
selected after reading output. In-sample and out-of-sample remain separate.

Every matchup fact must retain the minimum join keys required for attribution:
world, competition, own club, opponent club, own generated identity, opponent
identity, own selected formation and opponent selected formation. IDs are
evidence; names are presentation only.

## Tactical Attribution

Report, separately per seed set:

- best-response counts by own formation, opponent formation and ordered
  formation pair;
- best-response counts by opponent tactic and opponent lateral focus;
- for each own tactic, how often `balanced`, `left` and `right` are best;
- for each lateral focus, how often each tactic is best;
- payoff deltas of `left-balanced` and `right-balanced`, both overall and only
  in materially asymmetric shape contexts;
- the analytic components already consumed by the canonical payoff: control,
  volume, route saturation, allocation and route quality. These are one
  decomposition of the existing calculation, never a second payoff formula.

A matchup is materially asymmetric only when the absolute left/right capacity
difference of either real shape is at least `500 bp` in the existing
fixed-point capacity scale. This threshold is frozen before output and its
reachability must be shown on generated matchups.

### Frozen owner rules

- `lateral_route_leverage`: within at least two of the three tactic rows,
  `balanced` remains best in `>= 80%` of materially asymmetric contexts in both
  seed sets, while the tactic winner itself is not stable across all focuses;
- `tactic_magnitude`: the same tactic wins in `>= 80%` of contexts separately
  under `left`, `balanced` and `right` in both seed sets;
- `interaction`: neither marginal rule holds, but one exact tactic/focus pair
  owns `>= 60%` of contexts in both sets;
- `mixed`: more than one marginal rule holds or the sets assign different
  owners;
- `unresolved`: no rule reaches its frozen floor.

The report also states which analytic component first separates
`high_pressing|balanced` from `direct_play|balanced`. It may name a candidate
owner only when the sign is coherent in at least `5 / 7` worlds in each set.

## Formation-Concentration Attribution

For every population row, retain formation counts by generated squad identity.
For the two failed competitions and their same-seed sister divisions, report:

- the identities of all clubs selecting `4-4-2`;
- each identity's modal formation and `4-4-2` share across all fourteen worlds;
- selector score margin and tie count for every `4-4-2` selection;
- exact per-competition excess above the frozen `0.30` share.

### Frozen owner rules

- `squad_chart`: one generated identity accounts for `>= 80%` of `4-4-2`
  selections in each failed row and selects `4-4-2` in `>= 80%` of its
  appearances in both seed sets;
- `selection_fit`: no identity owns the failure, but the `4-4-2` selections
  have unique best scores and a positive median best-minus-second margin;
- `sampling_variance`: the same identities and selector behaviour pass in the
  other declared competitions, and only the two observed rows cross the band;
- `mixed` or `unresolved`: the evidence does not satisfy one rule cleanly.

`sampling_variance` records ownership but does not turn the frozen population
gate green. A later population checkpoint must still pass it unchanged.

## Decision

- `OWNER_IDENTIFIED`: both failures receive one coherent owner, or one receives
  `mixed` with the exact contributing owners quantified. Open one correction
  step per demonstrated product owner.
- `REFINE`: facts are complete but an owner floor is missed; refine only this
  attribution instrument.
- `STOP / RETHINK`: the retained facts cannot reproduce B2, a join changes a
  formation or response, or the decomposition does not reconcile to the
  canonical payoff.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts` and test
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/PHASE_81A_CHECKPOINT_B2_1_ATTRIBUTION.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `06c-checkpoint-b2-conditioned-tactical-ceiling.md`
- `README.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-attribution --workers=7
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The report reproduces B2, reconciles every decomposition with its canonical
payoff, names or rejects each owner through the frozen rules, and leaves all
gameplay unchanged. No correction step is designed from a qualitative reading
of the output.
