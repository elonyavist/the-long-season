# Phase 81A - Checkpoint D Own-Squad Tactical Agency

## Verdict

`STOP / RETHINK`.

The opponent-free AI can now identify varied complete policies and reliably
avoid a deliberately mismatched plan. It cannot earn the preregistered,
perceptible season reward from a correct own-squad choice without either a new
product contract or a deeper tactical-plan redesign. No threshold moved.

## Frozen Population

- sets: `phase81a-own-squad-agency-a` and
  `phase81a-own-squad-agency-b`, decided independently;
- `7` worlds per set and exactly `7` workers;
- first stable club for each of `8` squad identities per world;
- canonical `34`-fixture schedule from one opening snapshot;
- `8` paired match seeds per fixture and arm;
- arms: own fit, mismatch, non-commitment and blind;
- actual controlled-side `3/1/0` points, bootstrapped by whole club schedule.

The report carries renewal as `not_evaluated`. It does not reuse L6.31 as if a
one-season tactical replay had certified ten-season succession.

## Results

| implementation | set | own fit | mismatch | own - mismatch | verdict |
|---|---|---:|---:|---:|---|
| shipped Step 11 score | A | -0.1674 | -1.1540 | 0.9866 | REFINE |
| shipped Step 11 score | B | 0.1674 | -1.0000 | 1.1674 | REFINE |
| readiness refinement | A | 0.1808 | -1.0580 | 1.2388 | rejected |
| readiness refinement | B | 0.2589 | -1.2545 | 1.5134 | rejected |
| canonical route derivation | A | 0.4018 | -1.5313 | 1.9330 | STOP / RETHINK |
| canonical route derivation | B | 0.4643 | -1.6205 | 2.0848 | STOP / RETHINK |
| frozen target | each | 1.5..6.0 | -6.0..-1.5 | >= 3.0 | required |

The final structural run is the strongest result and the decisive one:

- eight distinct modal `formation|tactic|focus` policies, maximum share
  `0.125` in both sets;
- all profiles observed; all focuses observed out of sample, while in-sample
  left focus remained absent;
- mismatch passed both sets;
- blind remained inside `[-0.5,+0.5]` and its intervals crossed zero;
- constant-quality role changes moved the complete policy in every sampled
  club;
- A2 and all three original no-dominance readers held;
- policy provenance contained only selected-shape capacities and versioned
  content, with zero opponent-source reads.

## Accepted-State Reproduction

After both rejected refinements were removed from the worktree, the locked
profile was rerun against the accepted Step 11 product on 2026-08-13. It
reproduced the first row exactly in both sets: `-0.1674/-1.1540/0.9866` and
`+0.1674/-1.0000/1.1674` for own fit, mismatch and spread. The run used seven
workers, took `861757 ms`, wrote the canonical JSON and exited `1` because the
frozen gate correctly remains red.

The route-derived refinement is evidence, not shipped behaviour. Its schema,
content, selector and production-call changes were removed in the same step
after falsification. The final tree therefore contains the reusable checkpoint
instrument and this transcript, but no dormant score table, alternate product
selector or unaccepted calibration version.

## Attribution

The original evaluator used a content-owned demand dot product while the match
executed conserved routes, pressure, connected exposure, control and volume.
The readiness refinement added a second score concept and was falsified on both
sets. The final refinement instead reused the production analytic functions
against one fixed neutral shape and threaded the exact match-engine tactic caps
through CLI, web, career and audit callers.

That removed the score-ownership ambiguity. The remaining failure is the
product premise: a neutral plan is already near the best average answer when no
opponent fact is available. The engine can make a bad commitment costly, but
the own-squad-only information does not identify a committed plan worth half a
win more over an ordinary season.

The auxiliary historical lane also remains red for First-Division goal rate,
draw share, point dispersion and multiple upset buckets under these policy
populations. A tactical magnitude increase to force `+1.5` would therefore
move already-failing historical football in the wrong direction.

## Decision Boundary

No implementation is accepted by this audit and Steps 13-16 stay closed. A new
contract must choose one of these product meanings before code proceeds:

1. own-squad AI primarily avoids mismatches in the MVP;
2. the profile vocabulary becomes genuinely specialised and the whole league
   is recalibrated against frozen historical targets;
3. positive tactical agency waits for honest, shared opponent information.

The previously green L6.31 generational evidence remains valid history. It is
not the requested final rerun: the integrated `7 x 10` can happen only after a
tactical product contract is accepted, so renewal is measured under the engine
that will actually ship.
