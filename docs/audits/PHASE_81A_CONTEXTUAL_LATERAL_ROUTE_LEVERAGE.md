# Phase 81A - Contextual Lateral-Route Leverage

## Verdict

`PASS_PHASE_1`. The first passing preregistered magnitude is `6000 bp`.
Explicit left/right focus is now a material contextual commitment rather than
an alias for the weaker whole-team width magnitude. This is not final B2 `GO`:
Phase 2 replay remains mandatory.

## Frozen Ladder And Evidence

The ordered ladder was `4000, 6000, 8000, 10000`. Every candidate used the
same fourteen worlds, complete B2 analytic population and exactly seven
workers. Evaluation had to stop at the first value passing both seed sets.

| candidate | in-sample ubiquity | out-of-sample ubiquity | population | result |
|---:|---:|---:|---:|---|
| `4000` | `5.7989` | `6.1032` | `21/21`, `21/21` | `REFINE` |
| `6000` | `3.6587` | `3.7037` | `21/21`, `21/21` | `PASS_PHASE_1` |
| `8000` | not evaluated | not evaluated | not evaluated | stopped by rule |
| `10000` | not evaluated | not evaluated | not evaluated | stopped by rule |

At the adopted value, all nine complete response signatures remain distinct;
six become best responses in each seed set. The two graphs contain `145` and
`144` material local three-cycles. Route-budget conservation and horizontal
mirror mismatches are both zero, and no tactical response is universally
dominant.

The response distribution also changes football meaningfully. Balanced focus
still wins some contexts, but left and right focus together own most contexts;
neither side nor one tactic exceeds the frozen ubiquity ceiling. The unchanged
B2 gates therefore reject both an inert focus and a universal flank choice.

## Ownership

The asset owns one unsigned magnitude:
`tacticalSemantics.lateralFocusAffinityBasisPoints`. Football direction remains
in the exhaustive typed `LATERAL_FOCUS_ROUTE` and
`LATERAL_FOCUS_EXPOSED_ROUTE` mappings. Width and lateral focus do not share a
coefficient: width spreads the whole team, while focus reallocates that shape
between its two flanks. No signed content field, fallback or second payoff
formula was introduced.

## Artifacts

- rejected `4000 bp`:
  `simulation-out/phase81a-b2-lateral-candidate-4000.json`, SHA-256
  `e1384f7ee08587e8a40bd4773bba921a8d5aae4ecdc3c1f0a417024c12c6b23c`;
- adopted `6000 bp`:
  `simulation-out/phase81a-b2-lateral-candidate-6000.json`, SHA-256
  `61521f2014b31918bb547d8b59b2ccceec5e6d16c086ad888aeabe52951d805a`.

The passing report records `PASS_PHASE_1` and `phaseTwoStatus = required`.
Step 06C4 must replay the frozen choices on disjoint seeds before Step 07 can
open.
