# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance`
Worlds: 50
Seasons per world: 10
Total seasons: 500
Execution: sequential; workers=1; partition_hashes=11f77d95b9de2f91
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 50
- Goals per match average: 2.930
- Goals per match p95: 3.010
- Table spread average: 39.75
- Table spread minimum world average: 36.00
- Draw rate average: 0.240
- Draw rate maximum world average: 0.260
- Champion streak max observed: 6
- Top assist max p95: 15
- Production warning max: assists=18 top1=0.30 top3=0.53
- Age 30+ share p95: 0.24
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 2570
- Role coverage warnings p95: 57
- Youth roster max observed: 11
- Active player count min/max: senior=395..438 youth=198..198 total=593..636
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1097550000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.3809
- Sampled player value min/max (minor): 29207456..374202738
- Contract lifecycle: renewals=88666; releases=2408; expiries=12094; selected expiry decisions=8514
- Warning check counts: free_agent_population_share=50, wage_budget_utilization=50, goals_per_match_avg=6, champion_streak=3, senior_active_player_population=3, total_active_player_population=3, top_assist_max=2, useful_players_after_long_run=1
- Signal check counts: monitor=63, structural=50, story=5
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-world-00049` | WARN | 20 | 11 | senior 396..434; youth 198..198; total 594..632 | 0 | 0 | 0 | structural 0; cash 1109600000; wage 1.0000; free agents 0.3809; values 35555287..300918373; renew/release/expiry 1772/44/249 | 10 | avg 40.30; min 27; max 59; low season 1; champion pts 60..77; last pts 18..33; ability spread 2.17->2.59; draw rate avg/max 0.260/0.290 | season 3; Foggia Calcio; Giorgio Corsi; assists 10; team goals 47; top1 0.21; top3 0.42; top assist Giorgio Corsi; top scorer Nico Landi:14 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00037` | WARN | 20 | 11 | senior 396..427; youth 198..198; total 594..625 | 0 | 0 | 0 | structural 0; cash 1151380000; wage 1.0000; free agents 0.3747; values 35369695..309789084; renew/release/expiry 1675/39/255 | 14 | avg 43.20; min 36; max 56; low season 1; champion pts 65..76; last pts 20..32; ability spread 3.08->2.80; draw rate avg/max 0.240/0.270 | season 7; A.S. Turin; Giorgio Fiorentini; assists 14; team goals 56; top1 0.25; top3 0.40; top assist Giorgio Fiorentini; top scorer Matteo Borghese:19 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00014` | WARN | 21 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | structural 0; cash 1138530000; wage 1.0000; free agents 0.3714; values 32054071..304397144; renew/release/expiry 1782/44/251 | 11 | avg 36.80; min 29; max 50; low season 5; champion pts 63..75; last pts 25..34; ability spread 2.23->2.10; draw rate avg/max 0.250/0.290 | season 3; Pro Taranto; Davide Naldi; assists 11; team goals 50; top1 0.22; top3 0.43; top assist Davide Naldi; top scorer Luca Pellecchia:14 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00035` | WARN | 21 | 11 | senior 396..438; youth 198..198; total 594..636 | 0 | 0 | 0 | structural 0; cash 1150700000; wage 1.0000; free agents 0.3713; values 31308904..296401325; renew/release/expiry 1748/39/254 | 13 | avg 39.80; min 23; max 53; low season 1; champion pts 58..74; last pts 20..35; ability spread 2.58->2.90; draw rate avg/max 0.240/0.270 | season 3; A.S. Lucca; Giorgio Palladino; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Giorgio Palladino; top scorer Nico Bertini:14 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00010` | WARN | 19 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 0; cash 1173500000; wage 1.0000; free agents 0.3704; values 31525791..313272717; renew/release/expiry 1759/36/242 | 13 | avg 37.90; min 27; max 56; low season 6; champion pts 59..79; last pts 23..33; ability spread 2.64->2.39; draw rate avg/max 0.230/0.290 | season 5; Pro Taranto; Daichi Mori; assists 10; team goals 50; top1 0.20; top3 0.43; top assist Matteo Bruni; top scorer Enrico Amato:14 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00043` | WARN | 19 | 11 | senior 396..420; youth 198..198; total 594..618 | 0 | 0 | 0 | structural 0; cash 1133710000; wage 1.0000; free agents 0.3701; values 34199045..291334670; renew/release/expiry 1756/47/227 | 12 | avg 43.70; min 33; max 56; low season 5; champion pts 62..77; last pts 19..33; ability spread 2.52->2.58; draw rate avg/max 0.240/0.270 | season 10; Pro Trieste; Enrico Casadei; assists 12; team goals 52; top1 0.23; top3 0.44; top assist Enrico Casadei; top scorer Matteo Zanchi:22 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00044` | WARN | 21 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 0; cash 1172030000; wage 1.0000; free agents 0.3697; values 34419883..297027190; renew/release/expiry 1754/33/226 | 13 | avg 38.90; min 31; max 48; low season 5; champion pts 61..79; last pts 23..32; ability spread 2.43->1.87; draw rate avg/max 0.250/0.280 | season 3; S.S. Vicenza; Oliver Fletcher; assists 13; team goals 60; top1 0.22; top3 0.45; top assist Oliver Fletcher; top scorer Matteo Fabiani:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00048` | WARN | 20 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | structural 0; cash 1126230000; wage 1.0000; free agents 0.3681; values 36488195..336219285; renew/release/expiry 1768/49/232 | 13 | avg 36.10; min 23; max 52; low season 4; champion pts 60..79; last pts 27..37; ability spread 2.05->2.67; draw rate avg/max 0.250/0.280 | season 8; Pro Genoa; Matteo Farina; assists 13; team goals 44; top1 0.30; top3 0.43; top assist Matteo Russo; top scorer Davide Palladino:19 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00019` | WARN | 19 | 11 | senior 396..416; youth 198..198; total 594..614 | 0 | 0 | 0 | structural 0; cash 1137470000; wage 1.0000; free agents 0.3681; values 33069113..339471218; renew/release/expiry 1750/49/241 | 15 | avg 45.20; min 38; max 55; low season 4; champion pts 63..74; last pts 19..31; ability spread 2.76->3.23; draw rate avg/max 0.230/0.300 | season 6; A.S. Arezzo; Davide Cali; assists 15; team goals 58; top1 0.26; top3 0.45; top assist Davide Cali; top scorer Luca Capone:16 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00001` | WARN | 20 | 11 | senior 395..428; youth 198..198; total 593..626 | 0 | 0 | 0 | structural 0; cash 1097920000; wage 1.0000; free agents 0.3676; values 32542274..312821492; renew/release/expiry 1745/43/246 | 12 | avg 41.30; min 31; max 59; low season 2; champion pts 62..76; last pts 12..33; ability spread 2.57->2.55; draw rate avg/max 0.250/0.280 | season 5; S.S. Lecco; Pavel Horak; assists 9; team goals 43; top1 0.21; top3 0.37; top assist Enrico Esposito; top scorer Luca Palladino:13 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-world-00029` | 18 | season 3; U.S. Rome; Matteo Mancini; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Nico Cali; top scorer Davide Longo:21 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00005` | 16 | season 7; Brescia Calcio; Davide Melis; assists 12; team goals 47; top1 0.26; top3 0.40; top assist Davide Melis; top scorer Nico Garofalo:15 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00019` | 15 | season 6; A.S. Arezzo; Davide Cali; assists 15; team goals 58; top1 0.26; top3 0.45; top assist Davide Cali; top scorer Luca Capone:16 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00003` | 15 | season 6; A.S. Pescara; Enrico Messina; assists 15; team goals 61; top1 0.25; top3 0.39; top assist Enrico Messina; top scorer Giorgio Cavallaro:14 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00037` | 14 | season 7; A.S. Turin; Giorgio Fiorentini; assists 14; team goals 56; top1 0.25; top3 0.40; top assist Giorgio Fiorentini; top scorer Matteo Borghese:19 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00025` | 14 | season 5; Virtus Cesena; Matteo Conti; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Matteo Conti; top scorer Nico Silvestri:16 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00028` | 14 | season 10; Real Modena; Matteo Ferrini; assists 12; team goals 51; top1 0.24; top3 0.53; top assist Matteo Ferrini; top scorer Luca Pini:16 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00006` | 14 | season 2; A.S. Cagliari; Felix Vogel; assists 9; team goals 40; top1 0.23; top3 0.40; top assist Enrico Capelli; top scorer Giorgio Pagani:17 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00048` | 13 | season 8; Pro Genoa; Matteo Farina; assists 13; team goals 44; top1 0.30; top3 0.43; top assist Matteo Russo; top scorer Davide Palladino:19 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00039` | 13 | season 7; A.C. Rimini; Giorgio Barone; assists 13; team goals 45; top1 0.29; top3 0.47; top assist Giorgio Barone; top scorer Giorgio Tarantino:17 | wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00033` | 6 | Terni Calcio | 63..70 | 43.50 | 4 | transfer=24; squad=358 | goals_per_match_avg, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00006` | 4 | A.C. Pescara | 66..79 | 47.00 | 5 | transfer=24; squad=358 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00025` | 4 | A.C. Ascoli | 62..73 | 40.75 | 6 | transfer=20; squad=381 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00019` | 3 | U.S. Lucca | 66..74 | 50.00 | 5 | transfer=22; squad=368 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00037` | 3 | S.S. Ravenna | 69..76 | 44.67 | 5 | transfer=24; squad=348 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00044` | 3 | A.S. Mantova | 65..69 | 42.67 | 6 | transfer=23; squad=315 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00001` | 3 | A.S. Modena | 67..74 | 41.33 | 4 | transfer=22; squad=354 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00049` | 3 | Pro Ascoli | 63..69 | 40.00 | 5 | transfer=24; squad=354 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00024` | 3 | F.C. Palermo | 65..72 | 39.67 | 6 | transfer=22; squad=364 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00021` | 3 | U.S. Vicenza | 65..70 | 37.67 | 3 | transfer=26; squad=392 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00005` | 36.00 | 24..45 | 61..76 | 26..37 | avg 0.240 max 0.300 | 2.16->2.03 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00048` | 36.10 | 23..52 | 60..79 | 27..37 | avg 0.250 max 0.280 | 2.05->2.67 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00046` | 36.60 | 27..46 | 59..73 | 20..33 | avg 0.230 max 0.260 | 2.44->2.81 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00014` | 36.80 | 29..50 | 63..75 | 25..34 | avg 0.250 max 0.290 | 2.23->2.10 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00034` | 36.90 | 27..49 | 61..78 | 24..36 | avg 0.240 max 0.270 | 2.23->2.42 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00040` | 37.20 | 30..46 | 59..72 | 19..34 | avg 0.240 max 0.260 | 2.32->2.16 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00028` | 37.40 | 25..47 | 59..76 | 23..36 | avg 0.240 max 0.270 | 2.56->2.37 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00036` | 37.50 | 31..48 | 60..68 | 18..33 | avg 0.250 max 0.290 | 2.52->2.43 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00041` | 37.60 | 27..60 | 59..78 | 18..34 | avg 0.260 max 0.330 | 2.92->2.91 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00018` | 37.70 | 24..47 | 60..70 | 17..36 | avg 0.250 max 0.290 | 3.07->2.63 | wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance --worlds=50 --seasons=10 --report-output=reports/phase78-contract-finance-50x10-batched.md
```
