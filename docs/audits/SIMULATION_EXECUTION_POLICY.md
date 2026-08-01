# Simulation Execution Policy

Date: 2026-07-30

## Decision

Every current and future batch-simulation adapter uses one repository-wide
worker budget:

- default: `7`;
- maximum: `7`;
- actual concurrency: `min(7, independent work items)`;
- explicit overrides may reduce concurrency but cannot raise it.

A single world or indivisible simulation still uses one worker. This is not an
exception: seven workers require at least seven independent jobs.

## Canonical Owner

`packages/simulation-tools/src/simulation-execution-policy.ts` exports:

- `SIMULATION_WORKER_LIMIT`;
- `resolveSimulationWorkerCount`.

The resolver is pure and host-independent. It does not inspect CPU count,
change seeds, partition results, or choose gameplay policy.

CLI adapters may read `TLS_SIMULATION_WORKERS` as a lower operational override.
The value must be a positive integer and is always capped by the canonical
seven-worker limit. The superseded `TLS_LONG_RUN_WORKERS` variable is removed.

## Current Coverage

- Direct multi-world `ten-season-report` batches now use seven workers by
  default even below the former 100-world threshold.
- Resumable/checkpointed `ten-season-report` batches use the same resolver.
- Checkpoint reproduction commands record their actual worker count.
- Vitest uses the same seven-worker maximum.
- Single-world, single-season, and synchronous pure simulation functions remain
  in-process. If a future adapter partitions them into independent work, that
  adapter must consume the canonical resolver.
- Playwright remains on its browser-specific worker policy; it is visual QA,
  not a simulation batch.

## Determinism Contract

Worker count is execution metadata only:

- seeds remain derived from stable world/season identities;
- partitions and result rows are reassembled in canonical order;
- checkpoint hashes remain independent of completion timing;
- thresholds and pass/warn/fail semantics do not change;
- replay evidence records the actual execution strategy.

## Deferred Rework Cohort

Phases 80, 80A, 80B, and 80C run no longitudinal cohort. The sole deferred
replacement `50 x 20` belongs to Phase 81 Step 12 and must use:

- one explicit checkpoint directory;
- `50` stable shards;
- the canonical `7` workers;
- a report path frozen before execution.

It remains separate from Phase 79 Step 14's unrun release-scale gate.
