# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-benchmark-v2`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=57a5ffdbc8eb3620
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 3.020
- Goals per match p95: 3.020
- Table spread average: 45.68
- Table spread minimum world average: 45.68
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 6
- Top assist max p95: 16
- Production warning max: assists=16 top1=0.24 top3=0.40
- Age 30+ share p95: 0.29
- Minimum squad size observed: 20
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 46
- Role coverage warnings p95: 46
- Youth roster max observed: 11
- Active player count min/max: senior=396..428 youth=198..198 total=594..626
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1160580000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4155
- Sampled player value min/max (minor): 22490965..332718316
- Contract lifecycle: renewals=9479; releases=902; expiries=1374; selected expiry decisions=815
- Warning check counts: free_agent_population_share=1, goals_per_match_avg=1, top_assist_max=1, wage_budget_utilization=1
- Signal check counts: monitor=2, story=1, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-benchmark-v2-world-00001` | WARN | 20 | 11 | senior 396..428; youth 198..198; total 594..626 | 0 | 0 | 0 | structural 0; cash 1160580000; wage 1.0000; free agents 0.4155; values 22490965..332718316; renew/release/expiry 9479/902/1374 | 16 | avg 45.68; min 30; max 60; low season 8; champion pts 62..85; last pts 19..36; ability spread 2.49->2.74; draw rate avg/max 0.240/0.300 | season 45; Lecco Calcio; Giorgio D'Angelo; assists 10; team goals 42; top1 0.24; top3 0.40; top assist Luca Ricci; top scorer Davide Bonacina:20 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-benchmark-v2-world-00001` | 16 | season 45; Lecco Calcio; Giorgio D'Angelo; assists 10; team goals 42; top1 0.24; top3 0.40; top assist Luca Ricci; top scorer Davide Bonacina:20 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-v2-world-00001` | 6 | F.C. Carpi | 66..80 | 43.17 | 8 | transfer=185; squad=4405 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-v2-world-00001` | 45.68 | 30..60 | 62..85 | 19..36 | avg 0.240 max 0.300 | 2.49->2.74 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-benchmark-v2 --worlds=1 --seasons=50 --report-output=reports/phase78-contract-finance-benchmark-v2.md
```
