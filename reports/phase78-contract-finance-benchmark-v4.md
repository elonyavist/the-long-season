# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-benchmark-v4`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=612d8b5599c74c8e
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 2.940
- Goals per match p95: 2.940
- Table spread average: 44.30
- Table spread minimum world average: 44.30
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 4
- Top assist max p95: 17
- Production warning max: assists=17 top1=0.29 top3=0.42
- Age 30+ share p95: 0.29
- Minimum squad size observed: 20
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 49
- Role coverage warnings p95: 49
- Youth roster max observed: 11
- Active player count min/max: senior=396..428 youth=198..198 total=594..626
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1086130000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4154
- Sampled player value min/max (minor): 27562513..325157898
- Contract lifecycle: renewals=9525; releases=873; expiries=1325; selected expiry decisions=822
- Warning check counts: free_agent_population_share=1, top_assist_max=1, wage_budget_utilization=1
- Signal check counts: monitor=1, story=1, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-benchmark-v4-world-00001` | WARN | 20 | 11 | senior 396..428; youth 198..198; total 594..626 | 0 | 0 | 0 | structural 0; cash 1086130000; wage 1.0000; free agents 0.4154; values 27562513..325157898; renew/release/expiry 9525/873/1325 | 17 | avg 44.30; min 31; max 57; low season 16; champion pts 62..83; last pts 22..36; ability spread 2.58->3.15; draw rate avg/max 0.240/0.290 | season 9; U.S. Vicenza; Haruto Tanaka; assists 13; team goals 45; top1 0.29; top3 0.42; top assist Haruto Tanaka; top scorer Giorgio Monti:13 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-benchmark-v4-world-00001` | 17 | season 9; U.S. Vicenza; Haruto Tanaka; assists 13; team goals 45; top1 0.29; top3 0.42; top assist Haruto Tanaka; top scorer Giorgio Monti:13 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-v4-world-00001` | 4 | A.S. Lecco | 63..78 | 42.00 | 9 | transfer=181; squad=4338 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-benchmark-v4-world-00001` | 44.30 | 31..57 | 62..83 | 22..36 | avg 0.240 max 0.290 | 2.58->3.15 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-benchmark-v4 --worlds=1 --seasons=50 --report-output=reports/phase78-contract-finance-benchmark-v4.md
```
