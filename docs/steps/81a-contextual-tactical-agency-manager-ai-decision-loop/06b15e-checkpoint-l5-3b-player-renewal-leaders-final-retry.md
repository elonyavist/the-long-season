# Step 06B15E - Checkpoint L5.3B: Player Renewal And Leaders Final Retry

## Status

**STOP / RETHINK on 2026-08-10.** The fresh `7 x 10` completed with exactly
seven workers and zero reconciliation failures, but nine frozen player gates
remain red. The preregistered final-retry rule closes 06B16 and 06B17 until a
new architectural owner checkpoint is accepted.

## Locked Population

- profile `phase81a-player-renewal-leaders-l5-3b-7x10`;
- prefix `phase81a-player-renewal-leaders-l5-3b-v1`, never used before;
- seven worlds, ten seasons, exactly seven workers;
- identical facts and frozen L5.3 gates;
- diagnostic JSON, no HTML and no target override.

## Decision

- `GO`: every gate holds and 06B16 opens;
- `REFINE`: only one uniquely attributed existing owner may reopen;
- `STOP / RETHINK`: the remaining gates require age/output/origin control or
  contradict the reachable football population.

## Expected Files

Report profile/planner tests, canonical JSON, this step, phase README, audit
README and project status. No gameplay file.

## Required Checks

Run alone with exactly seven workers, then `pnpm check`, `git diff --check` and
`graphify update .` before opening 06B16.

## Outcome

| Metric | L5.3B | Target |
|---|---:|---:|
| age-33+ starts mean | `22.5838` | `12..17` |
| age-33+ minutes mean | `1844.34` | `1100..1500` |
| generated leader share | `0.2143` | effective `>= 0.50` with opening gate |
| opening leader share | `0.7857` | `<= 0.50` |
| top-ten scorer mean | `19.94` | `14.5..18.5` |
| top-ten assist mean | `8.09` | `8..10.5` - pass |
| scorer / assist age | `30.13 / 30.01` | `<= 28.5 / <= 28.5` |
| age-33+ scorer / assist share | `0.29 / 0.28` | `<= 0.12 / <= 0.12` |
| shooter / creator nomination correlation | `0.0731 / 0.3295` | diagnostic |
| real age-33+ leader observations | `57` | `> 0` - pass |
| reconciliation failures | `0` | `0` - pass |

The two corrections were real but not stable answers to renewal. L5.3A reached
`28.81%` generated leaders; the independent L5.3B population returned
`21.43%`. Quality-matched younger alternatives remain only `2.9172%` of
veteran-start observations. More prospect-ceiling or actor-response tuning
would therefore select a coefficient after reading output.

The remaining question spans at least three live owners: first-division
opening-star retention, academy-to-senior replacement quality, and the closed
world's transfer/external-player boundary. Existing aging and exit ablations
have already failed independently, while the exception threshold, market and
academy effects have not been paired on the same footballers. No unique owner
is demonstrated, so the checkpoint follows its declared `STOP / RETHINK` arm.

Artifact:
`simulation-out/phase81a-player-renewal-leaders-l5-3b-7x10.json`.

## Required Rethink Before 06B16

Preregister a paired architectural attribution that holds players, seeds and
match schedules fixed while separating:

1. high-quality opening-player retention/decline;
2. annual prospect ceiling and senior realization;
3. external/transfer replacement absent from the closed three-division world.

It must also decide whether `opening_academy` belongs with opening incumbents or
with generational renewal. No coefficient, gate or origin grouping may be
chosen after observing the paired result.
