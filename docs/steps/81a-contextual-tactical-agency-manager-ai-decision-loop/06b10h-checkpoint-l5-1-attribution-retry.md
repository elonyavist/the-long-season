# Step 06B10H - Checkpoint L5.1 Attribution Retry

## Status

**Done - `GO` on 2026-08-09.** Every red family has exactly one admissible
owner and all reconciliations hold.

## Goal

Repeat the locked canonical `7 x 10` attribution with corrected fail-closed
semantics and open only demonstrated owner steps.

## Locked Run

```bash
pnpm cli simulation-report \
  --profile=phase81a-l5-1-owner-attribution-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-l5-1-owner-attribution-7x10-retry.json
```

Render HTML only through `--from-report`. The retry reuses frozen targets and
does not select new seeds after output.

## Decision

- GO: all red families have one admissible owner, zero reconciliation and
  outcome/RNG-neutral instrumentation;
- REFINE: a canonical fact or fail-closed rule is still wrong;
- STOP / RETHINK: a family remains causally ambiguous.

After GO, Steps 06B11-06B16 remain conditional on their named owners. Step
06B17 is always the final integrated `7 x 10` JSON/HTML checkpoint.

## Expected Files

- locked profile/report artifacts under `simulation-out/` only;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_1_OWNER_ATTRIBUTION.md`;
- this step, phase README, audit README and project status;
- no gameplay file.

## Required Checks

The checkpoint runs alone with exactly `7` workers; HTML renders only from the
canonical JSON. Then `pnpm check`, `git diff --check`, `graphify update .`.

## Outcome

| Family | Owner |
|---|---|
| standings hierarchy | `population_strength` |
| veteran load | `renewal_quality` |
| generational renewal | `development_realization` |
| leader production | `actor_allocation` |
| club identity | `annual_intake_identity_erosion` |

The retry completed `7 x 10` with exactly `7` workers, process exit `0`, report
decision `OWNER_IDENTIFIED` and `0` reconciliation failures. It opens only the
named owner corrections in Steps 06B11, 06B13, 06B14 and 06B16, separated by
their checkpoints. No unmeasured gameplay family is opened.

Artifact:
`simulation-out/phase81a-l5-1-owner-attribution-7x10-retry.json`.
