# Step 02 - Real-Career Before-State

## Status

Not started.

## Goal

Build the deterministic instrument that measures formation, tactic, role, tie,
runtime, and low-block behaviour on the real career path.

## User-Facing Reason

The phase must improve what a player actually meets, not a synthetic population
that forces every club into `4-4-2`.

## What To Implement

Create a deep `TacticalAgencyAudit` Module traversing:

```text
generated world -> available squad -> selectCareerAiTeam -> fixture -> report
```

Record formation frequency, first/second structural score, exact ties, catalog
reorder sensitivity, ten primary-role frequencies, coverage warnings, tactic
frequency, replay throughput, and wall clock.

The CLI accepts an explicit worker count. In checkpoint mode it requires
`--workers=7`, partitions deterministic work by stable key across those seven
workers, and records the effective count in every report.

Measure `low_block` versus neutral at equal quality with paired seeds in the same
unit: own xG, conceded xG, their deltas, and ratio. Preserve the historical
occasion-volume values only as a separate diagnostic.

Do not change generation, selection, or match behaviour.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/tactical-agency-report.ts`
- `apps/cli/src/commands/tactical-agency-report.test.ts`
- `apps/cli/src/index.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `03-checkpoint-a-ownership-and-before-state.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts
pnpm exec vitest run apps/cli/src/commands/tactical-agency-report.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The audit is deterministic, reaches real generated worlds, records all
denominators and seed manifests, measures xG before-state and cost, accepts
exactly seven checkpoint workers, rejects any other checkpoint count, and
changes no gameplay. Step 03 is the only next action.
