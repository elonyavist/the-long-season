# Step 06B15C - Checkpoint L5.3A: Player Renewal And Leaders Retry

## Status

**REFINE on 2026-08-10.** The fresh run completed with seven workers and zero
reconciliation failures. Step 06B15D owns only the remaining ceiling-quality
and shooter-concentration residuals; 06B16 remains closed.

## Locked Population

- profile `phase81a-player-renewal-leaders-l5-3a-7x10`;
- fresh prefix `phase81a-player-renewal-leaders-l5-3a-v1`;
- exactly seven worlds, ten seasons and seven workers;
- the same sections, detail, facts and frozen gates as L5.3;
- no target, age policy or report formula changes.

## Decision

- `GO`: every L5.3 gate and reconciliation holds; open 06B16;
- `REFINE`: attribute only the remaining failed keys on this fresh population;
- `STOP / RETHINK`: success needs an age/output/origin rule or incompatible
  targets.

## Expected Files

- report registry and planner tests for the locked fresh profile;
- canonical JSON under `simulation-out/`;
- this step, phase README, audit README and project status;
- no gameplay file.

## Required Checks

The checkpoint runs alone with exactly seven workers. Then `pnpm check`,
`git diff --check` and `graphify update .` run before its decision opens 06B16.

## Outcome

| Metric | L5.3 | L5.3A | Target |
|---|---:|---:|---:|
| generated leader share | `0.2071` | `0.2881` | `>= 0.30` |
| opening leader share | `0.7929` | `0.7119` | `<= 0.50` |
| top-ten scorer mean | `30.15` | `22.58` | `14.5..18.5` |
| top-ten assist mean | `10.64` | `9.13` | `8..10.5` |
| shooter / creator correlation | `0.3753 / 0.4746` | `0.2201 / 0.3226` | diagnostic |
| age-33+ starts / minutes | `22.6115 / 1851.67` | `22.6615 / 1859.94` | `12..17 / 1100..1500` |
| scorer / assist age | `30.09 / 29.91` | `30.41 / 30.01` | `<= 28.5 / <= 28.5` |
| age-33+ scorer / assist share | `0.26 / 0.27` | `0.35 / 0.32` | `<= 0.12 / <= 0.12` |

The generated/opening shares are complementary by their canonical derivation.
The two frozen gates therefore combine to an effective generated-leader target
of `>= 0.50`; this arithmetic is recorded, not used to move either threshold.

Artifact:
`simulation-out/phase81a-player-renewal-leaders-l5-3a-7x10.json`.
