# Step 12 - Checkpoint E: Repeated Seven-By-Fifteen

## Status

Blocked behind Step 11, or reached directly when Checkpoint D is GO and the
protocol requires a clean reproducibility repeat.

## Goal

Re-run the exact fifteen-season population and gates after the final candidate,
prove determinism/rebuild identity, and authorize broad product review.

## What To Implement

- Use the same worlds, seasons, seed prefix, shards, worker count, modules,
  thresholds and formulas as Checkpoint D.
- Change only the final gameplay/config version when Step 11 ran.
- Run fresh and checkpoint/resume paths as preregistered; aggregate artifacts
  must be byte-identical for the same candidate.
- Re-evaluate every Checkpoint D gate, not only previously red ones.
- Verify no green owner regressed.
- Reconcile report, cache, RNG, storage, market, squads and population.
- Record before/candidate paired deltas without claiming causality from
  unpaired values.
- Decision GO/REFINE/STOP. A second REFINE returns only to the demonstrated
  owner and requires a newly documented substep; no silent loop.

## What NOT To Implement

- No code or target change.
- No smaller sample after failure.
- No final HTML breadth run before GO.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts` only if final
  candidate metadata must be stamped
- the exact Checkpoint D evaluator files listed in Step 10, without formula or
  population edits
- `packages/simulation-tools/src/modular-report/report-contract.ts` and test
  only if candidate-version metadata requires it
- `docs/audits/PHASE_81B_CHECKPOINT_E_7X15.md`
- `docs/audits/README.md`
- this step and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81b-longitudinal-e-7x15 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-e-7x15.json
pnpm check
git diff --check
```

Run alone and record all hashes/timings.
The locked profile owns the ignored checkpoint directory and cache signature;
there is no CLI checkpoint-directory override.

## Definition Of Done

- Fresh/resume and rebuild are identical.
- Every binding gate passes on the final candidate.
- No regression is hidden by aggregate-only reporting.
- Only GO opens Step 13.
