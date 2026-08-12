# Step 06C1 - Conditioned Response And Formation Concentration Attribution

## Status

Done: `OWNER_IDENTIFIED`. `lateral_route_leverage` owns the tactical failure in
both seed sets. Formation concentration is `mixed`: unique positive selector
fits and finite-sample concentration both hold, while the preregistered
single-identity rule does not. No gameplay changed and Phase 2 did not run.

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
difference of either real shape is at least `500 bp`. Shape capacities are
bounded shares stored as doubles, not fixed-point integers: the reader converts
each absolute difference with `Math.round(difference * 10_000)` and compares
that integer to `500`. This correction is recorded before attribution output;
the threshold itself does not move. Reachability must be shown on generated
matchups.

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
  other declared competitions, and only the two observed rows cross the band.
  Operationally, exactly two rows fail, both fail only `top_formation_share`,
  and every sister competition in the same world and seed set passes the full
  frozen opening gate; because the balanced allocator gives every sister row
  the same eight-identity support, that is the declared same-identity control;
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

## Result

The seven-worker profile reproduced B2 exactly and returned process exit `0`
with canonical `NOT_EVALUATED`: attribution succeeded, but the B2 gate remains
red. All `61,236` candidate factor rows reconcile to the canonical payoff.

Within each tactic, `balanced` wins every materially asymmetric context:
`126 / 126` in-sample and `252 / 252` out-of-sample for all three tactic rows.
The tactic-magnitude and exact-interaction rules are false; the shared owner is
`lateral_route_leverage`.

The twelve `4-4-2` selections in the two failed leagues are unique maxima with
positive margins. Both failed rows are one club above the band and every sister
division passes. `selection_fit` and `sampling_variance` therefore both hold.
The single-identity rule does not: the selections split evenly between
`wide_midfield_stock` and `double_width_stock`. A new follow-up may test that
two-identity family without rewriting this step after output.

Canonical artifact:
`simulation-out/phase81a-checkpoint-b2-1-attribution.json`, SHA-256
`4fde527a9024c357a1ed5038307ed63c83b79bc2740cf78730f117f1497e829e`.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-attribution.ts`
  and test **(new)**. The decomposition is kept separate from the canonical B2
  gate while consuming only its retained rows;
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts` and test
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-b2-attribution.ts`
  and test **(new)**. Content-owned identity and selector facts are joined at
  the CLI composition boundary, never imported into simulation-tools;
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/PHASE_81A_CHECKPOINT_B2_1_ATTRIBUTION.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `06c1a-formation-identity-family-concentration-attribution.md` **(new)**
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
