# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance`
Worlds: 50
Seasons per world: 10
Total seasons: 500
Execution: parallel; workers=12; partition_hashes=6710ea3dc14d7f3f,94f449f6cf66309a,2c14d440dfe9602f,f6bf5fd0fa099b16,0b2bd4f0e0334ea4,9443cf10114ba8c9,459a9b8119e4a80d,5ada73f4930dbec2,adb28f02541ac45f,cc83d4b941b7b53e,075767a640013064,6710cea8569b701e
Status: FAIL

## Aggregate Metrics

- Failed worlds: 17
- Warning worlds: 33
- Goals per match average: 2.890
- Goals per match p95: 2.940
- Table spread average: 38.85
- Table spread minimum world average: 32.50
- Draw rate average: 0.250
- Draw rate maximum world average: 0.270
- Champion streak max observed: 4
- Top assist max p95: 15
- Production warning max: assists=15 top1=0.29 top3=0.51
- Age 30+ share p95: 0.25
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 2578
- Role coverage warnings p95: 58
- Youth roster max observed: 11
- Active player count min/max: senior=395..440 youth=198..198 total=593..638
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 22
- Club cash floor (minor): 837444734
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.3819
- Sampled player value min/max (minor): 31335227..367632022
- Contract lifecycle: renewals=166919; releases=3841; expiries=6754; selected expiry decisions=8506
- Warning check counts: free_agent_population_share=50, wage_budget_utilization=50, table_points_spread_avg=8, champion_streak=6, senior_active_player_population=3, total_active_player_population=3, goals_per_match_avg=1, useful_players_after_long_run=1
- Signal check counts: monitor=58, structural=50, story=14
- Failing check counts: contract_finance_structural_integrity=17
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-world-00036` | FAIL | 19 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | structural 4; cash 1105820000; wage 1.0000; free agents 0.3545; values 36218441..315194110; renew/release/expiry 3487/90/154 | 11 | avg 35.30; min 30; max 40; low season 7; champion pts 60..70; last pts 22..35; ability spread 2.52->2.12; draw rate avg/max 0.250/0.270 | season 10; Perugia Calcio; Matteo Sala; assists 10; team goals 45; top1 0.22; top3 0.44; top assist Matteo Tosi; top scorer Davide Fabiani:15 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00049` | FAIL | 20 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | structural 2; cash 1109600000; wage 1.0000; free agents 0.3776; values 36958525..313104652; renew/release/expiry 3225/57/135 | 12 | avg 37.60; min 27; max 46; low season 1; champion pts 60..71; last pts 21..33; ability spread 2.17->2.14; draw rate avg/max 0.260/0.300 | season 10; A.C. Cosenza; Milan Milosevic; assists 9; team goals 41; top1 0.22; top3 0.40; top assist Giorgio Bruno; top scorer Davide Bosco:16 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00013` | FAIL | 20 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 2; cash 1189520000; wage 1.0000; free agents 0.3653; values 36765913..319602614; renew/release/expiry 3428/77/120 | 12 | avg 38.50; min 32; max 49; low season 4; champion pts 62..75; last pts 21..35; ability spread 2.39->1.71; draw rate avg/max 0.240/0.260 | season 4; A.S. Mantova; Dario Petrovic; assists 12; team goals 52; top1 0.23; top3 0.49; top assist Dario Petrovic; top scorer Enrico Ruggieri:18 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00035` | FAIL | 21 | 11 | senior 396..440; youth 198..198; total 594..638 | 0 | 0 | 0 | structural 1; cash 1150700000; wage 1.0000; free agents 0.3763; values 34391739..296401325; renew/release/expiry 3254/80/146 | 11 | avg 38.70; min 23; max 50; low season 1; champion pts 58..71; last pts 21..35; ability spread 2.58->2.66; draw rate avg/max 0.240/0.270 | season 3; A.S. Lucca; Giorgio Palladino; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Giorgio Palladino; top scorer Nico Bertini:14 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00042` | FAIL | 19 | 11 | senior 396..430; youth 198..198; total 594..628 | 0 | 0 | 0 | structural 1; cash 1124940000; wage 1.0000; free agents 0.3750; values 34504123..327559768; renew/release/expiry 3334/71/145 | 12 | avg 38.60; min 30; max 46; low season 1; champion pts 64..71; last pts 25..34; ability spread 2.51->2.30; draw rate avg/max 0.240/0.260 | season 9; Virtus Padova; Milan Radic; assists 9; team goals 40; top1 0.23; top3 0.40; top assist Luca Ferri; top scorer Davide Zanetti:16 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00038` | FAIL | 21 | 11 | senior 396..426; youth 198..198; total 594..624 | 0 | 0 | 0 | structural 1; cash 1116710000; wage 1.0000; free agents 0.3739; values 32643663..302829864; renew/release/expiry 3312/68/133 | 12 | avg 38.60; min 25; max 50; low season 5; champion pts 58..73; last pts 21..33; ability spread 2.26->2.28; draw rate avg/max 0.250/0.290 | season 4; A.C. Mantova; Matteo Melis; assists 12; team goals 55; top1 0.22; top3 0.37; top assist Matteo Melis; top scorer Jisung Park:16 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00008` | FAIL | 21 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 1; cash 1192810000; wage 1.0000; free agents 0.3713; values 36119511..298185263; renew/release/expiry 3444/72/143 | 13 | avg 39.70; min 29; max 50; low season 2; champion pts 60..73; last pts 14..33; ability spread 2.93->2.75; draw rate avg/max 0.240/0.290 | season 6; Virtus Pescara; Luca D'Angelo; assists 10; team goals 40; top1 0.25; top3 0.42; top assist Giorgio Zanchi; top scorer Giorgio Lucchesi:14 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00014` | FAIL | 21 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | structural 1; cash 1138530000; wage 1.0000; free agents 0.3696; values 35726112..294149167; renew/release/expiry 3364/79/128 | 11 | avg 36.00; min 25; max 50; low season 9; champion pts 60..75; last pts 25..35; ability spread 2.23->1.97; draw rate avg/max 0.250/0.290 | season 7; F.C. Cesena; Luca Bartoli; assists 10; team goals 43; top1 0.23; top3 0.40; top assist Enrico Valentini; top scorer Giorgio Acerbi:17 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00012` | FAIL | 20 | 11 | senior 396..426; youth 198..198; total 594..624 | 0 | 0 | 0 | structural 1; cash 1184240000; wage 1.0000; free agents 0.3696; values 34665932..334050328; renew/release/expiry 3331/79/125 | 11 | avg 40.10; min 31; max 50; low season 3; champion pts 62..78; last pts 20..33; ability spread 2.66->2.45; draw rate avg/max 0.250/0.270 | season 6; Virtus Lucca; Matteo Bruni; assists 9; team goals 44; top1 0.20; top3 0.40; top assist Matteo Bruni; top scorer Nico Casali:17 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |
| `phase78-contract-finance-world-00045` | FAIL | 20 | 11 | senior 396..428; youth 198..198; total 594..626 | 0 | 0 | 0 | structural 1; cash 1145550000; wage 1.0000; free agents 0.3688; values 35043403..307175021; renew/release/expiry 3432/83/129 | 12 | avg 43.40; min 36; max 50; low season 6; champion pts 63..74; last pts 22..29; ability spread 2.25->2.21; draw rate avg/max 0.250/0.280 | season 1; A.C. Genoa; Lukas Keller; assists 10; team goals 47; top1 0.21; top3 0.38; top assist Matteo Zorzi; top scorer Milan Knezevic:14 | wage_budget_utilization, free_agent_population_share | contract_finance_structural_integrity |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-world-00025` | 15 | season 10; A.S. Lecco; Nico Gatti; assists 15; team goals 51; top1 0.29; top3 0.43; top assist Nico Gatti; top scorer Davide Brambilla:18 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00003` | 15 | season 1; A.C. Siena; Nico Gentile; assists 12; team goals 49; top1 0.24; top3 0.47; top assist Nico Gentile; top scorer Marko Nikolic:17 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00037` | 15 | season 4; U.S. Brescia; Giorgio Farina; assists 10; team goals 41; top1 0.24; top3 0.49; top assist Matteo Casadei; top scorer Matteo Fiorini:14 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00006` | 15 | season 8; A.S. Rimini; Marko Novak; assists 12; team goals 50; top1 0.24; top3 0.46; top assist Marko Novak; top scorer Giorgio Pagani:18 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00048` | 13 | season 4; F.C. Ravenna; Enrico Moretti; assists 13; team goals 48; top1 0.27; top3 0.49; top assist Enrico Moretti; top scorer Enrico Valentini:15 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00002` | 13 | season 4; A.S.D. Arezzo; Matteo Nardini; assists 12; team goals 47; top1 0.26; top3 0.45; top assist Matteo Nardini; top scorer Nico Pagani:13 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00019` | 13 | season 5; S.S. Turin; Davide Donati; assists 13; team goals 51; top1 0.25; top3 0.39; top assist Davide Donati; top scorer Nico Santi:19 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00008` | 13 | season 6; Virtus Pescara; Luca D'Angelo; assists 10; team goals 40; top1 0.25; top3 0.42; top assist Giorgio Zanchi; top scorer Giorgio Lucchesi:14 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00026` | 13 | season 6; U.S. Ravenna; Matteo Martinelli; assists 10; team goals 41; top1 0.24; top3 0.46; top assist Matteo Martinelli; top scorer Nico Conte:16 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00046` | 13 | season 4; Pro Perugia; Davide Casadei; assists 13; team goals 56; top1 0.23; top3 0.45; top assist Davide Casadei; top scorer Davide Zanetti:15 | champion_streak, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00037` | 4 | S.S. Ravenna | 70..78 | 49.75 | 5 | transfer=23; squad=250 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00006` | 4 | A.C. Pescara | 66..79 | 46.25 | 4 | transfer=24; squad=258 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00044` | 4 | A.S. Mantova | 63..77 | 43.50 | 4 | transfer=22; squad=250 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00011` | 4 | Pro Pescara | 63..74 | 42.25 | 4 | transfer=24; squad=280 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00046` | 4 | A.S.D. Salerno | 67..73 | 41.75 | 3 | transfer=22; squad=281 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00017` | 4 | U.S. Mantova | 63..74 | 40.50 | 6 | transfer=24; squad=282 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00019` | 3 | U.S. Lucca | 67..73 | 43.33 | 6 | transfer=23; squad=283 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00033` | 3 | Terni Calcio | 61..70 | 42.67 | 5 | transfer=24; squad=294 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00024` | 3 | F.C. Palermo | 65..72 | 39.67 | 6 | transfer=20; squad=250 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00001` | 3 | A.S. Modena | 65..74 | 39.33 | 6 | transfer=24; squad=274 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00005` | 32.50 | 24..41 | 60..69 | 28..37 | avg 0.250 max 0.300 | 2.16->2.21 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00034` | 34.50 | 24..41 | 58..72 | 27..35 | avg 0.250 max 0.270 | 2.23->2.30 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00028` | 35.00 | 26..41 | 59..69 | 23..35 | avg 0.240 max 0.270 | 2.56->2.20 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00036` | 35.30 | 30..40 | 60..70 | 22..35 | avg 0.250 max 0.270 | 2.52->2.12 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00018` | 35.60 | 29..44 | 59..72 | 23..34 | avg 0.250 max 0.300 | 3.07->2.38 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00041` | 35.70 | 22..52 | 57..72 | 19..35 | avg 0.270 max 0.330 | 2.92->2.63 | table_points_spread_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00040` | 35.80 | 29..43 | 59..72 | 19..34 | avg 0.240 max 0.280 | 2.32->2.33 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00025` | 35.80 | 30..43 | 61..71 | 24..35 | avg 0.240 max 0.290 | 2.66->2.07 | table_points_spread_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00014` | 36.00 | 25..50 | 60..75 | 25..35 | avg 0.250 max 0.290 | 2.23->1.97 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00046` | 36.90 | 22..46 | 57..73 | 20..35 | avg 0.240 max 0.270 | 2.44->2.38 | champion_streak, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance --worlds=50 --seasons=10 --report-output=reports/phase78-contract-finance-50x10.md
```
