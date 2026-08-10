# Step 06B12C - Checkpoint L5.2B Fresh Standings Validation 7 x 10

## Status

Done on 2026-08-09: **STOP / RETHINK**. Structural facts all reconciled, First
Division reached credible spread (`47.7571`) and PPG deviation (`0.3861`), and
Second Division passed every target. Third-Division draw share rose to
`0.2987`, outside `0.2391..0.2868`; the global conversion reduction is rejected
and removed. Its fresh seeds are never used to choose a replacement value.

## Locked Population

- `7` worlds x `10` seasons x `3` divisions;
- fresh seed prefix `phase81a-standings-hierarchy-l5-2b-v1`;
- exactly `7` workers;
- unchanged historical targets and canonical evaluator;
- profile `phase81a-standings-hierarchy-l5-2b-7x10`;
- JSON output
  `simulation-out/phase81a-standings-hierarchy-l5-2b-7x10.json`.

## Decision

- **GO:** all six metrics pass in every division and every structural count is
  zero; open 06B13;
- **REFINE:** only a corrected owner remains red and every other division and
  guardrail holds; reopen 06B12B once;
- **STOP / RETHINK:** a new owner, regression, or reconciliation failure
  appears. Do not tune another coefficient on these validation seeds.

## Expected Files

- report registry and planner tests; the existing localized powered-standings
  label is reused because rendering does not need a second copy of the same
  description;
- this step, 06B12B, phase README, audit README and project status;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_2B_STANDINGS_VALIDATION.md` (new);
- generated JSON under ignored `simulation-out/`.

## Required Checks

Locked run alone, deterministic cached rebuild, focused report tests,
`pnpm check`, `git diff --check`, and `graphify update .`.

## Outcome

| Division | Champion | Spread | PPG SD | Goals/match | Draw share | Result |
|---|---:|---:|---:|---:|---:|---|
| First | `72.1429` | `47.7571` | `0.3861` | `2.6546` | `0.2819` | champion low |
| Second | `65.7286` | `38.1429` | `0.3033` | `2.6084` | `0.2937` | pass |
| Third | `66.5143` | `39.6571` | `0.3148` | `2.6060` | `0.2987` | draw high |

The result does not authorize direct draw resolution. 06B12D validates the
retained population correction with the original shared conversion bands.
