# Step 06B23L1 - Checkpoint L6.3H Direct-Free-Kick Path 7 x 1

## Status

Done - **GO**. Complete path, penalties and ordinary assists all hold.

## Frozen Population

- profile `phase81a-direct-free-kick-l6-3h-7x1`;
- prefix `phase81a-direct-free-kick-l6-3h-v1`;
- exactly `7` fresh worlds, `1` season and `7` workers;
- First Division; standard report; no cache or HTML;
- `match-discipline-calibration-v2` required in every world.

## Decision

- direct attempts/match: `1.1529334212 +/- 0.10`;
- direct conversion: `0.0646083476 +/- 0.02`;
- direct goals/match: `0.0744891233 +/- 0.025`;
- penalties retain their accepted attempt and conversion bands;
- ordinary assisted share retains `0.7511574074 +/- 0.02`;
- all scored/saved/missed branches, event/stat/player reconciliation and the v2
  stamp are mandatory.

**GO** requires every item. **REFINE** reopens only the attributed direct-shot
frequency or conversion owner. **STOP / RETHINK** covers structural,
reconciliation, penalty or ordinary-assist regressions.

## Expected Files

- assist/dead-ball evaluator and test;
- career checkpoint routing, locked profile and five-language labels;
- this step, audit, Phase README, status and index.

## Required Verification And Command

```bash
nvm use 24.19.0
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-direct-free-kick-l6-3h-7x1 \
  --format=json \
  --report-output=simulation-out/phase81a-direct-free-kick-l6-3h-7x1.json
git diff --check
graphify update .
```

## Result

| Measure | Fresh game | Frozen reference | Result |
|---|---:|---:|---:|
| direct attempts / match | `1.0648926237` | `1.1529334212 +/- 0.10` | held |
| direct conversion | `0.0565541429` | `0.0646083476 +/- 0.02` | held |
| direct goals / match | `0.0602240896` | `0.0744891233 +/- 0.025` | held |
| penalty attempts / match | `0.2474323063` | `0.2636783125 +/- 0.03` | held |
| penalty conversion | `0.7358490566` | `0.7500 +/- 0.04` | held |
| ordinary assisted share | `0.7501261140` | `0.7511574074 +/- 0.02` | held |

There are `2,281` direct attempts and `129` goals across `2,142` First-Division
fixtures. Scored, saved and missed all occur; calibration v2 is universal and
reconciliation failures are zero. Decision: **GO**.

Report hash `8a7ee278eb7085ddec115e4f8d1f39ea`; file SHA-256
`9d63fc0a81a28bc228e1d97ce32a7112c5e8382a8222c56c724d39561f5de2cb`.
