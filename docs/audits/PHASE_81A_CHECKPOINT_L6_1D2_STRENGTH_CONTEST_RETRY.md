# Phase 81A Checkpoint L6.1D2 - Strength-Contest Retry

## Decision

Executed on 2026-08-11. The fresh checkpoint returned **`GO`** and accepts the
already-implemented `1.25` department-contest multiplier. It changes no
gameplay number from L6.1D; it replaces only the defective distance-only reader
for this new population. L6.1D itself remains `REFINE` and is not rewritten.

## Population

| Run | Population | Workers | Exit | Report hash | SHA-256 |
| --- | --- | ---: | ---: | --- | --- |
| canary | `7` worlds x `1` season | `7` | `0` | `38be6c3670f76015438515140bcc1937` | `71fa2fc534c87e4456f90233a03b1268f89442715b7d060d8ffe9caebe9e68fb` |
| full | `28` worlds x `10` seasons | `7` | `0` | `682f859471ebd2c3a475cd93bdb19ac4` | `9ba0e497d10c9784d1fd72b12edf5d91805bfea5acf2a3821d8aca68f0c18a7c` |

Both profiles used fresh L6.1D2 seed prefixes and independent caches. The
canary reconciled `21` competition-seasons and kept balance `not_evaluated`.
The full cohort reconciled all `840` competition-seasons. Both commands ran
alone with exactly seven workers and their real exit codes were captured.

## Result

| Measurement | Legacy `1.0` | Product `1.25` | Result |
| --- | ---: | ---: | --- |
| First-Division champion mean | `72.8035714286` | `75.2142857143` | product inside `72.3842..87.7158` |
| paired raw delta | - | `+2.4107142857` | half-width 95% `0.3288896584` |
| worlds inside the band | `17/28` | `27/28` | diagnostic |
| distance improvement `>= 0.5` | - | `8/28` | diagnostic |
| health-preserving worlds | - | `25/28` | held against `>= 20/28` |
| direction-preserving worlds | - | `28/28` | held against `>= 20/28` |
| historical table guardrails | - | `17/17` | held |
| reconciliation failures | - | `0` | held |

The health reader counts either a legacy-inside/product-inside world or a
distance improvement of at least `0.5`. The direction reader separately
requires a raw champion delta of at least `0.5`. Three generated worlds fail
health, proving that the new reader is not a constant pass; all twenty-eight
preserve direction. Product champion points are inside the historical band in
twenty-seven worlds and in aggregate.

All lower-division champion bands and First-, Second- and Third-Division last
points, spread, PPG deviation, goals per match and draw share pass the same
seventeen no-new-distance readers used by L6.1D. No division pays for the
First-Division hierarchy repair.

## Upsets Remain Possible

The product's canonical kickoff-strength buckets record the following First-
Division outcomes across all 280 league-seasons:

| Strength gap | Matches | Favorite win | Draw | Underdog win |
| --- | ---: | ---: | ---: | ---: |
| `< 0.25` | `9,653` | `35.84%` | `29.75%` | `34.40%` |
| `0.25..<0.5` | `9,013` | `39.78%` | `29.06%` | `31.17%` |
| `0.5..<1` | `16,630` | `43.31%` | `29.64%` | `27.05%` |
| `1+` | `50,384` | `60.62%` | `23.90%` | `15.48%` |

The favorite is therefore meaningfully stronger without becoming
deterministic. This answers whether surprises can occur, but not whether
first-versus-last surprises have the correct rarity: `1+` combines moderate
and extreme gaps, and the current fact does not retain pre-match rank gaps.
The next integrated checkpoint must preregister finer strength buckets and
rank-gap outcome diagnostics before claiming historical calibration.

## Reproduction

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-strength-contest-l6-1d2-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-strength-contest-l6-1d2-canary-7x1.json

pnpm cli simulation-report \
  --profile=phase81a-strength-contest-l6-1d2-28x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-strength-contest-l6-1d2-28x10.json
```

Generated JSON and fact caches remain ignored local artifacts. This audit is
the durable acceptance record.
