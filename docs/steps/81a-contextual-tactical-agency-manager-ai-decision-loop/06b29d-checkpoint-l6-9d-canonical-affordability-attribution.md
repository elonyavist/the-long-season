# Step 06B29D - Checkpoint L6.9D Canonical Affordability Attribution

## Status

Done - `OWNER_IDENTIFIED` on 2026-08-12.

## Correction

Read the exact production evaluations, in order:

1. `evaluateTransferFeeCapacity(...)`;
2. `evaluateCareerContractCapacity(...)` reason `wage_budget_exceeded`;
3. `evaluateCareerContractCapacity(...)` reason `insufficient_cash`;
4. affordable.

The observer calls no parallel formula. Account absence remains an explicit
exhaustive state. Selection still consumes only the final boolean and is
unchanged.

## Cohort And Decision

- profile `phase81a-succession-affordability-l6-9d-7x10`;
- fresh `7` worlds x `10` seasons, exactly `7` workers;
- one stage at `>= 0.50` is `OWNER_IDENTIFIED` and opens only that correction;
- otherwise `MIXED`; zero observation or reconciliation is `STOP_RETHINK`.

## Expected Files

- canonical AI market owner and tests;
- career report facts/evaluator/tests, registry/planner and labels;
- this step, 06B29C correction, audit/index, Phase README and status.

No gameplay, content, persistence, web or HTML change.

## Outcome

The fresh `7 x 10` run completed with exactly `7` workers and reconciled all
worlds. Canonical terminal stages over `17,212` role-succession observations:

| Stage | Count | Share |
| --- | ---: | ---: |
| no wage-budget capacity | 10,000 | 0.580990 |
| qualified candidate loses generic score | 4,536 | 0.263537 |
| qualified candidate already wins | 2,406 | 0.139786 |
| public quality below the role floor | 206 | 0.011968 |
| seller safety | 46 | 0.002672 |
| willingness | 18 | 0.001046 |
| transfer fee, cash, finance account or role supply | 0 | 0.000000 |

The `>= 0.50` owner rule identifies the wage-planning buffer. The observed
block is the production `evaluateCareerContractCapacity(...)` result, not an
observer approximation. The artifact is
`simulation-out/phase81a-succession-affordability-l6-9d-7x10.json`, SHA-256
`b1b32a915cfa48e75e0383c7b34ae1b1`.

## Handoff

Open one bounded candidate only: role-succession purchases may consume the
last two percent of the club's existing annual wage budget through the already
owned `allowFullWageBudgetForStructuralRepair` capacity seam. This does not
create money, raise a budget or waive cash and transfer-fee checks. A paired
checkpoint must prove the blockage moves first and that local replacement and
career-generated leadership then improve; otherwise the candidate is removed.
