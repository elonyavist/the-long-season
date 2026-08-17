# Step 12E - Canonical Own-Squad Plan Execution Contract

## Status

**Done.** D2 translation attribution named `plan_execution_not_established` in
both untouched sets. The correction and fresh E/F gate are frozen before
gameplay code; Step 12F owns implementation.

## Player-Facing Thesis

A specialised plan should help when the selected eleven can execute what it
asks and should carry a modest football cost when those same requirements are
poorly matched. The cost is lost attacking continuity while the instruction's
existing exposure remains; it is not an arbitrary team-strength penalty.

## Frozen Design

1. A selected named plan carries only its stable `profileKey` into the match.
   Lateral focus remains the existing separate decision. Free-form/manual
   tactics carry no named profile and retain current behaviour.
2. The match rederives the chosen candidate's relative execution edge from the
   current canonical shape and versioned policy. It never receives or stores a
   selector score.
3. The derivation is shared with the selector: chosen complete-policy fit minus
   `balanced:balanced`, including the existing commitment and lateral thresholds.
   Opponent facts, results and squad identity keys are absent.
4. The bounded edge is clamped to `[-1, 1]` and scales only the controlled side's
   opportunity-volume multiplier by
   `1 + edge * executionFitVolumeInfluenceBasisPoints / 10000`.
5. The frozen initial influence is `750` basis points: at the reachable extrema
   it changes opportunity volume by at most `7.5%`. Non-commitment has edge zero
   and must remain bit-identical. Existing route allocation stays conserved;
   existing opponent exposure is not discounted when execution is weak.
6. The value lives in the versioned match-tactics asset. Validation requires a
   positive basis-point share. Content advances to v12; no beta-save migration
   or compatibility reader is added.

The `750` value is frozen before a fresh output exists. It is an explicit design
bound: large enough to be visible over a season, small enough that tactical fit
cannot compete with a division-quality gap. It is not selected from a sweep.

## Fresh Verification Population

- development: `phase81a-plan-execution-e`, seven worlds;
- untouched validation: `phase81a-plan-execution-f`, seven worlds;
- otherwise the exact D2 focused schedule, arms and paired seeds;
- exactly seven workers, sets decided independently;
- no historical lane until the match correction passes its immediate owner.

Required on both sets:

- own-fit net xG mean positive with its 95% interval above zero;
- mismatch net xG mean negative with its 95% interval below zero;
- original own-fit/mismatch/blind season-point bands unchanged;
- `>= 6` modal complete policies, maximum share `<= 0.35`, all six profiles and
  three focuses reachable, exact reorder invariance, `>= 4/6` counterfactual
  movement, A2/no-dominance held and zero opponent reads;
- non-commitment bit-identical against a no-profile control over a real-data
  reachable corpus;
- both positive and negative execution edges reached on generated lineups.

## Decision

- **GO:** both fresh sets pass every item; Step 13 opens.
- **REFINE:** the same plan-execution owner remains directional but misses a
  frozen magnitude or reachability gate.
- **STOP / RETHINK:** the bounded link creates a universal plan, hidden strength,
  opponent dependence, blind benefit, or cannot make mismatch costly twice.

No output from D2-C/D2-D may serve as validation, and a failing fresh result
does not authorize increasing `750`.

## Expected Files

- this step document
- `12f-canonical-own-squad-plan-execution.md` **(new)**
- the phase `README.md`
- `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24.19.0
git diff --check
```

## Definition Of Done

The execution link, numeric bound, fresh populations, unchanged product gates,
reachability and rejection conditions are frozen before production code.

## Outcome — 2026-08-13

The contract adopts one bounded, opponent-free execution edge derived from the
same complete-policy fit as selection. `750` basis points and fresh E/F seeds
were recorded before either population existed. Step 12F may now implement
exactly this link; no D2 output may validate it and a red result cannot authorize
a wider coefficient.
