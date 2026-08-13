# Phase 81A - Specialised Own-Squad Plans Amendment

## Decision

Product option B was accepted on 2026-08-13. Career AI remains opponent-free
before kickoff, but the generic `attacking` and `defensive` presets are replaced
by football plans whose requirements and trade-offs are materially different.
The original Checkpoint D result remains a falsified contract, not a baseline
that may be relabelled as success.

## Product Promise

A club should benefit when its available eleven can execute a specialised plan
and should suffer when it is forced into the least suitable plan. No plan owns
a direct strength, xG, goal, win or points modifier. A plan changes only the
existing legal tactic inputs and lateral commitment; players and canonical
route contests decide whether those instructions work.

The AI may read selected-player capacities already active in the match. It may
not read the opponent, table position, predicted result, hidden quality or a
future event. The human manager sees and may choose the same six plans.

## Frozen Plan Vocabulary

All demand rows conserve exactly `10,000` basis points in canonical capacity
order. Tactic values use the existing `0..1` inputs.

| plan | mentality | pressing | directness | width | risk |
|---|---|---:|---:|---:|---:|
| `balanced` | balanced | 0.50 | 0.50 | 0.50 | 0.50 |
| `patient_possession` | balanced | 0.65 | 0.20 | 0.55 | 0.35 |
| `high_press` | attacking | 0.90 | 0.40 | 0.60 | 0.70 |
| `direct_transition` | balanced | 0.30 | 0.90 | 0.50 | 0.65 |
| `wide_overload` | attacking | 0.55 | 0.45 | 0.90 | 0.65 |
| `compact_counter` | defensive | 0.20 | 0.75 | 0.30 | 0.25 |

| capacity | balanced | possession | press | transition | wide | compact |
|---|---:|---:|---:|---:|---:|---:|
| build_up | 1000 | 1800 | 700 | 300 | 500 | 400 |
| central_progression | 1000 | 1700 | 900 | 700 | 500 | 400 |
| left_progression | 750 | 500 | 500 | 350 | 1600 | 300 |
| right_progression | 750 | 500 | 500 | 350 | 1600 | 300 |
| final_third_presence | 1000 | 900 | 1600 | 1600 | 1700 | 500 |
| pressing_cohesion | 1000 | 1100 | 2200 | 500 | 700 | 500 |
| central_coverage | 900 | 800 | 600 | 500 | 300 | 1400 |
| left_coverage | 600 | 400 | 300 | 300 | 700 | 700 |
| right_coverage | 600 | 400 | 300 | 300 | 700 | 700 |
| box_protection | 900 | 600 | 300 | 800 | 300 | 2000 |
| counter_threat | 800 | 300 | 1200 | 2500 | 600 | 1200 |
| rest_defence | 700 | 1000 | 900 | 1800 | 800 | 1600 |

Profile fit retains the existing conserved weighted-capacity calculation and
`8000` basis-point share. Profile commitment requires a `100` basis-point edge.
Lateral fit retains the canonical mirrored-capacity calculation, but commitment
requires a `100`, not `500`, basis-point edge. The old threshold suppressed one
side entirely in a real seven-world set; this replacement is frozen here as a
product decision, before specialised output exists.

## D2 Population And Gates

Checkpoint D2 uses two untouched sets:
`phase81a-specialised-own-squad-c` and
`phase81a-specialised-own-squad-d`. Each contains seven worlds, one club for
each of eight identities, 34 fixtures and eight paired match seeds per arm,
with exactly seven workers. The original point bands remain unchanged:

- own fit `+1.5..+6.0` season points;
- mismatch `-6.0..-1.5`;
- blind `-0.5..+0.5`, interval crossing zero;
- own-fit minus mismatch at least `3.0`.

Each set must observe all six plans and all three focuses, at least six modal
complete `formation|plan|focus` policies, maximum modal share `<= 0.35`, exact
catalog-reorder invariance and at least `4/6` constant-quality policy changes.
No opponent-source read is permitted.

Historical football is evaluated on the same seven worlds advanced for five
seasons: 35 first-division seasons per set. This powers rare rank-gap readers
without changing their target bands. Goals, draws, standings dispersion and
every upset bucket keep their existing versioned readers. Failure triggers
owner attribution; it never authorizes tuning plan values after output.

Renewal remains `not_evaluated` in D2. The completed tactical engine must still
rerun the L6.31 ready-replacement and generated-leader gates in Step 16's
integrated `7 x 10`.
