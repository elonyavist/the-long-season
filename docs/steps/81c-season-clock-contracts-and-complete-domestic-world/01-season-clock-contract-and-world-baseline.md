# Step 01 - Season Clock, Contract And World Baseline

## Status

Blocked behind Step 00.

## Goal

Freeze the unchanged before-state for contract timing, free-agent cadence and
domestic-world completeness before changing behavior.

## What To Implement

- Inventory every signed-contract expiry reader, offered-term unit/converter,
  negotiation field, persistence mapper, SQLite column and presentation caller.
- Measure contract expiries by month relative to the canonical competition
  season boundary, not calendar-month labels alone.
- Measure requested and effective offered-term months separately if both exist.
- Reuse the Phase 81B free-agent transition facts and report:
  - opening stock;
  - unique contract-expiry inflow;
  - other unique inflow by cause;
  - unique attributed AI signing outflow;
  - other unique outflow;
  - closing stock;
  - reconciliation residual, required to be zero.
- Measure domestic fixture completeness by world/season/competition:
  scheduled, resolved, unresolved, table matches, participation rows and
  season-rollover eligibility.
- Measure the exact production runner used by the future 7 x 10/750 x 10.
- Freeze all metric populations, denominators, seed prefixes, versions,
  thresholds and limitations before Step 02 changes behavior.

## What NOT To Implement

- No contract, free-agent, fixture or report behavior change.
- No background result generation.
- No new AI signing policy.
- No 750 x 10 execution.

## Expected Files

- canonical `simulation-report` registry/profile/section files needed for the
  read-only baseline, confirmed through Graphify before editing
- report tests and only non-derivable world facts required by the baseline
- `docs/audits/PHASE_81C_SEASON_CLOCK_WORLD_BASELINE.md` (new)
- `docs/audits/README.md`
- this step and Step 02 when the inventory changes its Expected Files
- `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81c-season-clock-world-baseline-v1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81c-season-clock-world-baseline-v1.json
pnpm check
git diff --check
graphify update .
```

The profile is locked in Step 00 and runs alone. If it does not yet exist, Step
00 must name the exact profile before this command is accepted.

## Definition Of Done

- The term-reader inventory is complete enough to make Step 02 scope truthful.
- Contract and free-agent quantities use explicit, reconciled denominators.
- Every incomplete domestic competition is visible rather than inferred.
- Baseline thresholds are frozen before behavior changes.
- Step 02 is the only next action.

