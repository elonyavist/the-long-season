# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase78-contract-finance-concurrency-v3`
Worlds: 10
Seasons per world: 50
Total seasons: 500
Execution: sharded; workers=5; shards=10; resumed=0; partition_hashes=7df3c7fd0d3d792f,71ce01dc83218d5a,db5d97cac5439b0a,cb1fd005e014fdb4,2e3ab9aebed986d7,63ea3c91384acb3b,0015bd86b95418d0,3d99bcfa2c9526c2,b0c665462be29f39,81bb3a91daf5d024
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 10
- Goals per match average: 3.000
- Goals per match p95: 3.050
- Table spread average: 44.12
- Table spread minimum world average: 42.18
- Draw rate average: 0.240
- Draw rate maximum world average: 0.240
- Champion streak max observed: 7
- Top assist max p95: 16
- Production warning max: assists=16 top1=0.30 top3=0.52
- Age 30+ share p95: 0.30
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 516
- Role coverage warnings p95: 56
- Youth roster max observed: 11
- Active player count min/max: senior=395..431 youth=198..198 total=593..629
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 1088210000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4316
- Sampled player value min/max (minor): 24736375..353158792
- Contract lifecycle: renewals=95278; releases=9057; expiries=13554; selected expiry decisions=8230
- Warning check counts: free_agent_population_share=10, wage_budget_utilization=10, goals_per_match_avg=4, senior_active_player_population=4, total_active_player_population=4, top_assist_max=3
- Signal check counts: monitor=22, structural=10, story=3
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase78-contract-finance-concurrency-v3-world-00002` | WARN | 19 | 11 | senior 395..431; youth 198..198; total 593..629 | 0 | 0 | 0 | structural 0; cash 1161180000; wage 1.0000; free agents 0.4316; values 27623830..320917250; renew/release/expiry 9475/877/1390 | 16 | avg 47.40; min 32; max 68; low season 47; champion pts 63..92; last pts 14..35; ability spread 2.88->2.45; draw rate avg/max 0.230/0.270 | season 26; U.S. Perugia; Matteo Venturi; assists 11; team goals 48; top1 0.23; top3 0.44; top assist Matteo Venturi; top scorer Enrico Rosati:19 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00001` | WARN | 20 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | structural 0; cash 1157040000; wage 1.0000; free agents 0.4222; values 27784606..353158792; renew/release/expiry 9567/900/1388 | 15 | avg 44.52; min 24; max 66; low season 6; champion pts 58..90; last pts 16..36; ability spread 2.75->2.67; draw rate avg/max 0.240/0.290 | season 19; U.S. Salerno; Enrico Dalla Costa; assists 11; team goals 48; top1 0.23; top3 0.48; top assist Enrico Dalla Costa; top scorer Luca Dalla Costa:18 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00003` | WARN | 20 | 11 | senior 396..428; youth 198..198; total 594..626 | 0 | 0 | 0 | structural 0; cash 1115620000; wage 1.0000; free agents 0.4191; values 27185243..327870061; renew/release/expiry 9612/919/1356 | 14 | avg 43.96; min 27; max 61; low season 43; champion pts 60..84; last pts 18..34; ability spread 2.29->2.70; draw rate avg/max 0.240/0.310 | season 17; U.S. Mantova; Enrico Carminati; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Enrico Carminati; top scorer Iker Serrano:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00010` | WARN | 18 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 0; cash 1088210000; wage 1.0000; free agents 0.4182; values 27190287..320373535; renew/release/expiry 9501/920/1314 | 14 | avg 43.42; min 24; max 61; low season 22; champion pts 58..86; last pts 19..35; ability spread 2.37->2.89; draw rate avg/max 0.240/0.290 | season 31; Pro Ascoli; Luka Stanic; assists 10; team goals 40; top1 0.25; top3 0.47; top assist Nico Amoroso; top scorer Nico Martino:19 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00008` | WARN | 20 | 11 | senior 396..427; youth 198..198; total 594..625 | 0 | 0 | 0 | structural 0; cash 1101400000; wage 1.0000; free agents 0.4171; values 26409880..332066215; renew/release/expiry 9587/920/1338 | 14 | avg 44.34; min 27; max 66; low season 14; champion pts 59..90; last pts 19..34; ability spread 2.09->2.27; draw rate avg/max 0.240/0.300 | season 46; A.C. Vicenza; Luca Vallini; assists 11; team goals 42; top1 0.26; top3 0.48; top assist Luca Vallini; top scorer Vitor Santos:17 | wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00009` | WARN | 20 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 0; cash 1146850000; wage 1.0000; free agents 0.4165; values 27133539..321544453; renew/release/expiry 9466/913/1361 | 16 | avg 42.18; min 28; max 61; low season 7; champion pts 61..87; last pts 16..37; ability spread 2.62->3.25; draw rate avg/max 0.240/0.310 | season 22; Trento Calcio; Nikola Cvetkovic; assists 13; team goals 43; top1 0.30; top3 0.44; top assist Nikola Cvetkovic; top scorer Can Aydin:25 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00004` | WARN | 21 | 11 | senior 395..415; youth 198..198; total 593..613 | 0 | 0 | 0 | structural 0; cash 1161390000; wage 1.0000; free agents 0.4142; values 27265275..332024290; renew/release/expiry 9512/936/1337 | 15 | avg 43.80; min 31; max 60; low season 38; champion pts 60..81; last pts 20..35; ability spread 2.63->2.23; draw rate avg/max 0.230/0.280 | season 50; A.S. Modena; Nico Zanchi; assists 12; team goals 42; top1 0.29; top3 0.52; top assist Nico Zanchi; top scorer Giorgio Bonanni:15 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00006` | WARN | 19 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | structural 0; cash 1147560000; wage 1.0000; free agents 0.4134; values 24736375..315360979; renew/release/expiry 9541/873/1370 | 16 | avg 42.72; min 29; max 58; low season 29; champion pts 59..83; last pts 13..35; ability spread 2.55->2.29; draw rate avg/max 0.240/0.310 | season 6; A.S. Cagliari; Davide Bruno; assists 11; team goals 41; top1 0.27; top3 0.49; top assist Davide Bruno; top scorer Emilio Sosa:16 | top_assist_max, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00005` | WARN | 20 | 11 | senior 395..422; youth 198..198; total 593..620 | 0 | 0 | 0 | structural 0; cash 1123340000; wage 1.0000; free agents 0.4115; values 27316352..330287132; renew/release/expiry 9524/900/1336 | 14 | avg 45.40; min 31; max 61; low season 33; champion pts 64..89; last pts 22..36; ability spread 2.07->2.59; draw rate avg/max 0.240/0.280 | season 34; F.C. Padova; Davide Albanesi; assists 11; team goals 44; top1 0.25; top3 0.45; top assist Davide Albanesi; top scorer Enrico Magnani:17 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |
| `phase78-contract-finance-concurrency-v3-world-00007` | WARN | 20 | 11 | senior 395..422; youth 198..198; total 593..620 | 0 | 0 | 0 | structural 0; cash 1195780000; wage 1.0000; free agents 0.4113; values 24796824..325088330; renew/release/expiry 9493/899/1364 | 14 | avg 43.42; min 27; max 58; low season 49; champion pts 61..85; last pts 21..35; ability spread 2.88->2.30; draw rate avg/max 0.240/0.280 | season 13; A.S.D. Trento; Enrico Moretti; assists 11; team goals 44; top1 0.25; top3 0.43; top assist Davide Bellandi; top scorer Matteo Ferrari:17 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase78-contract-finance-concurrency-v3-world-00009` | 16 | season 22; Trento Calcio; Nikola Cvetkovic; assists 13; team goals 43; top1 0.30; top3 0.44; top assist Nikola Cvetkovic; top scorer Can Aydin:25 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00006` | 16 | season 6; A.S. Cagliari; Davide Bruno; assists 11; team goals 41; top1 0.27; top3 0.49; top assist Davide Bruno; top scorer Emilio Sosa:16 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00002` | 16 | season 26; U.S. Perugia; Matteo Venturi; assists 11; team goals 48; top1 0.23; top3 0.44; top assist Matteo Venturi; top scorer Enrico Rosati:19 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00004` | 15 | season 50; A.S. Modena; Nico Zanchi; assists 12; team goals 42; top1 0.29; top3 0.52; top assist Nico Zanchi; top scorer Giorgio Bonanni:15 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00001` | 15 | season 19; U.S. Salerno; Enrico Dalla Costa; assists 11; team goals 48; top1 0.23; top3 0.48; top assist Enrico Dalla Costa; top scorer Luca Dalla Costa:18 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00008` | 14 | season 46; A.C. Vicenza; Luca Vallini; assists 11; team goals 42; top1 0.26; top3 0.48; top assist Luca Vallini; top scorer Vitor Santos:17 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00010` | 14 | season 31; Pro Ascoli; Luka Stanic; assists 10; team goals 40; top1 0.25; top3 0.47; top assist Nico Amoroso; top scorer Nico Martino:19 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00005` | 14 | season 34; F.C. Padova; Davide Albanesi; assists 11; team goals 44; top1 0.25; top3 0.45; top assist Davide Albanesi; top scorer Enrico Magnani:17 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00007` | 14 | season 13; A.S.D. Trento; Enrico Moretti; assists 11; team goals 44; top1 0.25; top3 0.43; top assist Davide Bellandi; top scorer Matteo Ferrari:17 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00003` | 14 | season 17; U.S. Mantova; Enrico Carminati; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Enrico Carminati; top scorer Iker Serrano:17 | wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase78-contract-finance-concurrency-v3-world-00006` | 7 | A.S. Pisa | 66..82 | 46.43 | 8 | transfer=180; squad=4391 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00008` | 7 | Pro Cosenza | 65..81 | 43.00 | 7 | transfer=181; squad=4406 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00001` | 6 | A.S. Pisa | 69..89 | 52.67 | 12 | transfer=184; squad=4437 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00003` | 6 | F.C. Perugia | 60..84 | 41.33 | 10 | transfer=187; squad=4402 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00004` | 5 | A.S. Padova | 68..81 | 43.40 | 8 | transfer=178; squad=4400 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00007` | 5 | A.S.D. Catania | 65..78 | 42.60 | 6 | transfer=183; squad=4412 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00009` | 5 | A.C. Parma | 63..74 | 38.40 | 9 | transfer=182; squad=4405 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00005` | 4 | Pro Taranto | 70..76 | 45.50 | 10 | transfer=176; squad=4349 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00010` | 4 | S.S. Matera | 63..73 | 42.25 | 10 | transfer=181; squad=4391 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00002` | 3 | Ascoli Calcio | 81..92 | 61.67 | 9 | transfer=180; squad=4389 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase78-contract-finance-concurrency-v3-world-00009` | 42.18 | 28..61 | 61..87 | 16..37 | avg 0.240 max 0.310 | 2.62->3.25 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00006` | 42.72 | 29..58 | 59..83 | 13..35 | avg 0.240 max 0.310 | 2.55->2.29 | top_assist_max, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00010` | 43.42 | 24..61 | 58..86 | 19..35 | avg 0.240 max 0.290 | 2.37->2.89 | goals_per_match_avg, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00007` | 43.42 | 27..58 | 61..85 | 21..35 | avg 0.240 max 0.280 | 2.88->2.30 | senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00004` | 43.80 | 31..60 | 60..81 | 20..35 | avg 0.230 max 0.280 | 2.63->2.23 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00003` | 43.96 | 27..61 | 60..84 | 18..34 | avg 0.240 max 0.310 | 2.29->2.70 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00008` | 44.34 | 27..66 | 59..90 | 19..34 | avg 0.240 max 0.300 | 2.09->2.27 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00001` | 44.52 | 24..66 | 58..90 | 16..36 | avg 0.240 max 0.290 | 2.75->2.67 | wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00005` | 45.40 | 31..61 | 64..89 | 22..36 | avg 0.240 max 0.280 | 2.07->2.59 | goals_per_match_avg, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase78-contract-finance-concurrency-v3-world-00002` | 47.40 | 32..68 | 63..92 | 14..35 | avg 0.230 max 0.270 | 2.88->2.45 | goals_per_match_avg, top_assist_max, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase78-contract-finance-concurrency-v3 --worlds=10 --seasons=50 --checkpoint-dir=<checkpoint-directory> --shards=10 --report-output=reports/phase78-contract-finance-concurrency-smoke-v3-10x50.md
```
