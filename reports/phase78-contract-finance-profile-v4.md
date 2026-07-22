# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-profile-v4`
Worlds: 1
Seasons per world: 50
Total seasons: 50
Execution: sequential; workers=1; partition_hashes=a9a9788c7cec85a7
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 1
- Goals per match average: 3.020
- Goals per match p95: 3.020
- Table spread average: 44.00
- Table spread minimum world average: 44.00
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 6
- Top assist max p95: 15
- Production warning max: assists=15 top1=0.25 top3=0.40
- Age 30+ share p95: 0.28
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 48
- Role coverage warnings p95: 48
- Youth roster max observed: 11
- Active player count min/max: senior=395..422 youth=198..198 total=593..620
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1120330000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4077
- Sampled player value min/max (minor): 27408522..322136446
- Contract lifecycle: renewals=9602; releases=911; expiries=1334; selected expiry decisions=816
- Warning check counts: free_agent_population_share=1, goals_per_match_avg=1, senior_active_player_population=1, total_active_player_population=1, wage_budget_utilization=1
- Signal check counts: monitor=4, structural=1
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-profile-v4-world-00001` | WARN | 19 | 11 | senior 395..422; youth 198..198; total 593..620 | 0 | 0 | 0 | structural 0; cash 1120330000; wage 1.0000; free agents 0.4077; values 27408522..322136446; renew/release/expiry 9602/911/1334 | 15 | avg 44.00; min 19; max 56; low season 5; champion pts 56..83; last pts 22..37; ability spread 2.32->3.25; draw rate avg/max 0.240/0.300 | season 20; S.S. Vicenza; Davide Sordi; assists 10; team goals 40; top1 0.25; top3 0.40; top assist Luca Cerri; top scorer Emir Aydin:17 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-profile-v4-world-00001` | 15 | season 20; S.S. Vicenza; Davide Sordi; assists 10; team goals 40; top1 0.25; top3 0.40; top assist Luca Cerri; top scorer Emir Aydin:17 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-profile-v4-world-00001` | 6 | Mantova Calcio | 72..79 | 47.00 | 9 | transfer=183; squad=4381 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-profile-v4-world-00001` | 44.00 | 19..56 | 56..83 | 22..37 | avg 0.240 max 0.300 | 2.32->3.25 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-profile-v4 --worlds=1 --seasons=50 --report-output=reports/phase78-contract-finance-profile-v4.md
```
