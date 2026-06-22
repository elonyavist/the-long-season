# Phase 39 - Engine Quality Hardening And Match Explanation Trace

## Goal

Harden the current match engine code and add deterministic explanation
traceability without changing gameplay behavior unless a narrow, documented bug
is proven.

This phase exists because Phase 38 concluded that the engine/calculator is
acceptable, but the next high-value improvement is readability and
explainability: the manager should eventually understand why a match changed,
not only see the final score.

## Product intent

The user should feel that:

- player quality matters for readable football reasons;
- tactical choices, lineup choices, role choices, and condition have visible
  effects;
- surprising results remain possible but can be explained after the match;
- reports support game-design decisions instead of chasing prettier math;
- engine code stays clean enough that future features do not stack on unclear
  helpers or duplicated logic.

## Context

Phase 38 found:

- team-strength sensitivity is directionally credible;
- chance generation/conversion is directionally credible;
- causal actors are plausible for the current aggregate engine;
- tactic, lineup, and condition effects are visible;
- performance is acceptable;
- no broad optimization or balance tuning is justified now.

Phase 39 should therefore avoid a rewrite. It should improve confidence,
maintainability, and explanation surfaces while preserving deterministic output.

## Step order

1. `01-phase-38-baseline-and-behavior-lock.md`
2. `02-engine-code-quality-audit.md`
3. `03-safe-engine-cleanup-pass.md`
4. `04-match-explanation-trace-contract.md`
5. `05-trace-emission-without-outcome-change.md`
6. `06-cli-fixture-explanation-inspection.md`
7. `07-regression-gate-and-phase-report.md`

## Phase constraints

- Do not tune match probabilities to change averages.
- Do not optimize for speed unless a measured bottleneck blocks the current
  workflow.
- Do not rewrite the match engine into a full possession/duel chain.
- Do not introduce automatic tactical advice or decisions.
- Do not add LLM-generated prose, narrative text, or UI.
- Do not add trace data that changes RNG consumption or match outcomes.
- Trace output must be structured and language-agnostic in engine/domain layers.
- CLI-visible text must use localization keys.
- Preserve deterministic output by seed.
- Remove or refactor redundant code only when the active step allows it and the
  regression gate proves behavior is unchanged.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched engine/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli simulate-season --seed=world-a`;
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- representative deterministic repeat/diff for seeded fixture output;
- `git diff --check`.

## Definition of Done

- Current behavior is captured before cleanup or trace work.
- Engine cleanup removes or simplifies only proven redundant/local code.
- The match explanation trace contract is structured, deterministic, and
  language-agnostic.
- Trace emission does not change scores, event order, player stats, balance
  metrics, or long-run report status.
- CLI can inspect explanation trace for a fixture without replacing current
  match detail output.
- The final report states whether the engine is cleaner, whether traceability is
  useful, and what still remains aggregate/opaque.
- `docs/PROJECT_STATUS.md` records Phase 39 as complete or blocked.
