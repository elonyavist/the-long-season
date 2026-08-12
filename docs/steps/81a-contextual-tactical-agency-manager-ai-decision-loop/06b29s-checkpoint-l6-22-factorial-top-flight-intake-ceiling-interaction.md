# Step 06B29S — Checkpoint L6.22 Factorial Top-Flight Intake And Ceiling Interaction

## Status

Planned and active. No arm has been simulated under this step.

## User-Facing Reason

The game still produces too few career-generated leaders after ten seasons.
L6.19 shows that a small top-flight ceiling tail alone does not solve it; L6.21
shows that producing more interesting prospects alone does not solve it. A
credible academy prospect needs both enough probability of appearing and enough
room to become a senior leader. This checkpoint tests that interaction before
changing another system.

## Frozen Factors

Only annual First-Division academy intake changes. The two binary factors are:

- **frequency off/on:** the L6.21 `+0.12` interesting probability, taken wholly
  from routine probability;
- **ceiling off/on:** the L6.19 interesting-prospect five-star tail, with a
  `1500` basis-point chance of ceiling five rather than the ordinary interesting
  ceiling.

This produces four exact arms on the same L6.20 seeds:

| Arm | Frequency | Ceiling tail |
| --- | --- | --- |
| `00` current | off | off |
| `10` frequency | on | off |
| `01` ceiling | off | on |
| `11` combined | on | on |

`00` and `10` reuse the already-written L6.20 and L6.21 facts only after cache
identity and world-seed equality are proven. `01` and `11` are fresh. There is
no RNG-neutral claim between arms: each arm is a deterministic world-level
policy comparison, and all decisions are paired by world seed.

## Frozen Measurements

Seven worlds, ten seasons, exactly seven workers. For each renewal metric report:

- all four arm levels;
- `10 - 00` and `01 - 00` isolated effects;
- the interaction `(11 - 01) - (10 - 00)`;
- the combined effect `11 - 00`;
- per-world signs and threshold coherence.

The report also records generated and accepted volume, prospect-class counts by
division, First-Division interesting leaders, current/stored quality, role
coverage, six-star stock, formations, champion points, transfers, integrated
gate keys and reconciliation.

## Frozen Decision

`GO` adopts both factors together only when arm `11` satisfies every L6.21
product target against `00`:

- routine share of First-Division stored-ceiling failures improves `>=0.10`;
- mature below-leader-quality share improves `>=0.04` in `>=5/7` worlds;
- stored-ceiling-below-leader share improves `>=0.06` in `>=5/7` worlds;
- career-generated leader share improves `>=0.03`, reaches `>=0.28`, and
  improves by `>=0.03` in `>=5/7` worlds;
- First-Division interesting leaders increase by `>=8`;
- the generated-leader-share interaction is positive by `>=0.02`, so the
  combined result is not merely one factor rediscovered;
- all four prospect classes remain reachable;
- Second/Third prospect-class counts and every division's total generation
  volume are exactly unchanged from `00`;
- no new integrated failure, guardrail regression or reconciliation failure.

`REFINE` removes both factors and closes probability/ceiling tuning when the
combined arm misses any renewal target without a structural failure.
`STOP / RETHINK` applies to cache mismatch, unreachable arms, new integrated
failure, lower-tier/volume drift, reconciliation failure, or contamination where
the fresh combined run does not reproduce its own deterministic cache replay.
No coefficient or target moves after arm output.

## Execution Order

1. Prove `00` and `10` cache identity and freeze the evaluator with unit tests.
2. Enable ceiling only, run and cache `01` alone.
3. Enable frequency as well, run and cache `11` alone.
4. Evaluate all four cached arms without simulating.
5. On `GO`, retain the combined product but remove arm-only instrumentation.
   On `REFINE`, remove both product factors and all L6.22-only code.
6. Update graphify, run the focused checks, then `pnpm check` alone.

## Expected Files

- `packages/content/src/generators/youth-development-level.ts` and test;
- `packages/content/src/generators/initial-youth-academies.ts` and test;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No engine, domain, persistence, web, market, growth, minutes, career-exit or
second report code.

## Required Checks

All gates run alone. The exact profile commands and immutable output paths are
added to this section before the first fresh arm runs. They must use
`pnpm cli simulation-report`, ten seasons and exactly seven workers. Closeout
requires focused tests, typecheck, `git diff --check`, graphify update and one
full `pnpm check` run alone.
