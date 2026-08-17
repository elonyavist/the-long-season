# Step 06 - Checkpoint B: Two-Season Realization And Aging

## Status

Blocked behind Step 05.

## Goal

Use a cheap `7 x 2` checkpoint to catch broken development, forecast ordering,
damage or retirement before AI/UI migration and long runs.

## What To Implement

- Register the frozen Step 00 `7 x 2` profile.
- Retain only non-derivable monthly facts needed for reconciliation and branch
  attribution. Derive policy multipliers through canonical engine functions.
- Reconcile every cohort header, observed month, player origin and final state.
- Evaluate:
  - latent profile immutability;
  - base-training zero-minute branch;
  - opportunity/performance cap;
  - early/normal/late timing direction;
  - probability conservation/class ordering;
  - serious-damage/no-damage reachability;
  - current decline family locality;
  - age-37 retirement boundary on real eligible players or a preregistered
    real-data search corpus;
  - report/RNG continuity.
- Emit the exact Checkpoint B metric IDs from
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md),
  including numerator, denominator, target-register key, limitations and named
  failure owner.
- Compare only baseline quantities whose semantics survived the replacement.
  Old potential-conversion metrics are `superseded`, not failures.
- Decision: GO, REFINE named Step 04/05 owner, STOP_RETHINK, or
  STOP_INSTRUMENT.

## What NOT To Implement

- No AI, market, UI or product HTML.
- No threshold move after output.
- No 15-season run.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- the existing realization/succession evaluator that owns the required facts,
  or one precisely named replacement and test added here before creation
- `packages/simulation-tools/src/modular-report/report-contract.ts` and test
  only if canonical profile/hash metadata genuinely changes
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only for a pre-output correction
  demanded by production truth
- `docs/audits/PHASE_81B_CHECKPOINT_B_REALIZATION.md`
- `docs/audits/README.md`
- this step and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81b-realization-b-7x2 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-b-7x2.json
pnpm check
git diff --check
```

Run report alone and record real exit code/hash.

## Definition Of Done

- Every branch/gate is non-vacuous or blocks GO as `NOT_EVALUATED`.
- Reconciliation and continuity pass.
- Failures reopen only their owner.
- Only GO opens Step 07.
