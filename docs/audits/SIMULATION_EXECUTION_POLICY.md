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

## Longitudinal Cohort Schedule

The phase sequence has evolved since this policy was created; the worker
contract has not. Phase 81 Step 15 completed its checkpointed `50 x 20` engine
run. The remaining scheduled long runs are:

- Phase 81C Step 07: world integrity, exactly `750 x 10`, `750` stable
  one-world shards and exactly `7` workers;
- Phase 82B Step 09: completed competitive market, `50 x 20`, `50` stable
  shards and exactly `7` workers.

Phase 81A Step 16 owns bounded contextual-engine acceptance and Phase 82A runs
no longitudinal cohort. Every long run uses an explicit checkpoint directory,
a report path frozen before execution and a no-work resume proof. None replaces
Phase 79 Step 14's separate unrun release-scale gate.
