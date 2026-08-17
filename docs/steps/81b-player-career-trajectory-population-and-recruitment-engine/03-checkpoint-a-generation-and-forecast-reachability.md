# Step 03 - Checkpoint A: Generation And Forecast Reachability

## Status

Not started. Measurement only.

## Goal

Stop before career dynamics and prove the replacement population is real,
varied, deterministic and capable of supporting the future forecast contract.

## What To Implement

- Register one locked `simulation-report` profile for the Step 00 `7 x 1`
  population. No free-form worlds/seasons/seed override.
- Add canonical report facts for player origin, nation, division, club, age,
  role, current band, latent band and maturation/longevity profile.
- Report hidden latent facts only in this locked diagnostic profile.
- Reconcile player counts against canonical GameState/academy ownership.
- Evaluate the Step 00 register for:
  - current pyramid by division;
  - latent tail by division;
  - `3:2:1` allocation over its declared horizon;
  - club reorder invariance;
  - role/profile coverage;
  - ordinary/depth mass;
  - no special desired-star path.
- Evaluate `3:2:1` on the frozen allocation-cycle creation-request corpus, not
  by pretending one played season is a long-run ratio. The search calls the
  production population policy with stable real request shapes and is locked
  before output; it is not a second generator and cannot widen after a miss.
- Emit every binding row using the exact Checkpoint A metric IDs, formulas,
  non-vacuity and owner rules from
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
- Run an independent reordered club/catalog derivation using the same facts; it
  must not consume additional production RNG or create a second generator.
- Record the exact population and missing visibility.
- Decision:
  - `GO`: every rule reachable and binding population gate passes;
  - `REFINE`: reopen only Step 02;
  - `STOP_RETHINK`: continuous policy cannot produce required pyramid without a
    guarantee or hidden club-quality assumption;
  - `STOP_INSTRUMENT`: reconciliation/order/purity fails.

## What NOT To Implement

- No gameplay tuning after output.
- No forecast, development, aging, AI or UI change.
- No larger corpus to rescue a failed frozen gate.
- No HTML needed; JSON/audit are sufficient.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- one precisely named generation/population evaluator and test beside those
  files, added to this list before creation only if no existing evaluator owns
  the same semantics
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only if production facts require
  a preregistered formula correction before output exists
- `docs/audits/PHASE_81B_CHECKPOINT_A_GENERATION.md`
- `docs/audits/README.md`
- this step and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81b-generation-forecast-a-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-a-7x1.json
pnpm check
git diff --check
```

The report runs alone. Capture the real exit code.

## Definition Of Done

- Counts reconcile and every rule is non-vacuous.
- Population gates close on in-scope evidence.
- Decision/audit and exact hashes are recorded.
- Only GO opens Step 04.
