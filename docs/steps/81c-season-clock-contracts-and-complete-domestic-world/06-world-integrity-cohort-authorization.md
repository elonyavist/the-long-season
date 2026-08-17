# Step 06 - World-Integrity Cohort Authorization

## Status

Blocked behind Step 05. Measurement and preregistration only.

## Goal

Remeasure the contract/free-agent/world baseline after Steps 02-05 and freeze
the complete Step 07 contract before acceptance seeds run.

## What To Implement

- Re-run the exact Step 01 population and reconcile every contract, free-agent,
  fixture, table and player-stat quantity.
- Attribute free-agent cadence changes to the season clock while retaining the
  Phase 81B signing policy unchanged. If ranking behavior changed, stop for
  contamination rather than accepting the cadence result.
- Report opening stock, unique inflow, unique attributed signing, other outflow
  and closing stock. Repeated evaluations remain diagnostic only.
- Freeze Step 07:
  - exact seed prefix and unused acceptance seeds;
  - exact `7 x 10` canary and `750 x 10` acceptance populations;
  - exactly seven workers and 750 stable one-world shards;
  - checkpoint/resume directory and cache signature;
  - complete metric IDs, populations, formulas and verdict ownership;
  - p50/p90 throughput, maximum wall clock, memory/artifact limits;
  - canonical JSON/HTML separation and execution-metadata exclusions;
  - preregistered manual HTML examples selected without output access.
- Enumerate inherited Phase 81A/81B metric IDs individually. Only metrics
  meaningful on Step 07's population may bind.
- Decide whether evidence still supports starting Phase 82A after Phase 81C.
  The recommendation is recorded, but 82A remains closed until Step 07 GO.

## What NOT To Implement

- No gameplay correction or threshold movement.
- No acceptance-seed execution.
- No loans/races.
- No new report command or simulator.

## Expected Files

- Step 01 baseline profile/report modules and tests
- Step 07 locked profiles/metric register documents, not acceptance artifacts
- `docs/audits/PHASE_81C_SEASON_CLOCK_WORLD_REPORT.md` (new)
- `docs/audits/PHASE_81C_750X10_PREREGISTRATION.md` (new)
- audit index, this step, Step 07 and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81c-season-clock-world-post-v1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81c-season-clock-world-post-v1.json
pnpm check
git diff --check
```

The bounded measurement runs alone; profile IDs are final only after Step 00/01
registration.

## Definition Of Done

- Contract/free-agent/world changes are measured on the frozen population.
- The Phase 81B signing policy is proven uncontaminated.
- Every Step 07 gate, population, budget and artifact rule is preregistered.
- GO authorizes Step 07 only; REFINE reopens a named Phase 81C owner.
- Phase 82A remains closed.

