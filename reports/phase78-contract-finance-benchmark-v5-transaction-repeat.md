# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-benchmark-v3`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=8a6eda07a6a45fd9
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 2.980
- Goals per match p95: 2.980
- Table spread average: 44.62
- Table spread minimum world average: 44.62
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 6
- Top assist max p95: 16
- Production warning max: assists=16 top1=0.29 top3=0.44
- Age 30+ share p95: 0.29
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 54
- Role coverage warnings p95: 54
- Youth roster max observed: 11
- Active player count min/max: senior=396..422 youth=198..198 total=594..620
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1107120000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4222
- Sampled player value min/max (minor): 20025699..339139295
- Contract lifecycle: renewals=9572; releases=924; expiries=1350; selected expiry decisions=818
- Warning check counts: free_agent_population_share=1, top_assist_max=1, wage_budget_utilization=1
- Signal check counts: monitor=1, story=1, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-benchmark-v3-world-00001` | WARN | 19 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | structural 0; cash 1107120000; wage 1.0000; free agents 0.4222; values 20025699..339139295; renew/release/expiry 9572/924/1350 | 16 | avg 44.62; min 27; max 60; low season 4; champion pts 57..86; last pts 20..36; ability spread 2.41->3.06; draw rate avg/max 0.240/0.300 | season 21; Brescia Calcio; Callum Fletcher; assists 13; team goals 45; top1 0.29; top3 0.44; top assist Callum Fletcher; top scorer Enrico Esposito:17 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-benchmark-v3-world-00001` | 16 | season 21; Brescia Calcio; Callum Fletcher; assists 13; team goals 45; top1 0.29; top3 0.44; top assist Callum Fletcher; top scorer Enrico Esposito:17 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-v3-world-00001` | 6 | S.S. Ravenna | 75..82 | 49.83 | 10 | transfer=184; squad=4376 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-v3-world-00001` | 44.62 | 27..60 | 57..86 | 20..36 | avg 0.240 max 0.300 | 2.41->3.06 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-benchmark-v3 --worlds=1 --seasons=50 --report-output=reports/phase78-contract-finance-benchmark-v5-transaction-repeat.md
```
