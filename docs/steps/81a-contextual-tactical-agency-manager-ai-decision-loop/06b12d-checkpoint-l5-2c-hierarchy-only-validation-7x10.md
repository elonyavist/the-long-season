# Step 06B12D - Checkpoint L5.2C Hierarchy-Only Validation 7 x 10

## Status

Done on 2026-08-09: **STOP / RETHINK**. All structural facts reconciled. First
Division remained narrowly below champion/spread minima (`71.8`, `46.4`),
Second-Division goals remained high (`2.7793`) and Third-Division draws remained
high (`0.2883`). 06B12E owns one final preregistered correction on a fixed
quarter-step grid; these seeds cannot validate it.

## Locked Population

- `7` worlds x `10` seasons x `3` divisions;
- fresh seed prefix `phase81a-standings-hierarchy-l5-2c-v1`;
- exactly `7` workers;
- original shared conversion bands `0.058/0.111/0.195`;
- retained senior hierarchy scales `2.0/1.0/1.25` by division;
- unchanged historical gates and canonical evaluator;
- profile `phase81a-standings-hierarchy-l5-2c-7x10`;
- JSON output
  `simulation-out/phase81a-standings-hierarchy-l5-2c-7x10.json`.

## Decision

- **GO:** all structural facts reconcile and every division passes all six
  frozen targets; open 06B13;
- **REFINE:** only hierarchy remains red while goals/draws hold; reopen only
  the population owner with a new attribution population;
- **STOP / RETHINK:** any goal/draw or structural failure persists. No further
  value may be chosen on these seeds.

## Expected Files

- report registry and planner tests;
- this step, 06B12B/C, phase README, audit README and project status;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_2C_HIERARCHY_VALIDATION.md` (new);
- generated JSON under ignored `simulation-out/`.

## Required Checks

Locked run alone, deterministic cached rebuild, focused report tests,
`pnpm check`, `git diff --check`, and `graphify update .`.

## Outcome

The hierarchy-only result rejects both direct result manipulation and the idea
that the original `2.0/1.0/1.25` scales are sufficient. It also shows the
conversion excess is roughly one percent, not the five-percent trial rejected
by 06B12C. No value is selected or validated on this corpus.
