# Step 06B29C - Checkpoint L6.9C Succession Affordability Attribution

## Status

Done - instrument invalid; no product decision.

## Question And Cohort

L6.9B attributes `51.67%` of successor searches to a combined economic block.
Split that stage into transfer-fee capacity and contract-term affordability
without changing either rule. Run a fresh `7 x 10` current-product cohort with
exactly `7` workers under profile
`phase81a-succession-affordability-l6-9c-7x10`.

## Decision

- one of the two economic stages owning at least `50%` of all observed searches
  is `OWNER_IDENTIFIED` and opens only its matching correction;
- neither reaching `50%` is `MIXED`, authorizing no correction until its full
  distribution is explained;
- absent observations or reconciliation failure is `STOP_RETHINK`.

The old combined category is removed rather than retained beside the split.
All ten stage counts remain mutually exclusive and exhaustive.

## Expected Files

- engine diagnostic vocabulary/observer and tests;
- career report facts/evaluator/tests, registry/planner and labels;
- this step, 06B29B outcome, audit/index, Phase README and status.

No gameplay, content, persistence, web or HTML change.

## Instrument Finding

The run wrote hash `ddfb299516814101ddf1fd65168b95f1` and classified
`8,747/15,994` searches as contract terms. That classification is invalid for
product attribution: its fee stage checked only `offerFee > 0`, while canonical
`evaluateTransferFeeCapacity(...)` still ran inside the later aggregate. Some
fee-capacity failures could therefore be mislabeled as contract failures.

No threshold or product behavior moves. 06B29D replaces this reader with the
canonical fee-capacity and contract-capacity reasons; the flawed category is
not carried forward.
