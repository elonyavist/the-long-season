# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-benchmark-profile-v5`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=4d9747eab124a8cb
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 2.960
- Goals per match p95: 2.960
- Table spread average: 43.30
- Table spread minimum world average: 43.30
- Draw rate average: 0.230
- Draw rate maximum world average: 0.230
- Champion streak max observed: 4
- Top assist max p95: 14
- Production warning max: assists=14 top1=0.28 top3=0.53
- Age 30+ share p95: 0.28
- Minimum squad size observed: 21
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 50
- Role coverage warnings p95: 50
- Youth roster max observed: 11
- Active player count min/max: senior=396..424 youth=198..198 total=594..622
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1099770000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4212
- Sampled player value min/max (minor): 25566121..339973893
- Contract lifecycle: renewals=9531; releases=909; expiries=1375; selected expiry decisions=828
- Warning check counts: free_agent_population_share=1, wage_budget_utilization=1
- Signal check counts: monitor=1, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-benchmark-profile-v5-world-00001` | WARN | 21 | 11 | senior 396..424; youth 198..198; total 594..622 | 0 | 0 | 0 | structural 0; cash 1099770000; wage 1.0000; free agents 0.4212; values 25566121..339973893; renew/release/expiry 9531/909/1375 | 14 | avg 43.30; min 29; max 58; low season 1; champion pts 61..81; last pts 14..36; ability spread 2.72->2.74; draw rate avg/max 0.230/0.300 | season 47; Virtus Ravenna; Enrico Palumbo; assists 11; team goals 40; top1 0.28; top3 0.53; top assist Enrico Palumbo; top scorer Luca Bianco:16 | wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-benchmark-profile-v5-world-00001` | 14 | season 47; Virtus Ravenna; Enrico Palumbo; assists 11; team goals 40; top1 0.28; top3 0.53; top assist Enrico Palumbo; top scorer Luca Bianco:16 | wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-profile-v5-world-00001` | 4 | S.S. Como | 71..78 | 44.50 | 8 | transfer=185; squad=4425 | wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-profile-v5-world-00001` | 43.30 | 29..58 | 61..81 | 14..36 | avg 0.230 max 0.300 | 2.72->2.74 | wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-benchmark-profile-v5 --worlds=1 --seasons=50 --report-output=reports/phase78-contract-finance-benchmark-profile-v5.md
```
