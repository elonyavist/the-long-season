# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-world-00191`
Worlds: 1
Seasons per world: 28
Total seasons: 28
Execution: sequential; workers=1; partition_hashes=31a11a7a0b53ec6b
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 3.050
- Goals per match p95: 3.050
- Table spread average: 44.14
- Table spread minimum world average: 44.14
- Draw rate average: 0.230
- Draw rate maximum world average: 0.230
- Champion streak max observed: 6
- Top assist max p95: 16
- Production warning max: assists=16 top1=0.25 top3=0.43
- Age 30+ share p95: 0.31
- Minimum squad size observed: 20
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 52
- Role coverage warnings p95: 52
- Youth roster max observed: 11
- Active player count min/max: senior=396..420 youth=198..198 total=594..618
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1141640000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4229
- Sampled player value min/max (minor): 27331214..314633884
- Contract lifecycle: renewals=5516; releases=479; expiries=769; selected expiry decisions=454
- Warning check counts: champion_streak=1, free_agent_population_share=1, goals_per_match_avg=1, top_assist_max=1, wage_budget_utilization=1
- Signal check counts: monitor=2, story=2, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-world-00191-world-00001` | WARN | 20 | 11 | senior 396..420; youth 198..198; total 594..618 | 0 | 0 | 0 | structural 0; cash 1141640000; wage 1.0000; free agents 0.4229; values 27331214..314633884; renew/release/expiry 5516/479/769 | 16 | avg 44.14; min 30; max 62; low season 2; champion pts 62..81; last pts 19..37; ability spread 2.33->2.33; draw rate avg/max 0.230/0.280 | season 16; Padova Calcio; Giorgio Lucchesi; assists 16; team goals 65; top1 0.25; top3 0.43; top assist Giorgio Lucchesi; top scorer Giorgio Amato:18 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-world-00191-world-00001` | 16 | season 16; Padova Calcio; Giorgio Lucchesi; assists 16; team goals 65; top1 0.25; top3 0.43; top assist Giorgio Lucchesi; top scorer Giorgio Amato:18 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00191-world-00001` | 6 | A.S. Parma | 72..81 | 49.50 | 7 | transfer=94; squad=2273 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00191-world-00001` | 44.14 | 30..62 | 62..81 | 19..37 | avg 0.230 max 0.280 | 2.33->2.33 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-world-00191 --worlds=1 --seasons=28 --report-output=reports/phase78-contract-finance-world-00191-28-fixed.md
```
