# Phase 81A - Own-Squad Capacity Standardisation Amendment

## Decision

Amendment A9 supersedes one sentence of Amendment A8: profile fit does not
compare the twelve tactical capacities on their raw levels. It first expresses
each capacity relative to its own ordinary selected-eleven level and spread,
then applies the unchanged conserved demand rows. Every plan, tactic value,
commitment threshold, D2 seed and D2 result band from A8 remains frozen.

This correction was made after the authorised A/B development reachability lane
falsified three candidate calculations and before production implementation of
this formula or generation of any D2 world. A/B may make the vocabulary
reachable; only untouched C/D populations may decide whether it works.

## Falsified Calculations

Across `378` production-selected real-career elevens in
`phase81a-b2-real-population-reachability-00..06`:

- the shipped raw conserved dot product selected `direct_transition` `319`
  times and `compact_counter` `53` times, with six non-commits under the old
  threshold;
- cosine similarity made `balanced` universal;
- projection against `balanced` demand and projection against mean catalog
  demand each left at least three plans unreachable.

These are rejected development findings, not alternative production paths.
They leave no helper, switch or oracle in the engine.

The common cause is scale. A shape capacity is internally coherent, but its
ordinary population level and dispersion are task-specific. Comparing a
`0.57` counter capacity directly with a `0.50` pressing capacity makes the
selector reward the saturation calibration before it rewards the footballers.

## Frozen Standardisation

The reference is the arithmetic mean and the scale is the population standard
deviation across the same `378` canonical selected elevens. Both are quantized
once to nearest basis point before use. The engine never reads the population;
it reads only these versioned calibration values and the current own eleven.

| capacity | reference bp | scale bp |
|---|---:|---:|
| `build_up` | 5121 | 462 |
| `central_progression` | 5380 | 549 |
| `left_progression` | 5110 | 678 |
| `right_progression` | 5143 | 659 |
| `final_third_presence` | 5793 | 596 |
| `pressing_cohesion` | 4985 | 460 |
| `central_coverage` | 5499 | 455 |
| `left_coverage` | 4828 | 547 |
| `right_coverage` | 4856 | 550 |
| `box_protection` | 5703 | 429 |
| `counter_threat` | 5699 | 523 |
| `rest_defence` | 5599 | 440 |

For capacity `c`, profile `p`, reference `r`, positive scale `s` and conserved
demand `d`:

```text
z(c) = (capacity(c) - r(c) / 10000) / (s(c) / 10000)
weighted(p) = sum(z(c) * d(p,c) / 10000)
```

Every plan, including `balanced`, actively reads its demand row. A committed
plan subtracts the already-frozen `100 / 10000` minimum advantage from
`weighted(p)`. The existing `8000/2000`
profile/lateral split and lateral calculation are unchanged.

No absolute strength, opponent fact, formation identity, predicted event or
result enters the formula. Raising every capacity by the same number need not
cancel because task scales differ; what cancels exactly is the balanced plan's
reading of the same standardized own eleven.

## Reachability And Out-Of-Sample Rule

Using the quantized values above before production implementation, the A/B
diagnostic selects, in canonical plan order:

```text
balanced 1
patient_possession 67
high_press 3
direct_transition 60
wide_overload 200
compact_counter 47
```

Implementation must reproduce those counts on the same canonical lane and
retain all three lateral focuses with unique maxima. This proves only that the
vocabulary is executable. Checkpoint D2 remains the fail-closed out-of-sample
test: both untouched C/D sets must independently satisfy every A8 distribution,
counterfactual, season-point and historical guardrail.

### Implementation-account correction before D2

The first diagnostic printed `159 / 43 / 3 / 32 / 107 / 34` because its local
scratch calculation set `balanced` to zero while scoring every committed plan
with `weighted(p)`. That contradicted both the stated all-plan formula and the
product rule that the balanced demand row is live. The production
implementation exposed the mismatch immediately: applying the formula to all
six rows gives the counts recorded above. This correction happened before any
D2 seed was generated; no plan, coefficient, threshold or result target moved.
