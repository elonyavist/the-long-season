# Step 06B28A - Checkpoint L6.8 Prospective Succession 7 x 10

## Status

Done - `REFINE: target_eligibility`; the candidate was rejected.

## Frozen Design

- `7` worlds, `10` seasons, exactly `7` workers;
- one fresh legacy control and one candidate arm use the same L6.4 seed prefix
  and footballers;
- legacy need order in both arms; only target-tier preference differs;
- fresh profile `phase81a-prospective-succession-l6-8-7x10`.

## Decision

`GO` requires target reach plus, against L6.4:

- age-18-25 succession acquisition share `+0.15` and career-generated share
  `+0.05`;
- local replacement capacity `+0.05`, positive in `5/7` worlds;
- career-generated leader share `+0.05`, positive in `5/7` worlds;
- division replacement `>= 0.50`, formation delta `>= -0.02`, transfer-volume
  ratio `<= 1.05`, champion points in the frozen band;
- zero unknown origin, reconciliation or signature failure.

`REFINE: downstream_realization` means target ages move but local/leader paths
do not. `REFINE: target_eligibility` means the new tier does not materially
move acquisitions. `STOP_RETHINK` covers guardrail regression or leader
movement without a linked younger-acquisition path.

## Expected Files

- career-section evaluator/tests, registry/planner, labels;
- this step, audit/index, phase README and status;
- engine files only to collapse the accepted or rejected analysis switch.

No threshold moves after output.

## Instrument Correction After Attempt 1

The first execution wrote report hash
`c4a5f90b5f1531e4e74c3b797cfcf396` and correctly returned
`STOP_RETHINK: structural_reconciliation` before comparing gameplay. All seven
cached L6.4 worlds predate `collectRenewalAnalysis`: they contain the career
outcomes but zero `renewalPopulationSignatures` and no renewal episodes, while
all seven candidate worlds contain ten signatures and the required episodes.
The cached worlds therefore cannot supply the frozen L6.8 attribution metrics.

The correction does not change a target or a product branch. The legacy arm is
rerun fresh in its own `legacy_order` checkpoint directory through the same
observer and seeds as the candidate. The candidate cache remains reusable. A
missing signature, episode or reconciliation fact still fails closed.

## Recorded Result

The corrected report hash is `bf91009d4580f2903d61e0a6c77012ab`.
Reconciliation and ten population signatures held in all fourteen arm-worlds.
Control and candidate were exactly equal:

- fulfilled succession episodes: `4,040` each;
- total transfer acquisitions: `5,198` each;
- career-generated leader share: `0.259524` each;
- local/division replacement: `0.087912 / 0.516484` each;
- formation retention: `0.814286` each;
- every paired delta and coherence count: zero.

Therefore both target deltas were `0`, all linked-path gates failed and the
decision is `REFINE: target_eligibility`. No product guardrail regressed; the
proposed behavior simply added no behavior. The entire L6.8 candidate is
superseded by 06B29 rather than retained as a dormant branch.
