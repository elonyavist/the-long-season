# Phase 81A - Lower-Division Statistical Baseline

## Status

Frozen on 2026-08-09 before any post-L5 gameplay correction. It complements,
but never changes, the Big Five first-division denominator.

## Population

All points are normalized to `34` matches. Bands are historical `p10..p90`.

- **Second Division:** Championship, 2. Bundesliga, Serie B, Segunda Division
  and Ligue 2, `2005/06..2024/25`; `100` league-seasons and `42,453` matches
  from the [Football-Data archive](https://www.football-data.co.uk/data.php).
- **Third Division:** England League One, `2005/06..2024/25`, from Football-
  Data, plus German 3. Liga, `2014/15..2024/25`, from the public-domain
  [openfootball Germany archive](https://github.com/openfootball/deutschland)
  and its [footballcsv mirror](https://github.com/footballcsv/deutschland);
  `31` league-seasons and `14,723` matches.
- Serie C and Primera Federacion are excluded because grouped regional
  competitions are not comparable with the game's single national division.
  French National is excluded because no same-format source was in the
  preregistered corpus. No league was added or removed after reading its result.

## Frozen Table Targets

| Metric, normalized to 34 | Second mean | Second p10..p90 | Third mean | Third p10..p90 |
|---|---:|---:|---:|---:|
| champion points | `67.2700` | `60.8293..73.6913` | `70.5719` | `62.0870..76.0526` |
| last-club points | `26.0723` | `19.8826..32.5217` | `25.9419` | `19.9565..30.3043` |
| champion-last spread | `41.1977` | `31.7615..50.3348` | `44.6301` | `37.6957..54.6957` |
| between-club PPG deviation | `0.3092` | `0.2350..0.3652` | `0.3332` | `0.2768..0.4083` |
| goals per match | `2.4957` | `2.2571..2.7578` | `2.6486` | `2.4746..2.8495` |
| draw share | `0.2928` | `0.2383..0.3293` | `0.2638` | `0.2391..0.2868` |

These are independent targets. In particular, the first-division champion band
`72..88` is not applied to lower tiers. One season may remain outside a band;
the integrated checkpoint evaluates cohort distributions.

## Limitations

The third-division denominator covers two national structures rather than all
Big Five countries and is therefore narrower. It is still preferable to
inventing a tier multiplier or mixing regional groups into one table. Future
source expansion requires a new preregistered corpus and cannot silently move
these frozen bands.
