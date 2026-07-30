# Step 01 - Seven-Worker Simulation Policy And Phase Bootstrap

## Status

Done.

The repository now defaults every partitionable batch to
`min(7, independent work items)`, caps explicit/environment overrides at seven,
and caps Vitest at seven. Direct and checkpointed long-run reports share the
same pure owner; host CPU count and the old small-sample sequential threshold
are no longer policy.

Verification: focused policy tests PASS (`4/4`); owning typechecks PASS;
existing CLI integration suite PASS (`20/20`); full `pnpm check` PASS
(`253` files / `1,586` tests); Dependency Cruiser PASS (`764` modules /
`2,952` dependencies).

## Goal

Create one repository-wide execution policy so current and future batch
simulations default to seven workers without saturating the workstation, while
also establishing Phase 80 as the documented owner of the forthcoming
graphical and structural reworks.

## Accepted Semantics

- The worker ceiling and default are both `7`.
- A batch with fewer than seven independent work items uses
  `min(7, workItemCount)`; a single simulation necessarily uses one worker.
- Explicit CLI/test overrides may request fewer workers.
- An override above seven is capped at seven; no runner may increase the
  repository ceiling.
- Worker count does not change seeds, partition order, result ordering,
  checkpoint hashes, gameplay behavior, or thresholds.
- Resumable long runs continue to require an explicit checkpoint directory and
  stable shards.
- Vitest receives the same maximum-worker ceiling to avoid unconstrained test
  concurrency. Playwright's browser-worker policy remains separate because it
  is visual QA, not a simulation batch.

## What To Implement

- Add one pure `@game/simulation-tools` execution-policy Module with:
  - the canonical worker limit/default;
  - a resolver that returns `min(requested-or-default, work items, 7)`;
  - validation and focused tests.
- Route both direct and resumable `ten-season-report` batches through it.
- Remove host-dependent `availableParallelism()` defaults and the old
  small-sample sequential threshold.
- Replace `TLS_LONG_RUN_WORKERS` with the canonical
  `TLS_SIMULATION_WORKERS` environment override. It may reduce concurrency but
  cannot raise it above seven.
- Include the worker count in checkpointed reproduction commands.
- Cap Vitest at seven workers.
- Document the policy in project rules, architecture, audit index, roadmaps,
  status, and Phase 79/79D handoff text.
- Supersede the former Phase 80 finance reservation without implementing it.

## What NOT To Implement

- No gameplay, balance, seed, threshold, report-metric, or checkpoint-schema
  change.
- No worker threads inside domain, engine, content, storage, shared, UI, or
  React.
- No parallelization rewrite for synchronous single-season/single-world labs.
- No graphical or structural rework from the still-unknown Step 02 inventory.
- No `50 x 20` or Phase 79 release-scale run.
- No machine-specific CPU detection as a second policy owner.

## Expected Files

- `packages/simulation-tools/src/simulation-execution-policy.ts`
- `packages/simulation-tools/src/simulation-execution-policy.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-checkpoint.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `vitest.config.ts`
- `docs/PROJECT_RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/audits/SIMULATION_EXECUTION_POLICY.md`
- `docs/audits/README.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/README.md`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/08-50x20-browser-qa-phase-report-and-phase-79-handoff.md`
- `docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_REPORT.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/01-seven-worker-simulation-policy-and-phase-bootstrap.md`
- `docs/steps/80-graphical-and-structural-rework/02-accepted-graphical-and-structural-rework-inventory.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/simulation-execution-policy.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm check
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- One exported policy owns the default and maximum simulation worker count.
- Direct and resumable multi-world reports default to seven workers when at
  least seven work items exist.
- Smaller batches and explicit lower overrides remain valid.
- No current simulation worker default depends on host CPU count.
- Vitest cannot exceed seven workers.
- Focused and repository checks pass without changing simulation results.
- Phase 80 is the sole active phase and Step 02 is the next documented action.
