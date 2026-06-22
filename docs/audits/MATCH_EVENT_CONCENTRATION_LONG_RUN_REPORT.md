# Match Event Concentration Long-Run Smoke Report

Date: 2026-06-22
Seed prefix: `phase34-concentration`
Worlds: 50
Seasons per world: 10
Total seasons: 500
Status: FAIL

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 48
- Goals per match average: 2.790
- Goals per match p95: 2.850
- Top assist max p95: 14
- Age 30+ share p95: 0.15
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 4909
- Role coverage warnings p95: 113
- Youth roster max observed: 11
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: active_player_population=50, table_points_spread_avg=36, champion_streak=2, top_creator_goal_share_max=1
- Failing check counts: table_points_spread_avg=2

## Worst Worlds

| Seed | Status | Min squad | Youth max | Below min | Youth above target | No GK | Top assist max | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| `phase34-concentration-world-00003` | FAIL | 21 | 11 | 0 | 0 | 0 | 12 | season 9; F.C. Cosenza; Davide Capra; assists 12; team goals 48; top1 0.25; top3 0.46; top assist Davide Capra; top scorer Enrico Di Biase:15 | active_player_population | table_points_spread_avg |
| `phase34-concentration-world-00040` | FAIL | 20 | 11 | 0 | 0 | 0 | 11 | season 9; S.S. Cesena; Matteo Landi; assists 11; team goals 44; top1 0.25; top3 0.45; top assist Matteo Landi; top scorer Luca Bianco:15 | active_player_population | table_points_spread_avg |
| `phase34-concentration-world-00001` | WARN | 20 | 11 | 0 | 0 | 0 | 13 | season 2; A.S.D. Trieste; Matteo Battaglia; assists 13; team goals 55; top1 0.24; top3 0.46; top assist Matteo Battaglia; top scorer Davide Giordano:15 | table_points_spread_avg, active_player_population | none |
| `phase34-concentration-world-00002` | WARN | 20 | 11 | 0 | 0 | 0 | 11 | season 3; Virtus Catania; Davide Spinelli; assists 9; team goals 38; top1 0.24; top3 0.39; top assist Giorgio Antonelli; top scorer Facundo Vargas:16 | active_player_population | none |
| `phase34-concentration-world-00004` | WARN | 19 | 11 | 0 | 0 | 0 | 12 | season 6; F.C. Carpi; Nico Sartori; assists 8; team goals 34; top1 0.24; top3 0.42; top assist Nico Molinari; top scorer Matteo Bartoli:17 | table_points_spread_avg, active_player_population | none |
| `phase34-concentration-world-00005` | WARN | 20 | 11 | 0 | 0 | 0 | 13 | season 6; Pro Siena; Nico Caruso; assists 9; team goals 34; top1 0.26; top3 0.43; top assist Luca Ricciardi; top scorer Logan Hayes:13 | table_points_spread_avg, active_player_population | none |
| `phase34-concentration-world-00006` | WARN | 21 | 11 | 0 | 0 | 0 | 14 | season 10; Como Calcio; Enrico Piras; assists 14; team goals 55; top1 0.25; top3 0.48; top assist Enrico Piras; top scorer Matteo De Rosa:14 | table_points_spread_avg, active_player_population | none |
| `phase34-concentration-world-00007` | WARN | 20 | 11 | 0 | 0 | 0 | 13 | season 8; Virtus Ascoli; Matteo Pavan; assists 9; team goals 34; top1 0.26; top3 0.42; top assist Davide Fabiani; top scorer Luca Biondi:15 | table_points_spread_avg, active_player_population | none |
| `phase34-concentration-world-00008` | WARN | 21 | 11 | 0 | 0 | 0 | 13 | season 6; Ascoli Calcio; Davide De Angelis; assists 13; team goals 53; top1 0.25; top3 0.45; top assist Davide De Angelis; top scorer Nico Benedetti:17 | table_points_spread_avg, active_player_population | none |
| `phase34-concentration-world-00009` | WARN | 20 | 11 | 0 | 0 | 0 | 12 | season 4; Padova Calcio; Enrico Tarantino; assists 6; team goals 26; top1 0.23; top3 0.41; top assist Facundo Mendoza; top scorer Marko Novak:15 | table_points_spread_avg, active_player_population | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=50 --seasons=10 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md
```

## Phase 34 Interpretation

The Phase 34 creator-concentration target is no longer the failing condition in
this smoke gate. The 50 worlds x 10 seasons run has no failing
`top_creator_goal_share_max`, `top_three_creator_goal_share_max`, or
`top_assist_max` checks. The two failed worlds are blocked only by
`table_points_spread_avg`:

- `phase34-concentration-world-00003`: `table_points_spread_avg=29.1`.
- `phase34-concentration-world-00040`: `table_points_spread_avg=29.7`.

Per Step 04, the final 250 worlds x 30 seasons gate was not attempted because
the smoke gate did not pass. The next work should decide whether the table
spread anomaly belongs in this phase as a narrow balance rework or should be
tracked as a separate post-concentration gate.
