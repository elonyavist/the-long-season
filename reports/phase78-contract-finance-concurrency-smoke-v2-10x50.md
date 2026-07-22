# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-concurrency-smoke-v2`
Worlds: 10
Seasons per world: 50
Total seasons: 500
Execution: sharded; workers=10; shards=10; resumed=0; partition_hashes=9288a341455b49aa,f2eb3f88d98aa1dc,685cb8bddbeffcaa,0779cb3dbbeaf8e0,3f3b52997f59c0ea,ad841baf3dab1655,232ee086682bd767,03f10b8919d0c5bf,13acadd1e4b95aa3,2136b570534e4d64
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 10
- Goals per match average: 2.990
- Goals per match p95: 3.070
- Table spread average: 43.99
- Table spread minimum world average: 42.48
- Draw rate average: 0.230
- Draw rate maximum world average: 0.240
- Champion streak max observed: 8
- Top assist max p95: 18
- Production warning max: assists=18 top1=0.29 top3=0.48
- Age 30+ share p95: 0.30
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 508
- Role coverage warnings p95: 55
- Youth roster max observed: 11
- Active player count min/max: senior=395..440 youth=198..198 total=593..638
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1119510000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4277
- Sampled player value min/max (minor): 23409961..351094462
- Contract lifecycle: renewals=95457; releases=9139; expiries=13572; selected expiry decisions=8257
- Warning check counts: free_agent_population_share=10, wage_budget_utilization=10, top_assist_max=4, goals_per_match_avg=3, senior_active_player_population=3, total_active_player_population=3
- Signal check counts: monitor=19, structural=10, story=4
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-concurrency-smoke-v2-world-00001` | WARN | 20 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | structural 0; cash 1171240000; wage 1.0000; free agents 0.4277; values 26808790..313553428; renew/release/expiry 9543/915/1338 | 16 | avg 44.86; min 31; max 61; low season 23; champion pts 65..85; last pts 14..36; ability spread 2.70->2.83; draw rate avg/max 0.230/0.290 | season 22; A.S. Bologna; Matteo Nardini; assists 11; team goals 40; top1 0.28; top3 0.44; top assist Matteo Nardini; top scorer Luca Abate:17 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00007` | WARN | 20 | 11 | senior 396..440; youth 198..198; total 594..638 | 0 | 0 | 0 | structural 0; cash 1147420000; wage 1.0000; free agents 0.4234; values 27354856..326352761; renew/release/expiry 9581/921/1378 | 15 | avg 43.76; min 27; max 60; low season 4; champion pts 59..89; last pts 19..34; ability spread 2.31->2.97; draw rate avg/max 0.240/0.280 | season 42; Pro Cesena; Nuno Moreira; assists 13; team goals 51; top1 0.25; top3 0.43; top assist Nuno Moreira; top scorer Enrico Grassi:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00010` | WARN | 20 | 11 | senior 395..417; youth 198..198; total 593..615 | 0 | 0 | 0 | structural 0; cash 1142700000; wage 1.0000; free agents 0.4223; values 23713733..328426350; renew/release/expiry 9533/902/1402 | 13 | avg 43.38; min 25; max 58; low season 1; champion pts 61..82; last pts 18..36; ability spread 2.27->2.98; draw rate avg/max 0.240/0.310 | season 26; A.C. Modena; Enrico Rosati; assists 12; team goals 51; top1 0.24; top3 0.40; top assist Enrico Rosati; top scorer Enrico Cerri:18 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00009` | WARN | 20 | 11 | senior 396..415; youth 198..198; total 594..613 | 0 | 0 | 0 | structural 0; cash 1121030000; wage 1.0000; free agents 0.4211; values 26312408..310959181; renew/release/expiry 9543/929/1326 | 15 | avg 43.90; min 29; max 62; low season 2; champion pts 64..89; last pts 21..37; ability spread 2.49->2.69; draw rate avg/max 0.240/0.290 | season 30; U.S. Pescara; Giorgio Savini; assists 14; team goals 48; top1 0.29; top3 0.48; top assist Giorgio Savini; top scorer Giorgio Conti:18 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00006` | WARN | 20 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | structural 0; cash 1138180000; wage 1.0000; free agents 0.4182; values 26804025..334225312; renew/release/expiry 9510/896/1353 | 15 | avg 44.00; min 24; max 59; low season 5; champion pts 59..92; last pts 17..35; ability spread 2.81->3.09; draw rate avg/max 0.240/0.300 | season 44; U.S. Cesena; Giorgio Maresca; assists 12; team goals 42; top1 0.29; top3 0.47; top assist Giorgio Maresca; top scorer Davide Accardi:18 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00008` | WARN | 19 | 11 | senior 396..415; youth 198..198; total 594..613 | 0 | 0 | 0 | structural 0; cash 1135900000; wage 1.0000; free agents 0.4171; values 26637961..328476812; renew/release/expiry 9575/893/1376 | 18 | avg 42.48; min 29; max 56; low season 46; champion pts 59..85; last pts 17..36; ability spread 2.60->2.95; draw rate avg/max 0.240/0.290 | season 19; F.C. Terni; Matteo Sassi; assists 10; team goals 41; top1 0.24; top3 0.41; top assist Giorgio Moro; top scorer Nico Cavallaro:21 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00003` | WARN | 20 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | structural 0; cash 1119510000; wage 1.0000; free agents 0.4148; values 24227171..336354805; renew/release/expiry 9517/892/1379 | 15 | avg 43.76; min 31; max 57; low season 6; champion pts 62..81; last pts 17..34; ability spread 2.41->2.71; draw rate avg/max 0.230/0.290 | season 27; Pro Modena; Davide Battaglia; assists 10; team goals 43; top1 0.23; top3 0.42; top assist Giorgio Costa; top scorer Nikola Babic:17 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00004` | WARN | 19 | 11 | senior 395..424; youth 198..198; total 593..622 | 0 | 0 | 0 | structural 0; cash 1172160000; wage 1.0000; free agents 0.4148; values 27490049..351094462; renew/release/expiry 9571/941/1328 | 15 | avg 44.20; min 28; max 64; low season 7; champion pts 60..85; last pts 16..34; ability spread 2.74->2.48; draw rate avg/max 0.230/0.320 | season 8; A.C. Siena; Nico Greco; assists 11; team goals 42; top1 0.26; top3 0.48; top assist Nico Greco; top scorer Luca Righetti:17 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00005` | WARN | 20 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 0; cash 1131050000; wage 1.0000; free agents 0.4095; values 23409961..337364484; renew/release/expiry 9541/908/1364 | 16 | avg 43.74; min 31; max 59; low season 40; champion pts 62..85; last pts 22..35; ability spread 2.41->2.51; draw rate avg/max 0.240/0.290 | season 17; Pescara Calcio; Davide Masi; assists 13; team goals 48; top1 0.27; top3 0.46; top assist Davide Masi; top scorer Nico Di Biase:19 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-smoke-v2-world-00002` | WARN | 20 | 11 | senior 395..416; youth 198..198; total 593..614 | 0 | 0 | 0 | structural 0; cash 1157510000; wage 1.0000; free agents 0.4084; values 28643875..314059263; renew/release/expiry 9543/942/1328 | 17 | avg 45.80; min 32; max 61; low season 37; champion pts 63..85; last pts 18..34; ability spread 2.77->2.60; draw rate avg/max 0.220/0.270 | season 11; F.C. Genoa; Enrico Bartoli; assists 13; team goals 49; top1 0.27; top3 0.47; top assist Enrico Bartoli; top scorer Logan Morgan:24 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-concurrency-smoke-v2-world-00008` | 18 | season 19; F.C. Terni; Matteo Sassi; assists 10; team goals 41; top1 0.24; top3 0.41; top assist Giorgio Moro; top scorer Nico Cavallaro:21 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00002` | 17 | season 11; F.C. Genoa; Enrico Bartoli; assists 13; team goals 49; top1 0.27; top3 0.47; top assist Enrico Bartoli; top scorer Logan Morgan:24 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00001` | 16 | season 22; A.S. Bologna; Matteo Nardini; assists 11; team goals 40; top1 0.28; top3 0.44; top assist Matteo Nardini; top scorer Luca Abate:17 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00005` | 16 | season 17; Pescara Calcio; Davide Masi; assists 13; team goals 48; top1 0.27; top3 0.46; top assist Davide Masi; top scorer Nico Di Biase:19 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00009` | 15 | season 30; U.S. Pescara; Giorgio Savini; assists 14; team goals 48; top1 0.29; top3 0.48; top assist Giorgio Savini; top scorer Giorgio Conti:18 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00006` | 15 | season 44; U.S. Cesena; Giorgio Maresca; assists 12; team goals 42; top1 0.29; top3 0.47; top assist Giorgio Maresca; top scorer Davide Accardi:18 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00004` | 15 | season 8; A.C. Siena; Nico Greco; assists 11; team goals 42; top1 0.26; top3 0.48; top assist Nico Greco; top scorer Luca Righetti:17 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00007` | 15 | season 42; Pro Cesena; Nuno Moreira; assists 13; team goals 51; top1 0.25; top3 0.43; top assist Nuno Moreira; top scorer Enrico Grassi:17 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00003` | 15 | season 27; Pro Modena; Davide Battaglia; assists 10; team goals 43; top1 0.23; top3 0.42; top assist Giorgio Costa; top scorer Nikola Babic:17 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00010` | 13 | season 26; A.C. Modena; Enrico Rosati; assists 12; team goals 51; top1 0.24; top3 0.40; top assist Enrico Rosati; top scorer Enrico Cerri:18 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-concurrency-smoke-v2-world-00005` | 8 | Pro Cagliari | 64..82 | 45.75 | 7 | transfer=180; squad=4404 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00008` | 7 | S.S. Matera | 66..80 | 46.86 | 8 | transfer=182; squad=4405 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00010` | 7 | Carpi Calcio | 63..80 | 42.86 | 10 | transfer=183; squad=4449 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00003` | 7 | Pro Brescia | 62..76 | 41.43 | 9 | transfer=183; squad=4404 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00007` | 6 | Virtus Cosenza | 67..83 | 48.83 | 9 | transfer=180; squad=4451 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00009` | 5 | S.S. Ascoli | 70..89 | 52.20 | 8 | transfer=181; squad=4396 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00006` | 5 | Real Padova | 72..83 | 51.40 | 9 | transfer=185; squad=4379 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00002` | 4 | A.C. Brescia | 66..73 | 47.00 | 8 | transfer=185; squad=4409 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00004` | 4 | F.C. Carpi | 67..81 | 41.50 | 8 | transfer=185; squad=4430 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00001` | 4 | S.S. Cagliari | 65..75 | 36.75 | 8 | transfer=182; squad=4407 | top_assist_max, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-concurrency-smoke-v2-world-00008` | 42.48 | 29..56 | 59..85 | 17..36 | avg 0.240 max 0.290 | 2.60->2.95 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00010` | 43.38 | 25..58 | 61..82 | 18..36 | avg 0.240 max 0.310 | 2.27->2.98 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00005` | 43.74 | 31..59 | 62..85 | 22..35 | avg 0.240 max 0.290 | 2.41->2.51 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00007` | 43.76 | 27..60 | 59..89 | 19..34 | avg 0.240 max 0.280 | 2.31->2.97 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00003` | 43.76 | 31..57 | 62..81 | 17..34 | avg 0.230 max 0.290 | 2.41->2.71 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00009` | 43.90 | 29..62 | 64..89 | 21..37 | avg 0.240 max 0.290 | 2.49->2.69 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00006` | 44.00 | 24..59 | 59..92 | 17..35 | avg 0.240 max 0.300 | 2.81->3.09 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00004` | 44.20 | 28..64 | 60..85 | 16..34 | avg 0.230 max 0.320 | 2.74->2.48 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00001` | 44.86 | 31..61 | 65..85 | 14..36 | avg 0.230 max 0.290 | 2.70->2.83 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-smoke-v2-world-00002` | 45.80 | 32..61 | 63..85 | 18..34 | avg 0.220 max 0.270 | 2.77->2.60 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-concurrency-smoke-v2 --worlds=10 --seasons=50 --checkpoint-dir=<checkpoint-directory> --shards=10 --report-output=reports/phase78-contract-finance-concurrency-smoke-v2-10x50.md
```
