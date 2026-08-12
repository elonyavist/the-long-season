# Phase 81A - Checkpoint L6.3H Direct-Free-Kick Path

## Verdict

**GO.** Named direct free kicks now supply believable attempts and goals while
the already-accepted penalty and ordinary-assist lanes remain healthy.

## Frozen Run

- profile `phase81a-direct-free-kick-l6-3h-7x1`;
- prefix `phase81a-direct-free-kick-l6-3h-v1`;
- `7` fresh worlds, `1` season, exactly `7` workers;
- First Division: `2,142` fixtures;
- `match-discipline-calibration-v2` in every world;
- exit `0`, report `PASS`, zero reconciliation;
- report hash `8a7ee278eb7085ddec115e4f8d1f39ea`;
- file SHA-256
  `9d63fc0a81a28bc228e1d97ce32a7112c5e8382a8222c56c724d39561f5de2cb`.

## Decision Table

| Lane | Fresh value | Frozen band | Decision |
|---|---:|---:|---:|
| direct attempts/match | `1.0648926237` | `1.1529334212 +/- 0.10` | held |
| direct conversion | `0.0565541429` | `0.0646083476 +/- 0.02` | held |
| direct goals/match | `0.0602240896` | `0.0744891233 +/- 0.025` | held |
| penalty attempts/match | `0.2474323063` | `0.2636783125 +/- 0.03` | held |
| penalty conversion | `0.7358490566` | `0.7500 +/- 0.04` | held |
| ordinary assisted share | `0.7501261140` | `0.7511574074 +/- 0.02` | held |

`2,281` direct attempts produce `129` goals. Scored, saved and missed branches
all occur. This is a population calibration, not a hard player outcome: taker
and goalkeeper attributes move each attempt around the empirical anchor.

## Handoff

The shooter, creator, assist and dead-ball branch is closed. The next evidence
must return to ten-season generational renewal and attribute the remaining
career bottleneck before changing generation, development, market or selection.
