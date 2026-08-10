# Phase 81A Checkpoint L5.3 - Player Renewal And Leaders

## Decision

**STOP / RETHINK.** Three independent `7 x 10` populations completed with
exactly seven workers and zero reconciliation failures. Actor allocation became
player-dependent and assist output entered its historical band, but the player
world still does not renew its first-division leaders or veteran load credibly.
Steps 06B16 and 06B17 remain closed.

## Cohorts

| Cohort | Generated leaders | Opening leaders | Top-ten goals | Top-ten assists |
|---|---:|---:|---:|---:|
| L5.3 | `20.71%` | `79.29%` | `30.15` | `10.64` |
| L5.3A | `28.81%` | `71.19%` | `22.58` | `9.13` |
| L5.3B | `21.43%` | `78.57%` | `19.94` | `8.09` |

The opening and generated shares are complementary in
`generationalLeaderShares(...)`. Consequently the frozen `generated >= 0.30`
and `opening <= 0.50` pair has an effective generated threshold of `>= 0.50`.
That arithmetic was exposed after L5.3A and never used to move a target.

## What The Corrections Proved

- Real task attributes now affect creator and shooter selection. Conversion is
  centred on the exact shooter pool, so naming a better actor does not inflate
  team scoring in expectation.
- Self-created and two-player chances are both reachable; self-assists are not.
- The annual serious-prospect population reaches the existing high-potential
  rarity budget, and first-division good prospects can reach a four-star
  ceiling without becoming serious or ceiling-six.
- CLI and web still compose the same canonical world, and all career cache
  identities moved with gameplay changes.

Those are retained product improvements. They do not prove the renewal gate.

## Why Development Stops Here

The final population still records `22.5838` starts and `1844.34` minutes for
age-`33+` players, only `2.9172%` quality-matched younger alternatives, mean
leader ages around `30`, and age-`33+` leaderboard shares around `29%`.
Changing another ceiling or actor coefficient would be calibration against the
answer. Direct age/output/origin rules remain forbidden.

Earlier checkpoints already showed that stronger aging alone and exit pressure
alone did not restore renewal. The remaining causal question crosses retention,
academy realization and the external-player/transfer boundary. A paired owner
checkpoint is required before another gameplay step. The final integrated HTML
is intentionally not emitted: doing so under the label 06B17 would present an
unpassed engine as a completed result.

## Artifacts

- `simulation-out/phase81a-player-renewal-leaders-l5-3-7x10.json`
- `simulation-out/phase81a-player-renewal-leaders-l5-3a-7x10.json`
- `simulation-out/phase81a-player-renewal-leaders-l5-3b-7x10.json`
