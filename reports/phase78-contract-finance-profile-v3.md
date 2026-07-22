# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-profile-v3`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=ecbf59c2dda3d059
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 2.980
- Goals per match p95: 2.980
- Table spread average: 44.98
- Table spread minimum world average: 44.98
- Draw rate average: 0.230
- Draw rate maximum world average: 0.230
- Champion streak max observed: 5
- Top assist max p95: 15
- Production warning max: assists=15 top1=0.23 top3=0.40
- Age 30+ share p95: 0.29
- Minimum squad size observed: 21
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 45
- Role coverage warnings p95: 45
- Youth roster max observed: 11
- Active player count min/max: senior=396..427 youth=198..198 total=594..625
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1134090000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4097
- Sampled player value min/max (minor): 27518195..377731631
- Contract lifecycle: renewals=9478; releases=897; expiries=1398; selected expiry decisions=812
- Warning check counts: free_agent_population_share=1, wage_budget_utilization=1
- Signal check counts: monitor=1, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-profile-v3-world-00001` | WARN | 21 | 11 | senior 396..427; youth 198..198; total 594..625 | 0 | 0 | 0 | structural 0; cash 1134090000; wage 1.0000; free agents 0.4097; values 27518195..377731631; renew/release/expiry 9478/897/1398 | 15 | avg 44.98; min 30; max 62; low season 3; champion pts 62..86; last pts 13..35; ability spread 2.19->2.94; draw rate avg/max 0.230/0.290 | season 3; A.S.D. Trieste; Amadou Sarr; assists 11; team goals 47; top1 0.23; top3 0.40; top assist Amadou Sarr; top scorer Giorgio Cantini:15 | wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-profile-v3-world-00001` | 15 | season 3; A.S.D. Trieste; Amadou Sarr; assists 11; team goals 47; top1 0.23; top3 0.40; top assist Amadou Sarr; top scorer Giorgio Cantini:15 | wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-profile-v3-world-00001` | 5 | U.S. Pescara | 72..85 | 48.60 | 8 | transfer=184; squad=4443 | wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-profile-v3-world-00001` | 44.98 | 30..62 | 62..86 | 13..35 | avg 0.230 max 0.290 | 2.19->2.94 | wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-profile-v3 --worlds=1 --seasons=50 --report-output=reports/phase78-contract-finance-profile-v3.md
```
