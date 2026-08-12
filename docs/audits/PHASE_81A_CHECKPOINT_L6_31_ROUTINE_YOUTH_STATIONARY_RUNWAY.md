# Phase 81A Checkpoint L6.31 — Routine-Youth Stationary Runway

## Verdict

**`GO` in-sample and out-of-sample.** The adopted individual runway gives half
of `normal_youth` academy players a stable division-and-role ceiling target.
It clears every frozen material gate on two disjoint paired populations,
changes only the declared potential profiles at the immediate boundary and
adds no integrated failure.

## Product Decision

- the decision reads only world seed, player ID, division and role;
- it never counts, ranks or compares candidates and never reads vacancies,
  senior output or later career state;
- the 30 targets are the frozen L6.29A p75 opening-role medians, rounded to
  `0.25` and clamped to `+/-0.50` around the division median;
- a dedicated derived RNG stream selects exactly a `5,000` basis-point lane;
- only `normal_youth` under the ordinary policy can receive the target;
- the canonical bounded potential allocator constructs the profile;
- all targets stay below the six-star floor, and nationally budgeted
  exceptional allocation sees the pre-runway population.

The policy applies to the initial academy and annual academy refill. It does
not modify opening senior squads or annual senior candidates.

## Executed Populations

Both pairs ran ten seasons with exactly seven workers.

| Set | Seed prefix | Control SHA-256 | Candidate SHA-256 |
| --- | --- | --- | --- |
| in-sample | `phase81a-academy-prospect-class-l6-20-v1` | `37bba7f3052b144f2eb25e87bf178e0df8e05d7bc8dce30ba06a10509ae0a95b` | `1617afd6cf03109d3937af68eefa70ab6437dca298e7d7c28dfd98c440004961` |
| out-of-sample | `phase81a-routine-youth-runway-l6-31-oos-v1` | `d4d4f55f2f05016dabcaab045999c9039b525a8a693096a2b0b1322b2a642644` | `8bfd4d97549c83d59a6156772ffa5e6b45a61367c2e2b290e76ea0b952777ceb` |

The out-of-sample candidate JSON rebuilt byte-identically through
`simulation-report --from-report` (`cmp` exit `0`).

All four final artifacts use the `facts-v2` cache identity. The first complete
run exposed that the policy version had not yet entered the report manifest;
the cache identity was advanced and every arm rerun from fresh facts after the
manifest became complete. No gameplay rule, seed or frozen gate changed.

## Results

| Measure | In-sample control | In-sample candidate | OOS control | OOS candidate | Frozen gate |
| --- | ---: | ---: | ---: | ---: | --- |
| generation stationary-capable | `0.3069` | `0.5400` (`6/7`) | `0.3004` | `0.5164` (`6/7`) | `>= 0.48`, `5/7` |
| season-ten stationary-ready | `0.2189` | `0.3552` | `0.2162` | `0.3195` | delta `>= +0.08`, `5/7` |
| ceiling-gap share | `0.7210` | `0.5084` | `0.7149` | `0.5451` | reduction `>= 0.08`, `5/7` |
| generated-leader share | `0.2024` | `0.2833` | `0.1524` | `0.2429` | delta `>= +0.03`, `5/7` |

The ready and gap effects point the intended way in `7/7` worlds in both
sets. Generated leadership improves in `6/7` worlds in both sets. Aggregate
deltas are respectively `+0.1363`, `-0.2127`, `+0.0810` in-sample and
`+0.1034`, `-0.1698`, `+0.0905` out-of-sample.

## Purity And Guardrails

The immediate comparison retains accepted season-one player IDs, counts,
clubs, divisions, roles, classes, ages, current summaries and complete current
profile hashes. In-sample has `140` changed potential profiles and `140`
effective declared assignments; out-of-sample has `144/144`. Neither set has a
potential decrease or any other mismatch.

The candidate introduces zero integrated failure in both populations. Existing
historical reds remain visible in each control and are not claimed as solved by
this step.

## Interpretation

L6.30 established that potential supply had leverage but coupled the decision
to mutable annual population state. L6.31 preserves that leverage at the right
product boundary: an ordinary young player's authored runway is stable even
when another club, vacancy or candidate changes. The result is not merely more
high potentials. Ten seasons later there are materially more like-aged ready
replacements and more career-generated scoring/creation leaders on two disjoint
populations, while exceptional stories and integrated world health do not
acquire a new regression.
