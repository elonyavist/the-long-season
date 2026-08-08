# Phase 81A Checkpoint B - Structural Counter-Move Ceiling

## Decision

**STOP / RETHINK.** The complete analytic space is strongly transitive. Phase 2
was not run, as preregistered, and Steps 07-16 remain closed.

## Code State And Included Steps

- Base commit: `f029ed1` (`feat(engine): add contested tactical route planning`).
- Included Phase 81A work: Steps 01-05.
- Measurement implementation: uncommitted Step 06 code at the time of this
  report.
- Match-tactics calibration: `match-tactics-calibration-v3`.
- Analytic contract: `phase81a-b-analytic-threat-v1`.

## Hypothesis

The conserved contested-route model contains material, stable non-transitive
counter-moves before player-specific execution, manager information, or AI
response logic is added.

## Population And Equivalence

The raw population is the complete declared product:

```text
23 formations x 3 shared tactic profiles x 3 lateral focuses = 207 actions
```

The tactic rows are the existing `high_pressing`, `direct_play`, and
`low_block` profiles. No profile values were copied into the checkpoint.

For each raw action, the instrument records the ordered vector of
`opportunity-route-plan-bps-v1` signatures obtained against all 207 opponent
actions. Two raw actions are equivalent only when all 207 existing signatures
are identical. This produced `N_eff = 198`; nine raw actions therefore collapsed
without reading a result, response identity, or catalog position.

Every effective opponent signature has uniform weight `1 / 198`. Real-career
frequency is outside this checkpoint.

## Analytic Payoff And Tie-Breaks

The preregistered `phase81a-b-analytic-threat-v1` reading derives, per side:

1. possession claim from the two plan control multipliers;
2. direct counter relief on the possession not owned;
3. plan volume;
4. expected route saturation;
5. route-weighted `0.5 + qualityEdge`, clamped to `0..1`.

Their product is non-negative threat. The two threats normalize to one share,
rounded once to basis points. Zero against zero is `0.5000`. Best-response ties
use canonical `actionId`. A material arc was frozen at `>= 0.5100`; dominance
means strictly above `0.5000` against every other effective signature.

## Execution

- Command:
  `pnpm cli simulation-report --profile=phase81a-b --workers=7 --format=json --report-output=simulation-out/phase81a-checkpoint-b.json`
- Worker count: exactly `7`.
- Shards: `7` canonical round-robin opponent-column partitions.
- Analytic producer wall clock: `1775.447416 ms`.
- World supplying the equal-quality reference band and versioned configuration:
  `phase81a-b-structural-world-v1`.
- Canonical report decision: `FAIL`; real process exit: `1`.
- Repository gate: `pnpm check` passed `294` files / `2232` tests, all
  typechecks, `857` modules / `3526` dependencies and every custom check.

## Results

| Gate | Required | Observed | Result |
|---|---:|---:|---|
| conserved route budget | `0` mismatches | `0` | pass |
| response diversity | `R / N_eff >= 0.25` | `2 / 198 = 0.010101...` | fail |
| best-response ubiquity | `<= 4` | `121` | fail |
| material cycles | one per declared tactic profile | `0 / 3` | fail |
| analytically dominant row | none | one | fail |

Only two effective responses ever win:

| response | uniform contexts covered |
|---|---:|
| `4-2-3-1|high_pressing|balanced` | `121` |
| `4-2-3-1|direct_play|balanced` | `77` |

The strongest row is `4-2-3-1|high_pressing|balanced`, with mean analytic
payoff `0.5380` and minimum `0.5009` against every other effective signature.
The dominance margin is small in its worst cell, but that is not what decides
the checkpoint: the same matrix has no material three-cycle, only two response
signatures, and an ubiquity multiple thirty times the allowed value.

The diversity and ubiquity thresholds are tangent only at a well-distributed
`R / N_eff = 0.25`. Here the first already misses by a factor of `24.75`, so the
ubiquity failure is not an artefact of the tangent boundary.

## Phase 2 And Frozen Invariants

Phase 2 is `not_run_by_protocol`. The preregistration says that a failed
analytic phase must stop before any selection or replay stream is opened.
Therefore this checkpoint makes no claim about:

- `counter_move_ceiling`, `counter_move_exposure`, or context-free replay;
- the current values of the three Monte Carlo `no_dominant_*` readers.

Those are **not evaluated**, not passed and not failed. Spending their match
populations after the structural premise had already failed would not change
the decision.

The code preflight also found that `simulateMatch(...)` currently forces
`lateralFocus` to `balanced`. Because Phase 1 failed, no analysis-only override
was added. Any future rerun that first repairs the structural model must provide
an explicit in-memory replay seam before Phase 2; persistent ownership remains
Step 14's.

## Ownership And Allowed Next Work

This is not a threshold or sample-size problem. The complete deterministic
matrix says formation choice and high pressing form an almost universal order;
lateral commitment never becomes a best response. The owner is the Step 04/05
relational model, but the result is `STOP / RETHINK`, not an automatic REFINE:
no coefficient may be changed merely to make this report green.

Before reopening implementation, the design must explain which football
allocation is contested by which opponent allocation so that a benefit can be
countered locally, rather than multiplying the same scalar threat ladder. The
same `0.25`, `4`, `100 bp`, `+0.045`, `-0.045`, and `0.015` targets remain
frozen for any authorized retry.
