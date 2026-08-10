# Phase 81A - Checkpoint L5.2D Final Standings

## Decision

**GO** on 2026-08-10. The canonical profile
`phase81a-standings-hierarchy-l5-2d-7x10` completed with exit `0`.

## Population

- `7` deterministic worlds x `10` complete seasons x `3` divisions;
- `210` competition-seasons, `70` at each level;
- seed prefix `phase81a-standings-hierarchy-l5-2d-v1`;
- exactly `7` workers;
- canonical career simulation and recorded tables;
- frozen historical bands from the Big Five and lower-division baselines.

## Result

| Division | Champion | Last | Spread | PPG SD | Goals/match | Draw share |
|---|---:|---:|---:|---:|---:|---:|
| First | `72.7429` | `23.3000` | `49.4429` | `0.4023` | `2.8412` | `0.2737` |
| Second | `66.1286` | `27.4714` | `38.6571` | `0.3012` | `2.7390` | `0.2879` |
| Third | `68.3857` | `26.4429` | `41.9429` | `0.3280` | `2.7437` | `0.2839` |

Every metric is inside its own division's frozen band. Structural counts are
also green: fallback selection `0`, unavailable selected players `0`, report
reconciliation failures `0`.

## Product Meaning

The stronger hierarchy comes from generated senior ability inside existing
rarity lanes. No club rank, division, expected result or table position enters
the match engine. The five-percent conversion trial was rejected because it
increased draws; the shipped shared conversion adjustment is approximately one
percent and the wage-safe Third-Division hierarchy stops at `1.3`.

Canonical artifact:
`simulation-out/phase81a-standings-hierarchy-l5-2d-7x10.json`.
