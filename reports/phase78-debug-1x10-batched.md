# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-debug`
Worlds: 1
Seasons per world: 10
Total seasons: 10
Execution: sequential; workers=1; partition_hashes=005f0a31a4da6588
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 2.940
- Goals per match p95: 2.940
- Table spread average: 41.80
- Table spread minimum world average: 41.80
- Draw rate average: 0.250
- Draw rate maximum world average: 0.250
- Champion streak max observed: 2
- Top assist max p95: 13
- Production warning max: assists=13 top1=0.23 top3=0.46
- Age 30+ share p95: 0.22
- Minimum squad size observed: 20
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 50
- Role coverage warnings p95: 50
- Youth roster max observed: 11
- Active player count min/max: senior=395..423 youth=198..198 total=593..621
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1120750000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.3511
- Sampled player value min/max (minor): 32352788..317662313
- Contract lifecycle: renewals=1800; releases=54; expiries=239; selected expiry decisions=173
- Warning check counts: free_agent_population_share=1, senior_active_player_population=1, total_active_player_population=1, wage_budget_utilization=1
- Signal check counts: monitor=3, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-debug-world-00001` | WARN | 20 | 11 | senior 395..423; youth 198..198; total 593..621 | 0 | 0 | 0 | structural 0; cash 1120750000; wage 1.0000; free agents 0.3511; values 32352788..317662313; renew/release/expiry 1800/54/239 | 13 | avg 41.80; min 28; max 53; low season 5; champion pts 59..78; last pts 20..31; ability spread 2.35->2.69; draw rate avg/max 0.250/0.280 | season 1; A.S. Cesena; Luca Grassi; assists 13; team goals 56; top1 0.23; top3 0.46; top assist Luca Grassi; top scorer Giorgio Conte:17 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-debug-world-00001` | 13 | season 1; A.S. Cesena; Luca Grassi; assists 13; team goals 56; top1 0.23; top3 0.46; top assist Luca Grassi; top scorer Giorgio Conte:17 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-debug-world-00001` | 2 | Trento Calcio | 65..77 | 49.00 | 5 | transfer=25; squad=379 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-debug-world-00001` | 41.80 | 28..53 | 59..78 | 20..31 | avg 0.250 max 0.280 | 2.35->2.69 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-debug --worlds=1 --seasons=10 --report-output=reports/phase78-debug-1x10-batched.md
```
