# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Execution: sharded; workers=10; shards=25; resumed=25; partition_hashes=8cae23ebaf3d2c1e,6854c8f55e578922,41ca3ecb7c86ec8f,4494e27b70d76e13,2aa5a757eea34207,af326c2a836ea0d6,8160a0580130800e,5745a7356755fe13,f3865b781426915f,ac16b6c9e5d2e8ad,e7ead34c6215eb51,a08977c27870b32c,c5780444868b224b,31b8d86f75dc5dac,bd400b91546c0a39,c56671ac7fef9798,54cd255c4b842810,1af4c68530e790df,a4a1b2cdbf319e4c,10145d6f74a40ffd,1e5e0d8d5451e333,ae6a16e39e8b407b,9a3afca52c4f957a,de59207542c663a0,acea43fa6fc306ad
Status: FAIL

## Aggregate Metrics

- Failed worlds: 5
- Warning worlds: 245
- Goals per match average: 2.970
- Goals per match p95: 3.040
- Table spread average: 43.10
- Table spread minimum world average: 38.87
- Draw rate average: 0.240
- Draw rate maximum world average: 0.250
- Champion streak max observed: 11
- Top assist max p95: 17
- Production warning max: assists=22 top1=0.34 top3=0.57
- Age 30+ share p95: 0.30
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 12819
- Role coverage warnings p95: 56
- Youth roster max observed: 11
- Active player count min/max: senior=394..443 youth=198..198 total=592..641
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1072150000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4329
- Sampled player value min/max (minor): 19085529..384874179
- Contract lifecycle: renewals=1463841; releases=130024; expiries=211578; selected expiry decisions=122151
- Warning check counts: free_agent_population_share=250, wage_budget_utilization=250, top_assist_max=61, goals_per_match_avg=57, champion_streak=40, senior_active_player_population=30, total_active_player_population=30, top_creator_goal_share_max=3
- Signal check counts: monitor=370, structural=250, story=101
- Failing check counts: champion_streak=5
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-world-00223` | FAIL | 18 | 11 | senior 396..421; youth 198..198; total 594..619 | 0 | 0 | 0 | structural 0; cash 1147208000; wage 1.0000; free agents 0.4222; values 26078253..324782683; renew/release/expiry 5906/537/836 | 14 | avg 43.63; min 26; max 61; low season 4; champion pts 62..90; last pts 22..37; ability spread 2.35->2.20; draw rate avg/max 0.240/0.300 | season 17; A.C. Taranto; Davide Nardini; assists 11; team goals 46; top1 0.24; top3 0.41; top assist Davide Nardini; top scorer Luca Pagani:17 | wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00078` | FAIL | 20 | 11 | senior 396..418; youth 198..198; total 594..616 | 0 | 0 | 0 | structural 0; cash 1203320000; wage 1.0000; free agents 0.4211; values 27939765..333923051; renew/release/expiry 5871/507/811 | 15 | avg 43.17; min 26; max 56; low season 3; champion pts 60..83; last pts 19..37; ability spread 2.49->2.73; draw rate avg/max 0.240/0.280 | season 17; Pro Modena; Giorgio Molinari; assists 10; team goals 44; top1 0.23; top3 0.45; top assist Dario Popovic; top scorer Matteo Ferrari:20 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00013` | FAIL | 20 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | structural 0; cash 1189520000; wage 1.0000; free agents 0.4202; values 24917843..319602614; renew/release/expiry 5942/516/867 | 15 | avg 43.20; min 32; max 57; low season 4; champion pts 60..85; last pts 17..35; ability spread 2.39->2.77; draw rate avg/max 0.250/0.310 | season 6; A.S. Modena; Nikola Vukovic; assists 12; team goals 48; top1 0.25; top3 0.46; top assist Nikola Vukovic; top scorer Luca Palumbo:12 | wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00098` | FAIL | 20 | 11 | senior 396..437; youth 198..198; total 594..635 | 0 | 0 | 0 | structural 0; cash 1152130000; wage 1.0000; free agents 0.4194; values 27640584..313001902; renew/release/expiry 5880/525/876 | 14 | avg 45.27; min 27; max 62; low season 12; champion pts 60..86; last pts 15..35; ability spread 2.73->2.33; draw rate avg/max 0.230/0.290 | season 11; Virtus Brescia; Mert Demir; assists 13; team goals 50; top1 0.26; top3 0.46; top assist Mert Demir; top scorer Joao Moreira:21 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00012` | FAIL | 20 | 11 | senior 396..426; youth 198..198; total 594..624 | 0 | 0 | 0 | structural 0; cash 1184240000; wage 1.0000; free agents 0.4154; values 27478136..329499611; renew/release/expiry 5830/516/884 | 16 | avg 46.03; min 31; max 61; low season 3; champion pts 62..85; last pts 17..33; ability spread 2.66->2.33; draw rate avg/max 0.240/0.310 | season 22; A.C. Catania; Nico Bagnoli; assists 11; team goals 43; top1 0.26; top3 0.44; top assist Nico Bagnoli; top scorer Nico Cattaneo:19 | top_assist_max, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00037` | WARN | 21 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 0; cash 1151380000; wage 1.0000; free agents 0.4329; values 27312401..330841498; renew/release/expiry 5816/499/888 | 14 | avg 45.37; min 33; max 57; low season 13; champion pts 62..83; last pts 20..32; ability spread 3.08->2.98; draw rate avg/max 0.240/0.300 | season 12; S.S. Ravenna; Matteo Tosi; assists 14; team goals 55; top1 0.25; top3 0.44; top assist Matteo Tosi; top scorer Davide Galli:23 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00193` | WARN | 21 | 11 | senior 396..437; youth 198..198; total 594..635 | 0 | 0 | 0 | structural 0; cash 1151520000; wage 1.0000; free agents 0.4323; values 27217558..315947273; renew/release/expiry 5878/520/839 | 16 | avg 41.77; min 29; max 62; low season 21; champion pts 59..87; last pts 21..34; ability spread 2.28->2.60; draw rate avg/max 0.240/0.300 | season 4; F.C. Lucca; Matteo Casadei; assists 10; team goals 40; top1 0.25; top3 0.45; top assist Davide Caldara; top scorer Giorgio Conte:14 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00055` | WARN | 21 | 11 | senior 396..433; youth 198..198; total 594..631 | 0 | 0 | 0 | structural 0; cash 1112280000; wage 1.0000; free agents 0.4321; values 27354634..321939895; renew/release/expiry 5839/520/875 | 14 | avg 44.40; min 28; max 61; low season 1; champion pts 60..89; last pts 19..32; ability spread 2.41->2.80; draw rate avg/max 0.230/0.270 | season 12; A.S. Milan; Nico Galli; assists 11; team goals 41; top1 0.27; top3 0.46; top assist Nico Galli; top scorer Nico Basiletti:19 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00010` | WARN | 19 | 11 | senior 396..430; youth 198..198; total 594..628 | 0 | 0 | 0 | structural 0; cash 1173500000; wage 1.0000; free agents 0.4312; values 27535228..330208577; renew/release/expiry 5851/506/890 | 13 | avg 39.83; min 26; max 56; low season 6; champion pts 59..81; last pts 22..36; ability spread 2.64->2.55; draw rate avg/max 0.240/0.290 | season 19; F.C. Vicenza; Matteo Franzoni; assists 12; team goals 46; top1 0.26; top3 0.43; top assist Matteo Franzoni; top scorer Giorgio Barbieri:18 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00126` | WARN | 20 | 11 | senior 396..424; youth 198..198; total 594..622 | 0 | 0 | 0 | structural 0; cash 1150910000; wage 1.0000; free agents 0.4310; values 25076890..335990423; renew/release/expiry 5840/506/853 | 16 | avg 39.53; min 27; max 59; low season 26; champion pts 60..83; last pts 22..36; ability spread 2.51->2.55; draw rate avg/max 0.250/0.290 | season 23; F.C. Cesena; Davide Accardi; assists 11; team goals 46; top1 0.24; top3 0.42; top assist Davide Accardi; top scorer Mason Turner:25 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-world-00238` | 22 | season 21; U.S. Parma; Giorgio Neri; assists 10; team goals 40; top1 0.25; top3 0.45; top assist Giorgio Neri; top scorer Davide Monti:15 | top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00229` | 22 | season 10; Real Pisa; Matteo Agostini; assists 12; team goals 48; top1 0.25; top3 0.43; top assist Luca Negri; top scorer Diego Campos:16 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00021` | 21 | season 30; A.C. Mantova; Giorgio Piras; assists 21; team goals 75; top1 0.28; top3 0.44; top assist Giorgio Piras; top scorer Giorgio Piras:15 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00110` | 21 | season 25; Trento Calcio; Diego Serrano; assists 15; team goals 65; top1 0.23; top3 0.46; top assist Luca Rosati; top scorer Jakub Zielinski:22 | top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00127` | 21 | season 27; Vicenza Calcio; Nico Antonelli; assists 21; team goals 92; top1 0.23; top3 0.43; top assist Nico Antonelli; top scorer Enrico Galli:21 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00241` | 19 | season 6; U.S. Carpi; Felix Weber; assists 12; team goals 47; top1 0.26; top3 0.51; top assist Felix Weber; top scorer Nico Zanetti:14 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00070` | 18 | season 25; Vicenza Calcio; Nico Garofalo; assists 14; team goals 52; top1 0.27; top3 0.45; top assist Nico Garofalo; top scorer Nico Mancuso:15 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00076` | 18 | season 4; Virtus Lecco; Matteo Ricci; assists 12; team goals 45; top1 0.27; top3 0.42; top assist Matteo Ricci; top scorer Enrico Silvestri:16 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00163` | 18 | season 7; A.S. Bologna; Davide Capelli; assists 12; team goals 47; top1 0.26; top3 0.43; top assist Davide Capelli; top scorer Matteo Costantini:15 | top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00011` | 18 | season 9; Taranto Calcio; Davide Lorenzini; assists 18; team goals 77; top1 0.23; top3 0.42; top assist Davide Lorenzini; top scorer Davide Carlini:16 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00012` | 11 | S.S. Pisa | 66..85 | 47.00 | 6 | transfer=103; squad=2504 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00098` | 10 | Real Modena | 60..84 | 44.70 | 7 | transfer=102; squad=2524 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00223` | 9 | S.S. Cosenza | 65..90 | 46.56 | 7 | transfer=101; squad=2519 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00013` | 9 | Virtus Lucca | 64..79 | 44.33 | 10 | transfer=102; squad=2499 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00078` | 9 | A.S.D. Rimini | 60..83 | 39.56 | 7 | transfer=103; squad=2446 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00109` | 8 | Vicenza Calcio | 68..84 | 49.75 | 5 | transfer=102; squad=2456 | top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00110` | 8 | A.S. Trieste | 70..83 | 49.63 | 7 | transfer=102; squad=2489 | top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00047` | 8 | A.S. Parma | 68..87 | 46.13 | 8 | transfer=102; squad=2484 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00232` | 8 | S.S. Taranto | 63..80 | 43.00 | 9 | transfer=103; squad=2494 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00181` | 7 | A.C. Lucca | 72..84 | 50.00 | 9 | transfer=104; squad=2500 | champion_streak, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00231` | 38.87 | 25..56 | 58..82 | 18..37 | avg 0.250 max 0.310 | 2.53->2.60 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00126` | 39.53 | 27..59 | 60..83 | 22..36 | avg 0.250 max 0.290 | 2.51->2.55 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00059` | 39.83 | 25..57 | 59..78 | 16..37 | avg 0.240 max 0.300 | 2.33->2.99 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00010` | 39.83 | 26..56 | 59..81 | 22..36 | avg 0.240 max 0.290 | 2.64->2.55 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00146` | 39.87 | 31..62 | 59..81 | 19..36 | avg 0.240 max 0.320 | 2.45->2.56 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00200` | 39.90 | 27..48 | 59..82 | 21..35 | avg 0.240 max 0.290 | 2.56->2.48 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00172` | 40.03 | 25..52 | 59..79 | 23..36 | avg 0.240 max 0.300 | 2.38->2.41 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00158` | 40.13 | 25..55 | 61..82 | 23..36 | avg 0.240 max 0.310 | 2.25->2.16 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00084` | 40.33 | 26..57 | 60..79 | 22..38 | avg 0.240 max 0.290 | 2.42->3.13 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00164` | 40.40 | 28..55 | 59..81 | 18..36 | avg 0.240 max 0.310 | 2.13->2.74 | top_creator_goal_share_max, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance --worlds=250 --seasons=30 --checkpoint-dir=<checkpoint-directory> --shards=25 --report-output=reports/phase78-contract-finance-250x30-repeat.md
```
