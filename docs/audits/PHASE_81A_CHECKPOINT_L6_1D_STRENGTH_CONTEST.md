# Phase 81A Checkpoint L6.1D - Strength Contest Translation

## Decision

Executed on 2026-08-11. The `1.25` population-strength contest candidate moved
the First-Division champion mean into the frozen historical band while all
seventeen cross-division guardrails held. The canonical decision is still
**`REFINE`** because the preregistered paired-response coherence gate recorded
`17/28` against `>= 20/28`.

This is not converted to `GO` after seeing the output. The candidate remains
unaccepted and no downstream correction or integrated checkpoint opens.

## Population

| Run | Population | Workers | Exit | Report hash | SHA-256 |
| --- | --- | ---: | ---: | --- | --- |
| canary | `7` worlds x `1` season | `7` | `0` | `813f4fb36d10a1481a544edaf67ba021` | `ab61efc279e46090c6ef4e882e081fa6695e3cac491b86ac4171f2df978d94c2` |
| full | `28` worlds x `10` seasons | `7` | `1` | `ce0c6d70571c1606b2e2a7cf2bf2dcb9` | `b81ba28add0d5ece08acc731c7ea8267ac515e014ce78d5f0497b9b31bc7146e` |

The canary reconciled all `21` competition-seasons and returned checkpoint
`GO`; balance was deliberately `not_evaluated`. The full run reconciled all
`840` competition-seasons and returned checkpoint and balance `REFINE`. Both
ran alone with the locked profiles, seed prefixes and exactly seven workers.

## Product Response

| Measurement | Legacy `1.0` | Product `1.25` | Result |
| --- | ---: | ---: | --- |
| First-Division champion mean | `71.4285714286` | `73.7714285714` | inside `72.3842..87.7158` |
| paired raw delta | - | `+2.3428571429` | half-width 95% `0.3593232322` |
| distance improvement | - | `+0.9742428571` | half-width 95% `0.3600515573` |
| worlds with raw delta `>= 0.5` | - | `28/28` | diagnostic |
| product worlds inside the band | - | `23/28` | diagnostic |
| preregistered coherent worlds | - | `17/28` | **broken; required `20/28`** |
| guardrails | - | `17/17` | held |
| reconciliation failures | - | `0` | held |

All twenty-eight raw paired deltas have the intended sign and meet `0.5`.
There is no evidence of a transitive club-rank bonus: the product change acts
only on the four player-department contests declared by the step.

The lower divisions did not pay for the First-Division repair. Their champion
means moved from `65.6750` to `67.3393` and from `68.7429` to `70.6393` while
remaining inside their independent bands. First-, Second- and Third-Division
last points, spread, PPG deviation, goals per match and draw share all passed
the frozen no-new-distance reader.

## Why The Formal Gate Failed

The preregistered coherence rule counted only worlds whose distance to the
champion band improved by at least `0.5`. Nine legacy worlds were already
inside the band, so their legacy distance was zero. When the product also
remained inside, the measured improvement was necessarily zero; those healthy
worlds could not count.

On this population the rule therefore had only nineteen worlds in which a
positive distance improvement was possible, yet required twenty successes.
It was arithmetically impassable after the population was known. That is a
measurement-design defect, not permission to alter the completed gate.

For diagnosis only, a health-preserving reader would count a world when either:

1. legacy is inside the band and product remains inside; or
2. product improves distance by at least `0.5`.

That post-run diagnostic describes `26/28` worlds. It is not a pass and may not
be cited as one. A retry must freeze this or another reader before using fresh
seeds, keep the `20/28` count and all seventeen existing guardrails, and retain
the product multiplier at `1.25` so the retry validates measurement rather than
selecting a second gameplay coefficient.

## Reproduction

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-strength-contest-l6-1d-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-strength-contest-l6-1d-canary-7x1.json

pnpm cli simulation-report \
  --profile=phase81a-strength-contest-l6-1d-28x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-strength-contest-l6-1d-28x10.json
```

The full command's real exit code was `1`. The generated JSON files and their
fact caches are ignored local artifacts; this audit is the durable decision.
