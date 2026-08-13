# Phase 81A - Checkpoint D2 Translation Attribution

## Verdict

`plan_execution_not_established`. Correct own-squad fit improves canonical net
xG in both sets, but deliberate mismatch does not reliably worsen it. The first
weak stage is therefore before xG, not xG-to-goal or goal-to-points resolution.

## Population And Execution

- the unchanged D2-C and D2-D seven-world sets, independently decided;
- eight identity schedules, 34 fixtures and eight paired seeds per arm;
- exactly seven workers and no repeated historical career lane;
- match-tactics calibration v11;
- `40,742 ms`, report hash `be8076c039630484336a9e82b489ecc6`,
  process exit `0` with the observational report decision `NOT_EVALUATED`.

Every opportunity, xG, goal and point fact comes from the canonical
`simulateMatch(...)` result. The report reconstructs no route or resolver fact.

## Paired Results Against Non-Commitment

| set | arm | net xG | 95% interval | goal difference | 95% interval |
|---|---|---:|---:|---:|---:|
| D2-C | own fit | +0.6033 | +0.1043..+1.1030 | +1.1607 | +0.5254..+1.7885 |
| D2-C | mismatch | +0.1478 | -0.2285..+0.5073 | +0.1205 | -0.4969..+0.7455 |
| D2-D | own fit | +0.5255 | +0.0627..+0.9577 | +0.4688 | -0.1635..+1.1250 |
| D2-D | mismatch | -0.2001 | -0.5467..+0.1524 | -0.3929 | -0.9018..+0.1161 |

Own fit establishes the correct net-xG direction twice. Mismatch establishes
neither the required negative direction nor an interval excluding zero in
either set. Both sets therefore name the same first failed stage.

The diagnostic explains why opportunity count was not made a gate. Mismatch
changes net opportunities by `+2.7321/+1.1138`; it is failing to make an
ill-suited plan costly, not merely trading fewer chances for better ones. Own
fit changes them by `+17.0402/+16.2545`. Chance quality changes remain mixed and
cannot rescue the mismatch direction.

## Code Owner

The versioned `demandBasisPointsByCapacity` rows are consumed by
`standardizedWeightedProfileFit(...)` in the selector and by no match path.
After selection, only anonymous tactic knobs and lateral focus reach
`deriveOpportunityRoutePlan(...)`. The match therefore cannot know which
capacity contract the chosen specialised plan was supposed to execute.

The next step may connect the explicit plan identity to the canonical route-
volume derivation and rederive fit there from shape plus the same versioned
policy. It may not carry a precomputed fit score, infer a plan from matching
slider values, add a team-strength bonus, read the opponent, or change the D2
point bands.

## Renewal Boundary

This checkpoint plays opening-snapshot fixtures and says nothing about aging,
market flow or generated-player leadership. L6.31's integrated rerun remains a
mandatory Phase 81A closeout gate after the tactical product is resolved.
