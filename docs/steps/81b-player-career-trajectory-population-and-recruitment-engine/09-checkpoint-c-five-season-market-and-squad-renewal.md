# Step 09 - Checkpoint C: Five-Season Market And Squad Renewal

## Status

Blocked behind Step 08.

## Goal

Verify on `7 x 5` that forecast, AI intents and market behavior create early
renewal without destroying squad/role/formation health.

## What To Implement

- Register the frozen Step 00 `7 x 5` profile with exact seven workers.
- Measure by world/division/season:
  - intent creation and terminal funnel;
  - acquired player tier/age/role/value and intent fit;
  - completed transfers toward useful competitive level;
  - free-agent stock, unique inflow, unique attributed signing and closing
    stock under the current contract clock;
  - free-agent acquisitions split by intent, ability band, age, role and
    competitive level;
  - successor need reopened after sale where reachable;
  - generated player appearances/minutes;
  - squad size/role floors/age distribution;
  - forecast-class early calibration;
  - tactical formation diversity/league replication;
  - goals, assists, points, finance and transfer reconciliation.
- Intent gate uses one unique terminal outcome per need; repeated evaluations
  are diagnostic events, not independent needs.
- Free-agent gates prove non-vacuous stock and drain under the current clock;
  they do not freeze a season-boundary peak/trough cadence. Phase 81C changes
  that clock and must remeasure the cycle without changing this AI policy.
- Pair worlds/seeds when comparing prior behavior. Never attribute an
  unpaired difference.
- Decide GO/REFINE/STOP with named owner: forecast, intent derivation, target
  scoring, population or instrument.
- Emit the exact Checkpoint C metric IDs and denominators from
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
  `NOT_EVALUATED` for a required intent/channel blocks GO.

## What NOT To Implement

- No gameplay correction inside checkpoint step.
- No HTML requirement.
- No 15-season conclusion from five seasons.
- No threshold move.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- the Step 07 intent-attribution evaluator and test
- existing `generational-succession.ts`, `league-diversity-gate.ts` and their
  tests only when their canonical readers are reused or their metadata changes
- `packages/simulation-tools/src/modular-report/report-contract.ts` and test
  only if canonical artifact metadata changes
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only for a pre-output correction
  required by production truth
- `docs/audits/PHASE_81B_CHECKPOINT_C_MARKET_RENEWAL.md`
- `docs/audits/README.md`
- this step and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81b-market-c-7x5 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-c-7x5.json
pnpm check
git diff --check
```

Run alone and capture actual exit/hash.

## Definition Of Done

- All three intents and their terminal paths are non-vacuous.
- Medium depth, ready upgrade and succession behavior are distinguishable for
  both owned and free-agent candidate channels.
- Free-agent inflow/outflow reconcile by unique player transition, and the pool
  neither remains a permanent warehouse nor drains through a second planner.
- Squads, roles, tactics, market and finance remain coherent.
- Only GO opens Checkpoint D.
