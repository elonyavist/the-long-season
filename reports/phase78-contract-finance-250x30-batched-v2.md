# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Execution: sharded; workers=10; shards=25; resumed=0; partition_hashes=8e66d048b1d59f62,b34080a4a92b62f8,6bcea8e0c2e9c72b,ad8e9c8e1fb18760,ab44e0a6d0498b25,dc2944ce79050641,f36fc4a1f267a605,f1fdebb01821d5eb,d149081b3721e9d5,cd4112095211e9a5,5f2905931ab5769a,a2c081ae56bc6ac2,1e6ce734733d1d9f,7c353eab9e39f6a3,566b28e4f9c3b74d,99eaf91036f2b4cd,000f73096c0f9536,e5170815f25b0243,c9385852a510af2a,ba02b955b4dd1616,f10dc2f12166b28b,bf28b3463180d4ba,cd336aed4b6dce87,3ae7aaf46176d2b7,898aace4880f6ac2
Status: FAIL

## Aggregate Metrics

- Failed worlds: 5
- Warning worlds: 245
- Goals per match average: 2.980
- Goals per match p95: 3.040
- Table spread average: 42.99
- Table spread minimum world average: 37.73
- Draw rate average: 0.240
- Draw rate maximum world average: 0.250
- Champion streak max observed: 11
- Top assist max p95: 18
- Production warning max: assists=19 top1=0.33 top3=0.57
- Age 30+ share p95: 0.30
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 12800
- Role coverage warnings p95: 56
- Youth roster max observed: 11
- Active player count min/max: senior=394..441 youth=198..198 total=592..639
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1072150000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4337
- Sampled player value min/max (minor): 20877426..384874179
- Contract lifecycle: renewals=1460096; releases=129165; expiries=213071; selected expiry decisions=121992
- Warning check counts: free_agent_population_share=250, wage_budget_utilization=250, goals_per_match_avg=68, top_assist_max=61, champion_streak=46, senior_active_player_population=29, total_active_player_population=29, top_creator_goal_share_max=3
- Signal check counts: monitor=379, structural=250, story=107
- Failing check counts: champion_streak=5
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-world-00128` | FAIL | 20 | 11 | senior 396..433; youth 198..198; total 594..631 | 0 | 0 | 0 | structural 0; cash 1126030000; wage 1.0000; free agents 0.4227; values 26835508..310151105; renew/release/expiry 5795/513/865 | 15 | avg 46.30; min 33; max 67; low season 4; champion pts 59..83; last pts 16..33; ability spread 2.86->2.92; draw rate avg/max 0.230/0.280 | season 9; A.C. Trieste; Giorgio Casadei; assists 12; team goals 49; top1 0.24; top3 0.51; top assist Giorgio Casadei; top scorer Giorgio Zambelli:17 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00192` | FAIL | 19 | 11 | senior 396..417; youth 198..198; total 594..615 | 0 | 0 | 0 | structural 0; cash 1226810000; wage 1.0000; free agents 0.4218; values 25132733..367722613; renew/release/expiry 5843/507/866 | 18 | avg 44.00; min 28; max 59; low season 5; champion pts 59..82; last pts 18..33; ability spread 2.90->2.60; draw rate avg/max 0.240/0.280 | season 18; A.S. Milan; Enrico Bonacina; assists 10; team goals 43; top1 0.23; top3 0.44; top assist Matteo Marchetti; top scorer Luca Moretti:16 | top_assist_max, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00110` | FAIL | 20 | 11 | senior 396..426; youth 198..198; total 594..624 | 0 | 0 | 0 | structural 0; cash 1171750000; wage 1.0000; free agents 0.4212; values 21766533..325919657; renew/release/expiry 5866/518/878 | 15 | avg 45.23; min 33; max 56; low season 6; champion pts 61..82; last pts 21..32; ability spread 2.48->2.92; draw rate avg/max 0.240/0.300 | season 28; U.S. Foggia; Enrico Lippi; assists 15; team goals 65; top1 0.23; top3 0.38; top assist Enrico Lippi; top scorer Enrico Bevilacqua:21 | wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00228` | FAIL | 20 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | structural 0; cash 1124150000; wage 1.0000; free agents 0.4155; values 29814364..330270582; renew/release/expiry 5856/515/853 | 16 | avg 43.60; min 29; max 60; low season 5; champion pts 62..85; last pts 22..38; ability spread 2.44->2.73; draw rate avg/max 0.240/0.280 | season 20; A.S. Matera; Luca Pavoni; assists 10; team goals 43; top1 0.23; top3 0.40; top assist Luca Pavoni; top scorer Enrico Schiavone:22 | top_assist_max, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00185` | FAIL | 20 | 11 | senior 396..428; youth 198..198; total 594..626 | 0 | 0 | 0 | structural 0; cash 1187010000; wage 1.0000; free agents 0.4095; values 28422895..326937155; renew/release/expiry 5894/507/826 | 13 | avg 45.20; min 29; max 61; low season 9; champion pts 59..86; last pts 18..35; ability spread 2.29->2.88; draw rate avg/max 0.230/0.270 | season 7; U.S. Padova; Matteo Carminati; assists 9; team goals 43; top1 0.21; top3 0.41; top assist Giorgio Farina; top scorer Nico Messina:19 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | champion_streak |
| `phase78-contract-finance-world-00055` | WARN | 21 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | structural 0; cash 1112280000; wage 1.0000; free agents 0.4337; values 28399741..321939895; renew/release/expiry 5813/502/897 | 14 | avg 45.10; min 28; max 63; low season 1; champion pts 60..89; last pts 19..35; ability spread 2.41->2.81; draw rate avg/max 0.230/0.290 | season 23; A.C. Trieste; Luca Bruni; assists 12; team goals 50; top1 0.24; top3 0.44; top assist Luca Bruni; top scorer Ibrahima Diop:21 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00037` | WARN | 20 | 11 | senior 396..427; youth 198..198; total 594..625 | 0 | 0 | 0 | structural 0; cash 1151380000; wage 1.0000; free agents 0.4335; values 25133406..330841498; renew/release/expiry 5809/511/881 | 14 | avg 45.23; min 30; max 56; low season 25; champion pts 63..87; last pts 19..33; ability spread 3.08->2.79; draw rate avg/max 0.240/0.300 | season 18; A.S.D. Ascoli; Enrico Di Biase; assists 12; team goals 43; top1 0.28; top3 0.49; top assist Giorgio Bosco; top scorer Ivan Tomic:18 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00010` | WARN | 19 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 0; cash 1173500000; wage 1.0000; free agents 0.4321; values 27535228..314784067; renew/release/expiry 5885/495/858 | 13 | avg 41.67; min 27; max 59; low season 6; champion pts 59..83; last pts 21..35; ability spread 2.64->2.92; draw rate avg/max 0.240/0.290 | season 21; F.C. Vicenza; Moussa Traore; assists 11; team goals 48; top1 0.23; top3 0.42; top assist Moussa Traore; top scorer Dario Knezevic:17 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00138` | WARN | 20 | 11 | senior 396..418; youth 198..198; total 594..616 | 0 | 0 | 0 | structural 0; cash 1164090000; wage 1.0000; free agents 0.4305; values 28188881..324296063; renew/release/expiry 5830/495/870 | 16 | avg 47.23; min 29; max 59; low season 26; champion pts 62..84; last pts 16..36; ability spread 2.54->2.84; draw rate avg/max 0.230/0.280 | season 7; A.C. Catania; Matteo Costa; assists 11; team goals 48; top1 0.23; top3 0.40; top assist Renan Teixeira; top scorer Mert Yilmaz:16 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-world-00094` | WARN | 21 | 11 | senior 396..438; youth 198..198; total 594..636 | 0 | 0 | 0 | structural 0; cash 1177960000; wage 1.0000; free agents 0.4305; values 28443033..326407544; renew/release/expiry 5836/525/867 | 14 | avg 42.07; min 29; max 54; low season 4; champion pts 58..80; last pts 15..34; ability spread 2.62->2.24; draw rate avg/max 0.230/0.290 | season 6; A.S.D. Rimini; Davide Casadei; assists 11; team goals 49; top1 0.22; top3 0.41; top assist Davide Casadei; top scorer Nico Magnani:16 | wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-world-00093` | 19 | season 10; U.S. Perugia; Javier Molina; assists 19; team goals 68; top1 0.28; top3 0.46; top assist Javier Molina; top scorer Enrico Di Biase:16 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00095` | 19 | season 3; A.C. Ravenna; Matteo D'Amico; assists 12; team goals 46; top1 0.26; top3 0.42; top assist Matteo D'Amico; top scorer Giorgio Giuliani:18 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00060` | 19 | season 26; A.S. Modena; Luca Cecchi; assists 19; team goals 73; top1 0.26; top3 0.47; top assist Luca Cecchi; top scorer Davide Mazzi:16 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00043` | 19 | season 20; A.C. Ascoli; Nico Vannucci; assists 11; team goals 43; top1 0.26; top3 0.49; top assist Nico Vannucci; top scorer Nico Caputo:16 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00156` | 19 | season 23; S.S. Cesena; Luca Benedetti; assists 11; team goals 43; top1 0.26; top3 0.43; top assist Luca Benedetti; top scorer Timo Hartmann:16 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00157` | 19 | season 28; Real Carpi; Enrico Guerra; assists 11; team goals 45; top1 0.24; top3 0.41; top assist Enrico Guerra; top scorer Giorgio Testa:17 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00115` | 18 | season 21; A.S. Lucca; Matteo Baldi; assists 12; team goals 42; top1 0.29; top3 0.45; top assist Matteo Baldi; top scorer Matteo Schiavone:16 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00154` | 18 | season 23; Real Como; Davide Marchi; assists 11; team goals 44; top1 0.25; top3 0.45; top assist Davide Marchi; top scorer Davide Raimondi:16 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00164` | 18 | season 15; Pro Pescara; Enrico Battaglia; assists 13; team goals 53; top1 0.25; top3 0.46; top assist Enrico Battaglia; top scorer Bram Meijer:17 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00029` | 18 | season 3; U.S. Rome; Matteo Mancini; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Nico Cali; top scorer Davide Longo:21 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00228` | 11 | A.C. Trieste | 66..85 | 45.55 | 7 | transfer=101; squad=2500 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00192` | 10 | A.S. Foggia | 66..82 | 44.70 | 8 | transfer=102; squad=2504 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00128` | 9 | A.C. Trieste | 74..83 | 51.78 | 6 | transfer=103; squad=2494 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00185` | 9 | Ravenna Calcio | 69..86 | 48.78 | 8 | transfer=104; squad=2448 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00110` | 9 | A.S. Trieste | 66..76 | 45.22 | 8 | transfer=104; squad=2496 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00214` | 8 | A.S. Ravenna | 67..83 | 44.63 | 6 | transfer=103; squad=2474 | top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00157` | 8 | A.C. Vicenza | 66..82 | 43.63 | 9 | transfer=102; squad=2469 | goals_per_match_avg, top_assist_max, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00096` | 8 | U.S. Cesena | 62..78 | 41.25 | 6 | transfer=102; squad=2479 | goals_per_match_avg, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00249` | 8 | A.S. Cagliari | 63..84 | 40.63 | 9 | transfer=102; squad=2457 | goals_per_match_avg, champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00204` | 7 | A.S. Perugia | 71..91 | 54.43 | 8 | transfer=108; squad=2524 | champion_streak, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-world-00231` | 37.73 | 25..59 | 60..77 | 18..38 | avg 0.250 max 0.300 | 2.53->3.00 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00065` | 38.53 | 25..54 | 60..78 | 19..37 | avg 0.240 max 0.280 | 2.69->2.74 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00174` | 39.30 | 24..53 | 60..79 | 21..37 | avg 0.250 max 0.300 | 2.36->2.60 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00172` | 39.40 | 29..55 | 59..79 | 23..37 | avg 0.240 max 0.310 | 2.38->2.29 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00200` | 39.47 | 25..55 | 59..80 | 20..37 | avg 0.240 max 0.300 | 2.56->2.53 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00076` | 39.73 | 22..51 | 58..77 | 22..37 | avg 0.240 max 0.270 | 2.33->3.04 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00131` | 39.73 | 26..50 | 59..80 | 21..36 | avg 0.240 max 0.300 | 2.23->2.99 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00122` | 39.87 | 25..61 | 60..85 | 21..35 | avg 0.240 max 0.270 | 2.50->2.78 | champion_streak, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00195` | 39.90 | 24..60 | 55..81 | 13..36 | avg 0.230 max 0.290 | 2.60->2.76 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-world-00087` | 40.07 | 26..56 | 60..80 | 19..34 | avg 0.240 max 0.280 | 2.61->2.32 | wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance --worlds=250 --seasons=30 --checkpoint-dir=<checkpoint-directory> --shards=25 --report-output=reports/phase78-contract-finance-250x30-batched-v2.md
```
