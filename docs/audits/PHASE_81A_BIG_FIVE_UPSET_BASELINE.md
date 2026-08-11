# Phase 81A - Big Five Upset Baseline

## Thesis

A credible football world needs hierarchy without inevitability. A stronger or
higher-ranked team should win more often, but a mid-table side must sometimes
beat a contender and the bottom side must retain a rare path to a draw or win
against the leader. This baseline freezes that relationship before the L6.2
game population is generated. It never grants an underdog bonus and it does not
use the simulated output to choose its bands.

## Population

- Source: [Football-Data historical results](https://www.football-data.co.uk/data.php).
- Competitions: Premier League (`E0`), La Liga (`SP1`), Serie A (`I1`),
  Bundesliga (`D1`) and Ligue 1 (`F1`).
- Seasons: `2005/06` through `2024/25`, inclusive.
- Population: `100` league-seasons.
- Match results: full-time home and away goals from the source CSV files.
- Exclusion: a fixture is not classified until both clubs have completed at
  least five prior league matches.

The table used for classification is snapshotted before all fixtures sharing a
calendar date. It uses points, goal difference, goals scored and stable team
name as its deterministic final tie-breaker. Results played on that date enter
only the next snapshot. This is the same no-current-result-leakage rule L6.2
must implement at the canonical season boundary.

This population cannot see tactical intent, lineup quality, injuries or the
strength scale used by the game. Rank-gap bands are therefore historical
targets; kickoff-strength bands are game-only diagnostics.

## Frozen Derivation

For each eligible fixture, the lower-ranked club is the underdog. Rank distance
is partitioned into exactly five exhaustive bands: `1..3`, `4..6`, `7..9`,
`10..14`, and `15+`. Each league-season contributes its underdog win, draw and
non-loss shares. The frozen bands are the linear-interpolated `p10..p90` of
those `100` league-season shares. Pooled values are presentation and
cross-checks, never a second target.

| Rank gap | Matches | Underdog win pooled | Win p10..p90 | Draw pooled | Non-loss pooled | Non-loss p10..p90 |
|---|---:|---:|---:|---:|---:|---:|
| `1..3` | 9,414 | 0.319949 | 0.262816..0.377940 | 0.279584 | 0.599533 | 0.544878..0.669958 |
| `4..6` | 7,737 | 0.282797 | 0.215495..0.352678 | 0.268450 | 0.551247 | 0.474414..0.630905 |
| `7..9` | 5,959 | 0.246182 | 0.173763..0.333333 | 0.247189 | 0.493371 | 0.409530..0.590523 |
| `10..14` | 6,222 | 0.205239 | 0.132353..0.274934 | 0.231115 | 0.436355 | 0.348419..0.529048 |
| `15+` | 2,015 | 0.127047 | 0.038187..0.242241 | 0.179653 | 0.306700 | 0.158286..0.454545 |

The exact leader-versus-last-place slice is sparse: `141` eligible fixtures in
`90` of the `100` league-seasons. It is therefore a pooled secondary gate, not
a per-season percentile gate:

- underdog wins: `13/141 = 0.092199`, Wilson 95% interval
  `0.054674..0.151355`;
- underdog non-losses: `30/141 = 0.212766`, Wilson 95% interval
  `0.153299..0.287469`;
- L6.2 requires at least `50` exact leader-versus-last observations across its
  `70` First-Division league-seasons. Below that, the slice is
  `not_evaluated`, never a pass.

The observation floor is fixed before the game run. It is below the historical
rate of `1.41` eligible fixtures per league-season while still preventing a
handful of matches from deciding the claim.

## Interpretation Contract

- `GO` means the game retains a historically credible upset gradient while the
  complete hardened register also passes.
- `REFINE` means at least one valid gate is outside its frozen band. It names a
  problem; it does not authorize tuning inside this checkpoint.
- `STOP / RETHINK` means ranks leaked the current result, same-round fixtures
  used different table snapshots, canonical facts failed reconciliation, or an
  allegedly locked population changed.
- The exact first-versus-last slice answers rarity. The `7..9` band answers the
  common football story where roughly tenth beats roughly third. Neither may be
  replaced by the broad game-strength bucket `1+`.
