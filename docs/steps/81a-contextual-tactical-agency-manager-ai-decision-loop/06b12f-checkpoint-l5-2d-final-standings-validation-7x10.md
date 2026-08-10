# Step 06B12F - Checkpoint L5.2D Final Standings Validation 7 x 10

## Status

Done on 2026-08-10: **GO**, process exit `0`.

## Locked Population

- `7` worlds x `10` seasons x `3` divisions;
- fresh seed prefix `phase81a-standings-hierarchy-l5-2d-v1`;
- exactly `7` workers;
- hierarchy `2.25/1.0/1.3` and conversion `0.0575/0.110/0.193`;
- unchanged historical gates and canonical evaluator;
- profile `phase81a-standings-hierarchy-l5-2d-7x10`;
- JSON output
  `simulation-out/phase81a-standings-hierarchy-l5-2d-7x10.json`.

## Decision

- **GO:** all six metrics pass in every division and all structural facts
  reconcile; open 06B13;
- **STOP / RETHINK:** anything fails. No further numeric correction is allowed
  in this table tranche; record the red result for 06B17 rather than tuning it.

## Expected Files

- report registry and planner tests;
- this step, 06B12E, phase README, audit README and project status;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_2D_FINAL_STANDINGS.md` (new);
- generated JSON under ignored `simulation-out/`.

## Required Checks

Locked run alone, deterministic cached rebuild, focused report tests,
`pnpm check`, `git diff --check`, and `graphify update .`.

## Outcome

| Division | Champion | Last | Spread | PPG SD | Goals/match | Draw share |
|---|---:|---:|---:|---:|---:|---:|
| First | `72.7429` | `23.3000` | `49.4429` | `0.4023` | `2.8412` | `0.2737` |
| Second | `66.1286` | `27.4714` | `38.6571` | `0.3012` | `2.7390` | `0.2879` |
| Third | `68.3857` | `26.4429` | `41.9429` | `0.3280` | `2.7437` | `0.2839` |

All `18` metric checks pass. The artifact contains exactly `70` seasons per
division, worker count `7`, and zero fallback, unavailable-player or
reconciliation failures. This GO opens 06B13; no further table tuning is
authorized.
