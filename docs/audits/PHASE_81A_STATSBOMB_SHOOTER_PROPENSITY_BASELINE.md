# Phase 81A - StatsBomb Shooter-Propensity Baseline

## Verdict

**GO.** The frozen `1,517`-match corpus parsed and reconciled twice with seven
workers. Both runs produced byte-identical JSON. All eleven supported outfield
canonical roles have positive minutes and non-set-piece shots, so Step 06B22B
may version the observed rates as content. This audit changes no gameplay.

## Source And Corpus

This analysis uses [StatsBomb Open Data](https://github.com/statsbomb/open-data),
made available by StatsBomb. Match, lineup and event JSON are frozen at commit
[`b0bc9f22dd77c206ddedc1d742893b3bbe64baec`](https://github.com/statsbomb/open-data/tree/b0bc9f22dd77c206ddedc1d742893b3bbe64baec).

| Competition | Competition / season IDs | Season | Matches |
|---|---:|---:|---:|
| Premier League | `2 / 27` | 2015/16 | 380 |
| La Liga | `11 / 27` | 2015/16 | 380 |
| Serie A | `12 / 27` | 2015/16 | 380 |
| Ligue 1 | `7 / 27` | 2015/16 | 377 |
| **Total** | | | **1,517** |

Bundesliga was excluded before extraction because the frozen open-data season
contains only `34` matches. No competition, season or match was selected from
its observed role rates.

## Derivation

The measure is non-penalty, non-direct-free-kick shots per exact 90 minutes in
the player's fielded StatsBomb position. Starting XIs, tactical shifts,
substitutions and dismissals own the position timeline. Event timestamps are
accumulated as integer microseconds and only then converted to minutes/rates.
All used StatsBomb positions map through the total preregistered mapping in Step
06B22A. The future content value is:

```text
shooterPropensityBasisPoints = round(shotsPer90 * 10_000)
```

The three lifecycle interpretations discovered before an accepted output are
recorded with their exact chronology in Step 06B22A. The final corpus contains
`511` stale tactical rows for already dismissed players, `4` explicit bench
red cards and `1` post-substitution bench red. None adds field minutes.

## Canonical Baseline

| Canonical role | Minutes | Eligible shots | Shots / 90 | Basis points |
|---|---:|---:|---:|---:|
| goalkeeper | 288,711.037850 | 3 | 0.000935 | 9 |
| right_full_back | 257,716.261600 | 1,252 | 0.437225 | 4,372 |
| center_back | 607,814.449367 | 2,709 | 0.401126 | 4,011 |
| left_full_back | 257,747.984283 | 1,265 | 0.441711 | 4,417 |
| defensive_midfielder | 413,998.427950 | 3,544 | 0.770438 | 7,704 |
| central_midfielder | 281,129.139917 | 3,773 | 1.207879 | 12,079 |
| right_midfielder | 116,626.415833 | 1,728 | 1.333489 | 13,335 |
| left_midfielder | 116,505.852017 | 1,811 | 1.398986 | 13,990 |
| attacking_midfielder | 140,573.403783 | 2,901 | 1.857321 | 18,573 |
| right_winger | 153,677.021450 | 3,136 | 1.836579 | 18,366 |
| left_winger | 153,657.560567 | 3,490 | 2.044156 | 20,442 |
| striker | 376,093.011617 | 10,127 | 2.423416 | 24,234 |

Goalkeeper is reported for reconciliation but remains excluded from the game
shooter draw. Step 06B22B must store its gameplay propensity as zero rather than
turn three anomalous events into goalkeeper attacking behaviour.

## External-Position Reconciliation

| ID | StatsBomb position | Minutes | Shots | Shots / 90 |
|---:|---|---:|---:|---:|
| 1 | Goalkeeper | 288,711.037850 | 3 | 0.000935 |
| 2 | Right Back | 257,716.261600 | 1,252 | 0.437225 |
| 3 | Right Center Back | 288,527.736100 | 1,330 | 0.414865 |
| 4 | Center Back | 30,712.723967 | 133 | 0.389741 |
| 5 | Left Center Back | 288,573.989300 | 1,246 | 0.388601 |
| 6 | Left Back | 257,747.984283 | 1,265 | 0.441711 |
| 7 | Right Wing Back | 30,842.384333 | 299 | 0.872501 |
| 8 | Left Wing Back | 30,816.545383 | 273 | 0.797299 |
| 9 | Right Defensive Midfield | 148,339.061817 | 1,344 | 0.815429 |
| 10 | Center Defensive Midfield | 117,798.050200 | 821 | 0.627260 |
| 11 | Left Defensive Midfield | 147,861.315933 | 1,379 | 0.839368 |
| 12 | Right Midfield | 85,784.031500 | 1,429 | 1.499230 |
| 13 | Right Center Midfield | 140,170.412483 | 1,793 | 1.151242 |
| 14 | Center Midfield | 207.630017 | 0 | 0.000000 |
| 15 | Left Center Midfield | 140,751.097417 | 1,980 | 1.266065 |
| 16 | Left Midfield | 85,689.306633 | 1,538 | 1.615371 |
| 17 | Right Wing | 153,677.021450 | 3,136 | 1.836579 |
| 18 | Right Attacking Midfield | 5,448.755317 | 126 | 2.081209 |
| 19 | Center Attacking Midfield | 129,656.988067 | 2,670 | 1.853352 |
| 20 | Left Attacking Midfield | 5,467.660400 | 105 | 1.728344 |
| 21 | Left Wing | 153,657.560567 | 3,490 | 2.044156 |
| 22 | Right Center Forward | 88,425.280133 | 2,185 | 2.223912 |
| 23 | Center Forward | 199,318.704933 | 5,602 | 2.529517 |
| 24 | Left Center Forward | 88,349.026550 | 2,340 | 2.383727 |

Position `25`, Secondary Striker, is part of the total mapping but is unused in
this corpus. Its absence does not create a zero canonical striker rate because
the three observed forward positions contribute `376,093` minutes and `10,127`
eligible shots.

## Integrity Record

- event rows: `5,321,459`;
- eligible shots: `35,739`;
- excluded penalties: `400`;
- excluded direct free kicks: `1,749`;
- field dismissals: `408`;
- substitutions: `8,722`;
- tactical shifts: `3,887`;
- external shots = canonical shots = eligible shots: `35,739`;
- external microseconds = canonical microseconds: `189,855,033,974,000`;
- supported outfield canonical roles with positive minutes and shots: `11/11`;
- accepted JSON SHA-256, both runs:
  `429b0f0d01f46a97e0b49e8d25ce5b2b24a4f23a421a70abf88ef75cb5d48991`;
- content aggregate hash, both runs:
  `7fac6859305188c9065f5aa210c2eb0ee7543d936d6e3a61ea7c0379b93bdd7e`.

## Handoff

Step 06B22B may add this one empirical role propensity mapping to the existing
versioned match-tactics calibration. Shooter selection will combine it with the
existing route-specific shooter task quality. Creator selection remains
unchanged. No output-derived divisor, clamp, exponent or second actor model is
authorized.
