# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-world-00864`
Worlds: 1
Seasons per world: 9
Total seasons: 9
Execution: sequential; workers=1; partition_hashes=e75b1e9599c1750d
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 2.940
- Goals per match p95: 2.940
- Table spread average: 41.00
- Table spread minimum world average: 41.00
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 2
- Top assist max p95: 12
- Production warning max: assists=12 top1=0.23 top3=0.43
- Age 30+ share p95: 0.24
- Minimum squad size observed: 20
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 51
- Role coverage warnings p95: 51
- Youth roster max observed: 11
- Active player count min/max: senior=396..430 youth=198..198 total=594..628
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1142680000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.3414
- Sampled player value min/max (minor): 80261060..299031908
- Contract lifecycle: renewals=1513; releases=22; expiries=221; selected expiry decisions=151
- Warning check counts: free_agent_population_share=1, wage_budget_utilization=1
- Signal check counts: monitor=1, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-world-00864-world-00001` | WARN | 20 | 11 | senior 396..430; youth 198..198; total 594..628 | 0 | 0 | 0 | structural 0; cash 1142680000; wage 1.0000; free agents 0.3414; values 80261060..299031908; renew/release/expiry 1513/22/221 | 12 | avg 41.00; min 29; max 63; low season 8; champion pts 61..77; last pts 14..33; ability spread 2.66->2.71; draw rate avg/max 0.240/0.280 | season 4; A.S. Como; Rafael Barbosa; assists 10; team goals 43; top1 0.23; top3 0.43; top assist Rafael Barbosa; top scorer Luca Caputo:13 | wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-world-00864-world-00001` | 12 | season 4; A.S. Como; Rafael Barbosa; assists 10; team goals 43; top1 0.23; top3 0.43; top assist Rafael Barbosa; top scorer Luca Caputo:13 | wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00864-world-00001` | 2 | Real Catania | 61..77 | 46.00 | 6 | transfer=20; squad=286 | wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00864-world-00001` | 41.00 | 29..63 | 61..77 | 14..33 | avg 0.240 max 0.280 | 2.66->2.71 | wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-world-00864 --worlds=1 --seasons=9 --report-output=reports/phase78-contract-finance-world-00864-9-goalkeeper-fix.md
```
