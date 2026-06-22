# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase31-gate`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 169
- Goals per match average: 2.690
- Goals per match p95: 2.730
- Top assist max p95: 17
- Age 30+ share p95: 0.29
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 62226
- Role coverage warnings p95: 284
- Warning check counts: top_creator_goal_share_max=121, top_assist_max=73, table_points_spread_avg=19, top_three_creator_goal_share_max=17, champion_streak=6
- Failing check counts: none

## Worst Worlds

| Seed | Status | Min squad | Below min | No GK | Top assist max | Warn checks | Fail checks |
|---|---:|---:|---:|---:|---:|---|---|
| `phase31-gate-world-00003` | WARN | 19 | 0 | 0 | 15 | top_creator_goal_share_max | none |
| `phase31-gate-world-00005` | WARN | 20 | 0 | 0 | 16 | top_assist_max | none |
| `phase31-gate-world-00006` | WARN | 20 | 0 | 0 | 14 | table_points_spread_avg | none |
| `phase31-gate-world-00010` | WARN | 20 | 0 | 0 | 18 | table_points_spread_avg, top_assist_max | none |
| `phase31-gate-world-00012` | WARN | 20 | 0 | 0 | 18 | top_assist_max | none |
| `phase31-gate-world-00014` | WARN | 20 | 0 | 0 | 14 | top_creator_goal_share_max | none |
| `phase31-gate-world-00015` | WARN | 20 | 0 | 0 | 16 | top_assist_max, top_creator_goal_share_max | none |
| `phase31-gate-world-00017` | WARN | 20 | 0 | 0 | 15 | top_creator_goal_share_max, champion_streak | none |
| `phase31-gate-world-00018` | WARN | 20 | 0 | 0 | 17 | top_assist_max | none |
| `phase31-gate-world-00019` | WARN | 20 | 0 | 0 | 16 | top_assist_max | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase31-gate --worlds=250 --seasons=30 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md
```
