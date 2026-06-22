# Step 04 - Match Explanation Trace Contract

## Goal

Define a structured, deterministic match explanation trace contract without
emitting it yet.

The contract should explain broad football factors, not write prose.

## Context

Phase 38 found that the next useful engine improvement is diagnostic clarity.
The manager eventually needs to understand whether a result was shaped by player
quality, lineup, tactics, condition, home advantage, or variance. That requires
a stable data contract before CLI/UI rendering.

## Expected files

- domain files only if the contract must be durable or shared outside engine
- engine files if the contract is engine-local first
- focused tests for the new contract
- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Decide whether the first trace contract is engine-local or domain durable.
  Prefer engine-local unless save/report durability is needed now.
- Define language-agnostic trace types for:
  - team strength snapshot;
  - tactic distribution snapshot;
  - lineup/role snapshot;
  - condition impact snapshot;
  - opportunity/chance context summary;
  - randomness/variance marker as data, not prose.
- Include stable machine keys suitable for future localization/rendering.
- Keep trace optional and non-authoritative: simulation results remain the
  source of truth.
- Add contract tests for shape, determinism, and serialization safety.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not emit trace during simulation yet.
- Do not add CLI output.
- Do not add natural-language explanations.
- Do not expose hidden potential or hidden scouting data.
- Do not add advice such as "buy a player" or "change tactic".
- Do not change match outcomes.
- Do not start Step 05.

## Required checks

- focused tests for the new contract
- `pnpm --filter @game/domain run typecheck` if domain is touched
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `git diff --check`

## Definition of Done

- A structured trace contract exists.
- The contract is deterministic, serializable, and language-agnostic.
- No simulation behavior changes.
- `docs/PROJECT_STATUS.md` points to Step 05 as the next active step.
