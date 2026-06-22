# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase32-youth`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Status: FAIL

## Aggregate Metrics

- Failed worlds: 8
- Warning worlds: 242
- Goals per match average: 2.700
- Goals per match p95: 2.750
- Top assist max p95: 17
- Age 30+ share p95: 0.23
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 96356
- Role coverage warnings p95: 430
- Youth roster max observed: 12
- Clubs above youth target: 0
- Clubs below youth minimum: 2523
- Warning check counts: clubs_below_youth_minimum=250, youth_roster_min_size=250, top_creator_goal_share_max=150, top_assist_max=83, top_three_creator_goal_share_max=32, table_points_spread_avg=17, champion_streak=2
- Failing check counts: top_creator_goal_share_max=8

## Worst Worlds

| Seed | Status | Min squad | Youth max | Below min | Youth above target | No GK | Top assist max | Warn checks | Fail checks |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| `phase32-youth-world-00027` | FAIL | 20 | 12 | 0 | 0 | 0 | 17 | top_assist_max, youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00031` | FAIL | 19 | 12 | 0 | 0 | 0 | 17 | top_assist_max, top_three_creator_goal_share_max, youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00125` | FAIL | 20 | 12 | 0 | 0 | 0 | 19 | top_assist_max, youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00136` | FAIL | 19 | 12 | 0 | 0 | 0 | 17 | top_assist_max, youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00166` | FAIL | 20 | 12 | 0 | 0 | 0 | 14 | youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00174` | FAIL | 20 | 12 | 0 | 0 | 0 | 15 | youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00196` | FAIL | 20 | 12 | 0 | 0 | 0 | 15 | youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00216` | FAIL | 20 | 12 | 0 | 0 | 0 | 22 | top_assist_max, youth_roster_min_size, clubs_below_youth_minimum | top_creator_goal_share_max |
| `phase32-youth-world-00001` | WARN | 20 | 12 | 0 | 0 | 0 | 17 | top_assist_max, youth_roster_min_size, clubs_below_youth_minimum | none |
| `phase32-youth-world-00002` | WARN | 19 | 12 | 0 | 0 | 0 | 14 | top_creator_goal_share_max, youth_roster_min_size, clubs_below_youth_minimum | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md
```
