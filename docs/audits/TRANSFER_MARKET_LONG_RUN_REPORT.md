# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-21
Seed prefix: `phase79-market-world-750x50`
Worlds: 750
Seasons per world: 50
Total seasons: 37500
Execution: parallel; workers=10; partition_hashes=d57f7b8904d06002,e929ec595fd3653b,0cea7319d6d678fb,a876d48c20029876,cf95912d330d749b,46b3be7cd127b06e,b240bf41d10c024d,74880c35c5baf998,48bf91f632497e32,1abbd2ad4e68c73f
Status: FAIL

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 748
- Goals per match average: 2.990
- Goals per match p95: 3.040
- Table spread average: 44.58
- Table spread minimum world average: 39.72
- Draw rate average: 0.240
- Draw rate maximum world average: 0.250
- Champion streak max observed: 15
- Top assist max p95: 18
- Production warning max: assists=19 top1=0.41 top3=0.63
- Age 30+ share p95: 0.30
- Minimum squad size observed: 17
- Clubs below minimum squad size: 1
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 38323
- Role coverage warnings p95: 56
- Youth roster max observed: 11
- Active player count min/max: senior=394..442 youth=198..198 total=592..640
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 1
- Club cash floor (minor): 1072670000
- Maximum annual wage utilization: 1.0000
- Maximum free-agent share: 0.4359
- Sampled player value min/max (minor): 19955369..382530004
- Contract lifecycle: renewals=7183430; releases=673977; expiries=1035265; selected expiry decisions=616144
- Warning check counts: free_agent_population_share=750, transfer_turnover_available=750, wage_budget_utilization=750, top_assist_max=334, goals_per_match_avg=242, senior_active_player_population=112, total_active_player_population=112, champion_streak=56, top_creator_goal_share_max=16, top_three_creator_goal_share_max=1
- Signal check counts: monitor=1983, structural=750, story=390
- Failing check counts: clubs_below_minimum_squad_size=1, contract_finance_structural_integrity=1, top_creator_goal_share_max=1
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase79-market-world-750x50-world-00311` | FAIL | 17 | 11 | senior 396..413; youth 198..198; total 594..611 | 1 | 0 | 0 | structural 1; cash 1131450000; wage 1.0000; free agents 0.4121; values 25455417..317064471; renew/release/expiry 9654/924/1369 | 16 | avg 47.12; min 33; max 63; low season 1; champion pts 62..90; last pts 19..36; ability spread 3.02->2.89; draw rate avg/max 0.230/0.290 | season 27; A.C. Cosenza; Enrico Bartoli; assists 12; team goals 44; top1 0.27; top3 0.48; top assist Enrico Bartoli; top scorer Nico Amato:16 | goals_per_match_avg, top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share | clubs_below_minimum_squad_size, contract_finance_structural_integrity |
| `phase79-market-world-750x50-world-00486` | FAIL | 20 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 0; cash 1104440000; wage 1.0000; free agents 0.4211; values 26875319..312796716; renew/release/expiry 9596/901/1386 | 17 | avg 46.08; min 29; max 64; low season 32; champion pts 59..89; last pts 16..34; ability spread 2.48->2.43; draw rate avg/max 0.240/0.290 | season 12; Virtus Lecco; Enrico Vitali; assists 17; team goals 41; top1 0.41; top3 0.63; top assist Enrico Vitali; top scorer Milan Djuric:17 | top_assist_max, top_three_creator_goal_share_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share | top_creator_goal_share_max |
| `phase79-market-world-750x50-world-00420` | WARN | 21 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 0; cash 1108450000; wage 1.0000; free agents 0.4359; values 24893404..330062795; renew/release/expiry 9614/911/1366 | 16 | avg 46.62; min 31; max 66; low season 1; champion pts 58..90; last pts 20..34; ability spread 2.61->2.35; draw rate avg/max 0.240/0.310 | season 25; A.S.D. Lecco; Luca Villa; assists 14; team goals 46; top1 0.30; top3 0.46; top assist Luca Villa; top scorer Davide Carnevali:18 | goals_per_match_avg, top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00536` | WARN | 19 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | structural 0; cash 1097080000; wage 1.0000; free agents 0.4343; values 27542320..328881076; renew/release/expiry 9555/873/1374 | 14 | avg 42.60; min 26; max 58; low season 49; champion pts 58..90; last pts 18..37; ability spread 2.66->2.98; draw rate avg/max 0.240/0.300 | season 9; U.S. Cagliari; Luca Neri; assists 11; team goals 42; top1 0.26; top3 0.50; top assist Giorgio Leoni; top scorer Matteo Cattaneo:20 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00176` | WARN | 20 | 11 | senior 396..430; youth 198..198; total 594..628 | 0 | 0 | 0 | structural 0; cash 1152640000; wage 1.0000; free agents 0.4343; values 27699892..328526319; renew/release/expiry 9525/884/1401 | 15 | avg 43.58; min 21; max 64; low season 49; champion pts 58..85; last pts 12..37; ability spread 2.48->3.06; draw rate avg/max 0.240/0.310 | season 48; Virtus Cesena; Emilio Rojas; assists 11; team goals 45; top1 0.24; top3 0.42; top assist Emilio Rojas; top scorer Giorgio Masi:13 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00199` | WARN | 20 | 11 | senior 396..424; youth 198..198; total 594..622 | 0 | 0 | 0 | structural 0; cash 1098360000; wage 1.0000; free agents 0.4339; values 27980000..330405903; renew/release/expiry 9555/880/1413 | 16 | avg 44.92; min 27; max 60; low season 40; champion pts 62..89; last pts 17..37; ability spread 1.96->3.21; draw rate avg/max 0.230/0.280 | season 4; S.S. Ascoli; Enrico Basiletti; assists 12; team goals 48; top1 0.25; top3 0.42; top assist Enrico Basiletti; top scorer Luca De Luca:16 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00458` | WARN | 20 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | structural 0; cash 1112830000; wage 1.0000; free agents 0.4335; values 28124541..324996922; renew/release/expiry 9544/890/1404 | 15 | avg 45.12; min 29; max 61; low season 3; champion pts 59..87; last pts 20..34; ability spread 2.97->2.39; draw rate avg/max 0.230/0.310 | season 45; Real Como; Jakub Malik; assists 13; team goals 51; top1 0.25; top3 0.47; top assist Jakub Malik; top scorer Davide Falco:15 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00194` | WARN | 21 | 11 | senior 396..430; youth 198..198; total 594..628 | 0 | 0 | 0 | structural 0; cash 1146430000; wage 1.0000; free agents 0.4333; values 26150765..332308651; renew/release/expiry 9576/906/1374 | 15 | avg 45.22; min 31; max 67; low season 4; champion pts 62..84; last pts 13..35; ability spread 2.85->3.05; draw rate avg/max 0.240/0.290 | season 42; A.S.D. Rimini; Adrien Garnier; assists 12; team goals 46; top1 0.26; top3 0.46; top assist Adrien Garnier; top scorer Mert Kaya:23 | goals_per_match_avg, transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00497` | WARN | 20 | 11 | senior 396..434; youth 198..198; total 594..632 | 0 | 0 | 0 | structural 0; cash 1113220000; wage 1.0000; free agents 0.4323; values 27069413..312316231; renew/release/expiry 9605/923/1396 | 15 | avg 44.22; min 28; max 70; low season 6; champion pts 60..91; last pts 19..34; ability spread 1.99->2.48; draw rate avg/max 0.240/0.300 | season 37; A.S.D. Arezzo; Luca Perini; assists 10; team goals 40; top1 0.25; top3 0.47; top assist Kamil Malik; top scorer Luca Ricciardi:23 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |
| `phase79-market-world-750x50-world-00273` | WARN | 20 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | structural 0; cash 1166400000; wage 1.0000; free agents 0.4321; values 25323653..323130657; renew/release/expiry 9492/899/1385 | 16 | avg 45.32; min 33; max 65; low season 21; champion pts 64..87; last pts 19..36; ability spread 2.94->3.25; draw rate avg/max 0.240/0.280 | season 39; A.S. Matera; Tomas Rojas; assists 10; team goals 44; top1 0.23; top3 0.39; top assist Nico Zambelli; top scorer Tiago Matos:17 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase79-market-world-750x50-world-00692` | 19 | season 26; Perugia Calcio; Luca Gori; assists 13; team goals 44; top1 0.30; top3 0.48; top assist Luca Gori; top scorer Davide Rossi:18 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00713` | 19 | season 21; U.S. Rome; Dario Kostic; assists 12; team goals 42; top1 0.29; top3 0.45; top assist Dario Kostic; top scorer Giorgio Russo:19 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00246` | 19 | season 19; Virtus Trieste; Nico Spinelli; assists 12; team goals 44; top1 0.27; top3 0.41; top assist Nico Spinelli; top scorer Giorgio Silvestri:14 | goals_per_match_avg, top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00744` | 19 | season 43; A.S. Perugia; Harry Bennett; assists 12; team goals 46; top1 0.26; top3 0.43; top assist Harry Bennett; top scorer Mateo Acosta:18 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00525` | 19 | season 39; Pro Modena; Enrico Abate; assists 11; team goals 43; top1 0.26; top3 0.49; top assist Enrico Abate; top scorer Davide Anselmi:16 | top_assist_max, champion_streak, transfer_turnover_available, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00370` | 19 | season 19; S.S. Trento; Giorgio Capelli; assists 12; team goals 48; top1 0.25; top3 0.44; top assist Enrico Guidi; top scorer Enrico Accardi:17 | goals_per_match_avg, top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00237` | 19 | season 22; Pro Pescara; Giorgio Carnevali; assists 11; team goals 44; top1 0.25; top3 0.43; top assist Giorgio Carnevali; top scorer Nico Bellandi:16 | goals_per_match_avg, top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00381` | 19 | season 17; Virtus Brescia; Marko Pavlovic; assists 11; team goals 44; top1 0.25; top3 0.41; top assist Marko Pavlovic; top scorer Enrico Mancuso:20 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00285` | 19 | season 21; Virtus Terni; Nico Dalla Costa; assists 10; team goals 41; top1 0.24; top3 0.54; top assist Davide Fiorini; top scorer Davide Palmieri:18 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00473` | 19 | season 30; A.S.D. Matera; Matteo Angelini; assists 10; team goals 41; top1 0.24; top3 0.40; top assist Luca Zanetti; top scorer Marcos Herrera:13 | goals_per_match_avg, top_assist_max, transfer_turnover_available, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase79-market-world-750x50-world-00560` | 15 | S.S. Matera | 65..89 | 51.00 | 7 | transfer=0; squad=4224 | champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00554` | 15 | A.S. Florence | 69..82 | 48.73 | 10 | transfer=0; squad=4205 | goals_per_match_avg, top_assist_max, champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00131` | 14 | Virtus Siena | 63..85 | 46.71 | 9 | transfer=0; squad=4309 | champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00325` | 14 | F.C. Bologna | 65..81 | 44.36 | 11 | transfer=0; squad=4212 | champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00578` | 12 | Perugia Calcio | 70..93 | 50.83 | 6 | transfer=0; squad=4219 | goals_per_match_avg, top_assist_max, champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00062` | 12 | Perugia Calcio | 57..85 | 47.25 | 10 | transfer=0; squad=4202 | goals_per_match_avg, champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00481` | 12 | Taranto Calcio | 64..87 | 46.33 | 9 | transfer=0; squad=4286 | champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00257` | 12 | U.S. Catania | 62..79 | 41.25 | 8 | transfer=0; squad=4230 | champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00282` | 12 | A.S.D. Parma | 63..78 | 40.25 | 8 | transfer=0; squad=4241 | top_assist_max, champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00344` | 11 | S.S. Rimini | 67..90 | 51.09 | 7 | transfer=0; squad=4244 | champion_streak, transfer_turnover_available, senior_active_player_population, total_active_player_population, wage_budget_utilization, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase79-market-world-750x50-world-00111` | 39.72 | 28..55 | 58..81 | 21..36 | avg 0.240 max 0.310 | 2.65->2.89 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00454` | 40.22 | 25..55 | 59..84 | 19..37 | avg 0.240 max 0.310 | 2.30->2.68 | top_assist_max, champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00657` | 40.30 | 26..55 | 57..84 | 22..36 | avg 0.250 max 0.310 | 2.24->2.72 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00662` | 40.56 | 22..61 | 59..88 | 21..37 | avg 0.240 max 0.290 | 2.51->2.41 | top_assist_max, champion_streak, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00211` | 40.68 | 25..59 | 60..80 | 20..35 | avg 0.240 max 0.310 | 2.64->2.54 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00658` | 41.00 | 28..54 | 60..85 | 18..38 | avg 0.240 max 0.280 | 2.55->2.37 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00516` | 41.12 | 29..56 | 61..82 | 19..36 | avg 0.250 max 0.300 | 2.44->2.70 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00373` | 41.18 | 25..58 | 59..89 | 17..36 | avg 0.240 max 0.300 | 2.36->2.90 | top_assist_max, transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00008` | 41.20 | 24..56 | 60..82 | 19..37 | avg 0.240 max 0.290 | 2.20->2.99 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |
| `phase79-market-world-750x50-world-00015` | 41.22 | 25..54 | 57..82 | 20..35 | avg 0.240 max 0.300 | 2.58->2.99 | transfer_turnover_available, wage_budget_utilization, free_agent_population_share |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase79-market-world-750x50 --worlds=750 --seasons=50 --report-output=docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md
```
