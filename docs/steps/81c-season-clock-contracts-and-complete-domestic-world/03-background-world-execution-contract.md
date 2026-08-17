# Step 03 - Background-World Execution Contract

## Status

Blocked behind Step 02. Documentation and bounded measurement only.

## Goal

Freeze a background-fixture contract that can actually support canonical
season rollover and the later world-integrity cohort.

## What To Implement

- Enumerate every registered domestic competition whose completion is required
  by the canonical career rollover path.
- Trace the actual runner from `simulation-report` through workers, career
  advancement, fixture results, tables, participation, scorers and assists.
- Freeze one commit order for:
  1. arrival at a live manager fixture;
  2. volatile live-match session;
  3. committed manager result;
  4. same-date automatic results;
  5. later automatic dates;
  6. season completion/rollover.
- Prove a discarded live session commits neither the manager result nor
  background work; retry derives identical results from `(worldSeed,
  fixtureId)`.
- Use `Fixture.result` as canonical idempotency. Any additional durable fact
  requires a non-derivability proof before entering Expected Files.
- Freeze the automatic match detail level. It must produce the canonical facts
  needed by tables, appearances, goals and assists without retaining per-minute
  telemetry that no consumer needs.
- Freeze p50/p90 throughput, memory, artifact-size and wall-clock budgets on a
  bounded population before Step 04.
- Amend Step 04/07 Expected Files with the actual owners found through Graphify.

## What NOT To Implement

- No fixture behavior change.
- No selected-division-only shortcut.
- No second simulator, table builder or player-stat reconstruction.
- No acceptance-seed run.

## Expected Files

- this step
- Step 04, Step 06 and Step 07 contract/Expected Files corrections
- `docs/audits/PHASE_81C_BACKGROUND_WORLD_CONTRACT.md` (new)
- audit index and `docs/PROJECT_STATUS.md`
- no production code

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --help
git diff --check
graphify update .
```

## Definition Of Done

- The rollover population is executable and no longer described as
  selected-division-only.
- Commit/discard/retry ordering is unambiguous.
- Canonical facts and forbidden reconstructions are named.
- Operational budgets and actual production owners are frozen.
- Step 04 is the only next action.
