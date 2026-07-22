# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-profile-v2`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=87eddeab403f86e4
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 3.030
- Goals per match p95: 3.030
- Table spread average: 44.34
- Table spread minimum world average: 44.34
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 4
- Top assist max p95: 15
- Production warning max: assists=15 top1=0.23 top3=0.41
- Age 30+ share p95: 0.29
- Minimum squad size observed: 20
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 54
- Role coverage warnings p95: 54
- Youth roster max observed: 11
- Active player count min/max: senior=396..429 youth=198..198 total=594..627
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1167710000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4161
- Sampled player value min/max (minor): 26849044..325732175
- Contract lifecycle: renewals=9576; releases=912; expiries=1340; selected expiry decisions=822
- Warning check counts: free_agent_population_share=1, goals_per_match_avg=1, wage_budget_utilization=1
- Signal check counts: monitor=2, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-profile-v2-world-00001` | WARN | 20 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 0; cash 1167710000; wage 1.0000; free agents 0.4161; values 26849044..325732175; renew/release/expiry 9576/912/1340 | 15 | avg 44.34; min 31; max 63; low season 24; champion pts 60..87; last pts 20..35; ability spread 2.60->2.68; draw rate avg/max 0.240/0.300 | season 48; U.S. Bologna; Ivan Novak; assists 11; team goals 47; top1 0.23; top3 0.41; top assist Ivan Novak; top scorer Enrico Foschi:16 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-profile-v2-world-00001` | 15 | season 48; U.S. Bologna; Ivan Novak; assists 11; team goals 47; top1 0.23; top3 0.41; top assist Ivan Novak; top scorer Enrico Foschi:16 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-profile-v2-world-00001` | 4 | Perugia Calcio | 68..77 | 46.00 | 10 | transfer=178; squad=4384 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-profile-v2-world-00001` | 44.34 | 31..63 | 60..87 | 20..35 | avg 0.240 max 0.300 | 2.60->2.68 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-profile-v2 --worlds=1 --seasons=50 --report-output=/Users/elianarducci/common-projects/the-long-season/reports/phase78-profile-v2.md
```
