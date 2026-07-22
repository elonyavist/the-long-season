# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-dynamic-queue-smoke`
Worlds: 20
Seasons per world: 50
Total seasons: 1000
Execution: sharded; workers=10; shards=4; resumed=0; partition_hashes=739fe8dd76ccc278,e0134012cbc2c972,3ebbd91e90837b41,e4ef1c2a9a5d502d
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 20
- Goals per match average: 2.990
- Goals per match p95: 3.030
- Table spread average: 44.16
- Table spread minimum world average: 41.46
- Draw rate average: 0.240
- Draw rate maximum world average: 0.250
- Champion streak max observed: 8
- Top assist max p95: 18
- Production warning max: assists=18 top1=0.28 top3=0.53
- Age 30+ share p95: 0.30
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 1038
- Role coverage warnings p95: 56
- Youth roster max observed: 11
- Active player count min/max: senior=395..436 youth=198..198 total=593..634
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1090670000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4271
- Sampled player value min/max (minor): 25173129..370386081
- Contract lifecycle: renewals=190592; releases=17978; expiries=27223; selected expiry decisions=16606
- Warning check counts: free_agent_population_share=20, wage_budget_utilization=20, goals_per_match_avg=6, top_assist_max=6, senior_active_player_population=3, total_active_player_population=3
- Signal check counts: monitor=32, structural=20, story=6
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-dynamic-queue-smoke-world-00011` | WARN | 20 | 11 | senior 396..426; youth 198..198; total 594..624 | 0 | 0 | 0 | structural 0; cash 1158100000; wage 1.0000; free agents 0.4271; values 27387553..330746307; renew/release/expiry 9539/891/1375 | 15 | avg 41.46; min 26; max 59; low season 28; champion pts 61..84; last pts 20..36; ability spread 2.57->2.21; draw rate avg/max 0.240/0.280 | season 31; A.S. Foggia; Davide Bortolotti; assists 13; team goals 53; top1 0.25; top3 0.45; top assist Davide Bortolotti; top scorer Matteo Valentini:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00003` | WARN | 21 | 11 | senior 395..432; youth 198..198; total 593..630 | 0 | 0 | 0 | structural 0; cash 1159000000; wage 1.0000; free agents 0.4261; values 25173129..333047614; renew/release/expiry 9528/918/1368 | 15 | avg 45.06; min 26; max 59; low season 7; champion pts 60..84; last pts 16..34; ability spread 2.52->3.51; draw rate avg/max 0.230/0.300 | season 19; Pisa Calcio; Davide Santi; assists 10; team goals 40; top1 0.25; top3 0.47; top assist Davide Santi; top scorer Lautaro Vargas:16 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00017` | WARN | 21 | 11 | senior 396..427; youth 198..198; total 594..625 | 0 | 0 | 0 | structural 0; cash 1110880000; wage 1.0000; free agents 0.4246; values 27841430..329809162; renew/release/expiry 9506/905/1384 | 14 | avg 43.50; min 29; max 55; low season 5; champion pts 62..83; last pts 21..35; ability spread 2.40->3.14; draw rate avg/max 0.230/0.330 | season 33; A.S. Foggia; Nico Schiavone; assists 11; team goals 44; top1 0.25; top3 0.45; top assist Nico Schiavone; top scorer Giorgio Cremonesi:16 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00008` | WARN | 20 | 11 | senior 395..422; youth 198..198; total 593..620 | 0 | 0 | 0 | structural 0; cash 1160300000; wage 1.0000; free agents 0.4233; values 27600375..370386081; renew/release/expiry 9470/905/1356 | 16 | avg 43.88; min 31; max 60; low season 2; champion pts 59..84; last pts 19..35; ability spread 2.76->3.27; draw rate avg/max 0.230/0.320 | season 39; A.C. Carpi; Enrico Basile; assists 14; team goals 52; top1 0.27; top3 0.45; top assist Enrico Basile; top scorer Davide Bosco:18 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00006` | WARN | 19 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | structural 0; cash 1132190000; wage 1.0000; free agents 0.4212; values 27499013..312555547; renew/release/expiry 9569/905/1406 | 16 | avg 45.58; min 28; max 62; low season 5; champion pts 60..89; last pts 19..35; ability spread 2.61->2.83; draw rate avg/max 0.230/0.310 | season 12; F.C. Padova; Giorgio Marchetti; assists 12; team goals 50; top1 0.24; top3 0.44; top assist Giorgio Marchetti; top scorer Giorgio Conte:18 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00010` | WARN | 20 | 11 | senior 396..421; youth 198..198; total 594..619 | 0 | 0 | 0 | structural 0; cash 1130820000; wage 1.0000; free agents 0.4205; values 27236966..318991553; renew/release/expiry 9462/876/1374 | 13 | avg 44.52; min 28; max 62; low season 11; champion pts 59..90; last pts 18..37; ability spread 2.40->2.45; draw rate avg/max 0.240/0.280 | season 26; Virtus Parma; Luca Sassi; assists 10; team goals 43; top1 0.23; top3 0.42; top assist Luca Sassi; top scorer Giorgio Morelli:16 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00013` | WARN | 20 | 11 | senior 396..436; youth 198..198; total 594..634 | 0 | 0 | 0 | structural 0; cash 1135470000; wage 1.0000; free agents 0.4199; values 25539291..329311905; renew/release/expiry 9586/906/1352 | 18 | avg 44.08; min 27; max 65; low season 2; champion pts 59..84; last pts 11..36; ability spread 2.32->2.75; draw rate avg/max 0.250/0.300 | season 36; S.S. Bologna; Matteo Verdi; assists 18; team goals 71; top1 0.25; top3 0.44; top assist Matteo Verdi; top scorer Davide Lucchesi:18 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00018` | WARN | 20 | 11 | senior 396..420; youth 198..198; total 594..618 | 0 | 0 | 0 | structural 0; cash 1173620000; wage 1.0000; free agents 0.4189; values 26751987..314359360; renew/release/expiry 9473/892/1361 | 15 | avg 43.88; min 32; max 66; low season 44; champion pts 62..88; last pts 19..36; ability spread 2.79->2.54; draw rate avg/max 0.240/0.290 | season 33; A.C. Mantova; Matteo Sala; assists 11; team goals 45; top1 0.24; top3 0.39; top assist Matteo Sala; top scorer Giorgio Caldara:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00015` | WARN | 20 | 11 | senior 396..430; youth 198..198; total 594..628 | 0 | 0 | 0 | structural 0; cash 1181830000; wage 1.0000; free agents 0.4184; values 27603233..332638614; renew/release/expiry 9538/880/1368 | 14 | avg 44.00; min 31; max 59; low season 15; champion pts 61..87; last pts 16..36; ability spread 2.46->2.74; draw rate avg/max 0.240/0.300 | season 7; U.S. Catania; Luka Nikolic; assists 11; team goals 42; top1 0.26; top3 0.45; top assist Luka Nikolic; top scorer Ivan Knezevic:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-dynamic-queue-smoke-world-00004` | WARN | 19 | 11 | senior 396..424; youth 198..198; total 594..622 | 0 | 0 | 0 | structural 0; cash 1103150000; wage 1.0000; free agents 0.4182; values 27442026..332162888; renew/release/expiry 9511/904/1361 | 18 | avg 43.52; min 30; max 59; low season 4; champion pts 63..84; last pts 18..35; ability spread 2.15->2.58; draw rate avg/max 0.240/0.300 | season 23; U.S. Palermo; Luca Castelli; assists 11; team goals 45; top1 0.24; top3 0.47; top assist Davide Negri; top scorer Nico Ricci:17 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-dynamic-queue-smoke-world-00013` | 18 | season 36; S.S. Bologna; Matteo Verdi; assists 18; team goals 71; top1 0.25; top3 0.44; top assist Matteo Verdi; top scorer Davide Lucchesi:18 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00004` | 18 | season 23; U.S. Palermo; Luca Castelli; assists 11; team goals 45; top1 0.24; top3 0.47; top assist Davide Negri; top scorer Nico Ricci:17 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00008` | 16 | season 39; A.C. Carpi; Enrico Basile; assists 14; team goals 52; top1 0.27; top3 0.45; top assist Enrico Basile; top scorer Davide Bosco:18 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00020` | 16 | season 33; Florence Calcio; Nico Pellecchia; assists 11; team goals 41; top1 0.27; top3 0.44; top assist Nico Pellecchia; top scorer Tiago Moreira:23 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00006` | 16 | season 12; F.C. Padova; Giorgio Marchetti; assists 12; team goals 50; top1 0.24; top3 0.44; top assist Giorgio Marchetti; top scorer Giorgio Conte:18 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00016` | 16 | season 8; A.C. Brescia; Marko Kovac; assists 10; team goals 42; top1 0.24; top3 0.41; top assist Matteo Castelli; top scorer Nikola Vasic:18 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00007` | 15 | season 18; A.C. Palermo; Lucas Lefevre; assists 11; team goals 40; top1 0.28; top3 0.53; top assist Lucas Lefevre; top scorer Giorgio Costantini:17 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00001` | 15 | season 34; Pro Modena; Jonas Vogel; assists 13; team goals 51; top1 0.25; top3 0.47; top assist Jonas Vogel; top scorer Nico Piccoli:16 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00003` | 15 | season 19; Pisa Calcio; Davide Santi; assists 10; team goals 40; top1 0.25; top3 0.47; top assist Davide Santi; top scorer Lautaro Vargas:16 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00012` | 15 | season 12; Lucca Calcio; Enrico Carli; assists 11; team goals 44; top1 0.25; top3 0.43; top assist Matteo Parisi; top scorer Luca Zorzi:22 | wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-dynamic-queue-smoke-world-00001` | 8 | U.S. Pisa | 66..81 | 47.38 | 9 | transfer=182; squad=4350 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00012` | 8 | S.S. Siena | 70..82 | 45.38 | 10 | transfer=179; squad=4394 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00016` | 7 | Virtus Terni | 67..84 | 45.29 | 8 | transfer=181; squad=4380 | goals_per_match_avg, top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00003` | 6 | Virtus Perugia | 70..76 | 48.67 | 9 | transfer=183; squad=4416 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00006` | 6 | A.C. Modena | 65..88 | 46.33 | 9 | transfer=182; squad=4427 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00009` | 6 | U.S. Ravenna | 65..79 | 45.83 | 7 | transfer=181; squad=4365 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00008` | 6 | A.S.D. Padova | 63..80 | 42.83 | 9 | transfer=180; squad=4400 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00005` | 5 | Pro Cesena | 69..81 | 49.60 | 8 | transfer=185; squad=4406 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00010` | 5 | A.S. Pescara | 71..79 | 45.40 | 8 | transfer=178; squad=4363 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00013` | 5 | S.S. Bologna | 67..78 | 45.00 | 7 | transfer=184; squad=4406 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-dynamic-queue-smoke-world-00011` | 41.46 | 26..59 | 61..84 | 20..36 | avg 0.240 max 0.280 | 2.57->2.21 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00009` | 43.08 | 26..58 | 60..79 | 18..37 | avg 0.240 max 0.310 | 2.45->2.65 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00012` | 43.18 | 30..57 | 62..82 | 20..34 | avg 0.240 max 0.290 | 2.40->3.10 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00007` | 43.46 | 28..59 | 58..85 | 18..37 | avg 0.240 max 0.280 | 2.57->2.97 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00017` | 43.50 | 29..55 | 62..83 | 21..35 | avg 0.230 max 0.330 | 2.40->3.14 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00004` | 43.52 | 30..59 | 63..84 | 18..35 | avg 0.240 max 0.300 | 2.15->2.58 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00008` | 43.88 | 31..60 | 59..84 | 19..35 | avg 0.230 max 0.320 | 2.76->3.27 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00018` | 43.88 | 32..66 | 62..88 | 19..36 | avg 0.240 max 0.290 | 2.79->2.54 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00019` | 43.90 | 21..59 | 56..90 | 23..35 | avg 0.240 max 0.290 | 2.66->2.69 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-dynamic-queue-smoke-world-00015` | 44.00 | 31..59 | 61..87 | 16..36 | avg 0.240 max 0.300 | 2.46->2.74 | wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-dynamic-queue-smoke --worlds=20 --seasons=50 --checkpoint-dir=<checkpoint-directory> --shards=4 --report-output=reports/phase78-contract-finance-dynamic-queue-smoke-20x50.md
```
