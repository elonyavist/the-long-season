# Step 05 - Trace Emission Without Outcome Change

## Goal

Emit optional match explanation trace data without changing match outcomes,
event order, stats, or RNG consumption.

## Context

The trace should make the current aggregate model easier to inspect. It must not
become a hidden second simulation, and it must not consume the RNG stream in a
way that changes results.

## Expected files

- engine match-engine files
- engine use-case files only if trace must be returned by `simulateMatch` or
  `simulateSeason`
- focused engine tests
- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add optional trace emission behind explicit input or output flags.
- Use already-computed inputs and outcomes where possible.
- Do not consume additional RNG for trace data.
- Include enough data to explain:
  - starting team-strength differences;
  - tactic distribution differences;
  - lineup/role context;
  - condition multiplier impact if available;
  - chance/outcome summaries.
- Keep trace compact enough for CLI inspection.
- Add tests proving:
  - same seed with trace on/off has the same score;
  - same seed with trace on/off has the same event order;
  - player stats remain unchanged;
  - trace output is deterministic.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change opportunity rates or conversion probabilities.
- Do not change actor selection.
- Do not add CLI output yet.
- Do not add persistent save migration unless Step 04 required a durable domain
  contract.
- Do not add full possession chains.
- Do not start Step 06.

## Required checks

- focused match-engine tests
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Optional trace emission exists.
- Trace on/off does not change fixed-seed results.
- The audit records exactly which factors the trace explains and which remain
  aggregate.
- `docs/PROJECT_STATUS.md` points to Step 06 as the next active step.
