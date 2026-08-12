# Phase 81A - StatsBomb Dead-Ball Supply Baseline

## Verdict

**GO.** Penalties and direct free kicks are separately observable, powered,
reconciled and reproducible. Both materially contribute to the accepted
`10.67%` dead-ball goal share, so the game-side checkpoint must measure penalty
frequency and conversion while treating the absent direct-free-kick path as a
separate structural owner.

## Source And Corpus

This analysis uses [StatsBomb Open Data](https://github.com/statsbomb/open-data)
at frozen commit
[`b0bc9f22dd77c206ddedc1d742893b3bbe64baec`](https://github.com/statsbomb/open-data/tree/b0bc9f22dd77c206ddedc1d742893b3bbe64baec).
The exact accepted 2015/16 corpus contains `1,517` complete Premier League, La
Liga, Serie A and Ligue 1 matches and `5,321,459` events.

## Result

| Class | Attempts | Goals | Conversion | Attempts / match | Goals / match | Goal share |
|---|---:|---:|---:|---:|---:|---:|
| penalty | `400` | `300` | `0.7500` | `0.263678` | `0.197759` | `0.077539` |
| direct free kick | `1,749` | `113` | `0.064608` | `1.152933` | `0.074489` | `0.029207` |
| ordinary | `35,739` | `3,456` | `0.096701` | `23.558998` | `2.278181` | `0.893254` |
| **combined dead ball** | | **`413`** | | | **`0.272248`** | **`0.106746`** |

The structured shot-type detail is `400` Penalty, `1,749` Free Kick, `35,732`
Open Play and `7` Corner attempts. The two latter types form the already frozen
ordinary complement (`35,739`); no shot was guessed into a dead-ball class.

Both dead-ball classes clear the preregistered `100`-attempt floor and have
positive goals. Penalty conversion is exactly `75%`; direct-free-kick goals are
`2.92%` of all goals, too large to hide by inflating penalties.

## Reproducibility

- exactly seven workers;
- two complete byte-identical extractions;
- accepted file SHA-256, both runs:
  `50dd45cb5466d70a0e704df27c529b35b89a7cff6e0797cc0cd9a84172ec07aa`;
- aggregate per-match hash:
  `7df9734698f2a5116e25f9f72cc9d05cf41ecdcaca7e8ac79a327b5f29822456`;
- total shots `37,888`, goals `3,869`, combined dead-ball goals `413`: all
  reconcile to the previously accepted baseline;
- temporary extractor, event cache and generated files were removed after the
  facts were recorded here.

## Handoff

The game-side checkpoint compares penalty attempts per match, conversion and
goals per match separately. Its direct-free-kick owner is structural: the
current durable event vocabulary and match engine have no such resolution
path. No combined dead-ball coefficient is permitted.
