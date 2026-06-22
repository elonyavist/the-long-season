# Player Role And Ability Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase33-generation`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Status: FAIL

## Aggregate Metrics

- Failed worlds: 1
- Warning worlds: 249
- Goals per match average: 2.760
- Goals per match p95: 2.810
- Top assist max p95: 17
- Age 30+ share p95: 0.23
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 54445
- Role coverage warnings p95: 249
- Youth roster max observed: 11
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: active_player_population=250, table_points_spread_avg=209, top_creator_goal_share_max=111, top_assist_max=80, top_three_creator_goal_share_max=21
- Failing check counts: top_creator_goal_share_max=1

## Worst Worlds

| Seed | Status | Min squad | Youth max | Below min | Youth above target | No GK | Top assist max | Warn checks | Fail checks |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| `phase33-generation-world-00173` | FAIL | 20 | 11 | 0 | 0 | 0 | 16 | table_points_spread_avg, top_assist_max, active_player_population | top_creator_goal_share_max |
| `phase33-generation-world-00001` | WARN | 20 | 11 | 0 | 0 | 0 | 17 | top_assist_max, active_player_population | none |
| `phase33-generation-world-00002` | WARN | 20 | 11 | 0 | 0 | 0 | 15 | table_points_spread_avg, active_player_population | none |
| `phase33-generation-world-00003` | WARN | 20 | 11 | 0 | 0 | 0 | 15 | table_points_spread_avg, active_player_population | none |
| `phase33-generation-world-00004` | WARN | 20 | 11 | 0 | 0 | 0 | 14 | top_creator_goal_share_max, active_player_population | none |
| `phase33-generation-world-00005` | WARN | 20 | 11 | 0 | 0 | 0 | 14 | table_points_spread_avg, active_player_population | none |
| `phase33-generation-world-00006` | WARN | 20 | 11 | 0 | 0 | 0 | 15 | table_points_spread_avg, active_player_population | none |
| `phase33-generation-world-00007` | WARN | 20 | 11 | 0 | 0 | 0 | 15 | table_points_spread_avg, top_creator_goal_share_max, active_player_population | none |
| `phase33-generation-world-00008` | WARN | 20 | 11 | 0 | 0 | 0 | 15 | table_points_spread_avg, top_creator_goal_share_max, top_three_creator_goal_share_max, active_player_population | none |
| `phase33-generation-world-00009` | WARN | 19 | 11 | 0 | 0 | 0 | 16 | table_points_spread_avg, top_assist_max, active_player_population | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md
```
