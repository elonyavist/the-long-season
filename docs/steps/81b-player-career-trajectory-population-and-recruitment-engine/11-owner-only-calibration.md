# Step 11 - Owner-Only Calibration

## Status

Conditional. Open only on Checkpoint D `REFINE`.

## Goal

Correct only the owner demonstrated by Checkpoint D, with targets unchanged,
then leave the identical population/gates to Checkpoint E.

## What To Implement

- Copy Checkpoint D's owner table into this step before code.
- Copy each failed metric ID from
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md)
  and list exact allowed production files per failed gate.
- If multiple owners are independently demonstrated, split this document into
  ordered 11A/11B substeps with a bounded checkpoint after each; do not change
  them simultaneously and attribute the aggregate.
- Typical allowed corrections:
  - population distribution/config if supply is wrong;
  - probability forecast policy if calibration/order is wrong while outcomes
    are healthy;
  - realization curve if supplied talent cannot develop under adequate time;
  - aging/damage if current ability decays implausibly;
  - AI intent derivation if needs are absent/wrong;
  - target scoring if needs exist but wrong candidates win;
  - market constraint only if terminal funnel names it.
- Add mutation/reachability tests for every changed rule.
- Do not add switches that preserve both candidate/control product paths. An
  analysis oracle may exist only in report/test scope with a removal owner.
- Advance the narrow gameplay/config version but not save schema.
- Remove any helper/config made obsolete by the correction.

## What NOT To Implement

- No threshold or population change.
- No unrelated green-owner tuning.
- No broad refactor justified only by convenience.
- No second beta reset.
- No Checkpoint E run until focused tests and full gate are green.

## Expected Files

Populated from Checkpoint D before implementation. Initially:

- this step document
- only named owner modules/config/tests
- Step 12 only when the correction changes its expected facts
- `docs/PROJECT_STATUS.md`

Any added file requires Graphify affected evidence and ownership explanation.
No production file from the central manifest is automatically allowed merely
because it appears there; the Checkpoint D owner table is the authorization.

## Required Checks

```bash
nvm use 24
# focused owner tests first
pnpm check
git diff --check
graphify update .
```

Do not run 7x15 in this step.

## Definition Of Done

- Every edit maps to a Checkpoint D owner.
- All targets/populations are unchanged.
- Candidate rule is reachable in the read direction on real data.
- No dual path/dead code/reset remains.
- Checkpoint E is the only next action.
