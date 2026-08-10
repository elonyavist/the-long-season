# Phase 81A - Checkpoint L5.1 Owner Attribution

## Status

Initial run `REFINE`; fail-closed retry **`GO` on 2026-08-09**. The retry
identified one admissible owner for every red family with zero reconciliation
failures.

## Population

- profile: `phase81a-l5-1-owner-attribution-7x10`;
- `7` worlds x `10` seasons x `3` competitions;
- exactly `7` workers;
- first-division readers: `70` league-seasons;
- artifact:
  `simulation-out/phase81a-l5-1-owner-attribution-7x10-retry.json`;
- instrumentation only: no gameplay coefficient or population changed.

## Final Owner Decision

| Family | Observation | Owner |
|---|---:|---|
| table hierarchy | paired strength scale moves spread `40.8143 -> 47.6000` and PPG deviation `0.3284 -> 0.3894` | `population_strength` |
| player load | fresher quality-matched younger alternative share `0.0154` | `renewal_quality` |
| renewal funnel | generated senior-quality share `0.1090`; material-minute conversion `0.7693` | `development_realization` |
| leader production | task-quality/nomination correlations `0.0205` and `0.0261`, while top-ten volume remains credible | `actor_allocation` |
| club identity | retention `0.8905`; changed/stable role distance `0.1763/0.0857` | `annual_intake_identity_erosion` |

Goals per match (`2.8276`) and draw share (`0.2801`) remain inside their frozen
Big Five guardrails. Kickoff strength and final points have a positive rank
correlation (`0.7178`), but the current buckets do not distinguish a compressed
strength population from insufficient match translation.

## Gate Repair

The initial producer treated reconciliation as sufficient and printed `PASS`
with unresolved owners. Step 06B10B made the decision fail closed: every red
family must have one admissible owner and `not_attributed` opens nothing. The
retry reaches `OWNER_IDENTIFIED` under that corrected rule.

## Decision

`GO`. Steps 06B11-06B16 open only in owner order. The measurements authorize
population strength, development realization, actor allocation and soft annual
role continuity; they do not authorize direct age/output penalties, generic
youth buffs, formation protection or a second result formula.
