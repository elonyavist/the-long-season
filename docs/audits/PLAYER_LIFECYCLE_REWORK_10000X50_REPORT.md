# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase75-release`
Worlds: 10000
Seasons per world: 50
Total seasons: 500000
Execution: parallel; workers=10; partition_hashes=c1953b9c3dce59a6,ca7b1084a20768ee,d4a654b168d9b010,77d786075765e457,6f253cfc299b3303,bf6061204d50e6bc,c24838a714111d97,3deb2c094d5843af,c70751adff947be9,37dc0cc779bb9637
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 3280
- Goals per match average: 2.910
- Goals per match p95: 2.980
- Table spread average: 41.71
- Table spread minimum world average: 36.86
- Draw rate average: 0.240
- Draw rate maximum world average: 0.260
- Champion streak max observed: 16
- Top assist max p95: 17
- Production warning max: assists=23 top1=0.40 top3=0.66
- Age 30+ share p95: 0.31
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 7517305
- Role coverage warnings p95: 843
- Youth roster max observed: 11
- Active player count min/max: senior=396..433 youth=198..198 total=594..631
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: top_assist_max=2859, top_creator_goal_share_max=394, goals_per_match_avg=110, champion_streak=99, useful_players_after_long_run=82, role_coverage_warning_count=45, top_three_creator_goal_share_max=14
- Signal check counts: story=2958, monitor=645
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| `phase75-release-world-00006` | WARN | 22 | 11 | senior 399..426; youth 198..198; total 597..624 | 0 | 0 | 0 | 16 | avg 42.94; min 25; max 59; low season 3; champion pts 59..82; last pts 19..36; ability spread 2.44->2.87; draw rate avg/max 0.240/0.300 | season 14; Padova Calcio; Nico Bianco; assists 10; team goals 40; top1 0.25; top3 0.42; top assist Enrico Anselmi; top scorer Javier Herrera:18 | top_assist_max | none |
| `phase75-release-world-00009` | WARN | 22 | 11 | senior 400..424; youth 198..198; total 598..622 | 0 | 0 | 0 | 17 | avg 42.84; min 28; max 60; low season 11; champion pts 63..82; last pts 14..36; ability spread 2.66->3.03; draw rate avg/max 0.230/0.310 | season 5; A.C. Ravenna; Nico Colombo; assists 11; team goals 42; top1 0.26; top3 0.41; top assist Nico Colombo; top scorer Yaya Sarr:14 | top_assist_max | none |
| `phase75-release-world-00011` | WARN | 22 | 11 | senior 397..418; youth 198..198; total 595..616 | 0 | 0 | 0 | 17 | avg 39.94; min 24; max 55; low season 14; champion pts 59..79; last pts 19..36; ability spread 2.45->3.06; draw rate avg/max 0.240/0.290 | season 42; A.C. Cesena; Nico Carbone; assists 17; team goals 69; top1 0.25; top3 0.42; top assist Nico Carbone; top scorer Marko Popovic:19 | top_assist_max | none |
| `phase75-release-world-00012` | WARN | 22 | 11 | senior 398..419; youth 198..198; total 596..617 | 0 | 0 | 0 | 16 | avg 40.58; min 27; max 54; low season 43; champion pts 58..79; last pts 20..36; ability spread 2.66->3.11; draw rate avg/max 0.240/0.310 | season 15; A.S.D. Genoa; Giorgio Zanchi; assists 13; team goals 45; top1 0.29; top3 0.42; top assist Giorgio Zanchi; top scorer Giorgio Piccoli:16 | top_assist_max | none |
| `phase75-release-world-00014` | WARN | 22 | 11 | senior 399..428; youth 198..198; total 597..626 | 0 | 0 | 0 | 19 | avg 41.84; min 24; max 58; low season 12; champion pts 57..87; last pts 13..37; ability spread 2.67->2.83; draw rate avg/max 0.230/0.290 | season 3; Pro Trento; Marcos Molina; assists 11; team goals 46; top1 0.24; top3 0.46; top assist Marcos Molina; top scorer Davide Arena:19 | top_assist_max | none |
| `phase75-release-world-00017` | WARN | 22 | 11 | senior 399..424; youth 198..198; total 597..622 | 0 | 0 | 0 | 17 | avg 41.38; min 28; max 64; low season 7; champion pts 58..84; last pts 12..34; ability spread 2.71->2.54; draw rate avg/max 0.240/0.300 | season 38; Cagliari Calcio; Enrico Marchetti; assists 12; team goals 46; top1 0.26; top3 0.50; top assist Enrico Marchetti; top scorer Mert Yilmaz:14 | top_assist_max | none |
| `phase75-release-world-00018` | WARN | 22 | 11 | senior 400..423; youth 198..198; total 598..621 | 0 | 0 | 0 | 16 | avg 40.10; min 25; max 55; low season 6; champion pts 59..83; last pts 18..36; ability spread 2.67->2.88; draw rate avg/max 0.240/0.320 | season 32; S.S. Naples; Luca Anselmi; assists 16; team goals 61; top1 0.26; top3 0.49; top assist Luca Anselmi; top scorer Luca Bruno:19 | top_assist_max | none |
| `phase75-release-world-00019` | WARN | 22 | 11 | senior 400..424; youth 198..198; total 598..622 | 0 | 0 | 0 | 15 | avg 43.28; min 29; max 56; low season 31; champion pts 59..82; last pts 15..35; ability spread 2.70->2.89; draw rate avg/max 0.240/0.290 | season 4; U.S. Brescia; Giorgio Melis; assists 13; team goals 40; top1 0.33; top3 0.55; top assist Giorgio Melis; top scorer Emir Kaya:16 | top_creator_goal_share_max | none |
| `phase75-release-world-00022` | WARN | 22 | 11 | senior 400..417; youth 198..198; total 598..615 | 0 | 0 | 0 | 16 | avg 44.54; min 31; max 62; low season 4; champion pts 57..85; last pts 21..35; ability spread 2.65->2.50; draw rate avg/max 0.230/0.310 | season 14; S.S. Lucca; Giorgio Fontana; assists 15; team goals 52; top1 0.29; top3 0.40; top assist Giorgio Fontana; top scorer Luca Gandolfi:14 | top_assist_max | none |
| `phase75-release-world-00025` | WARN | 22 | 11 | senior 399..421; youth 198..198; total 597..619 | 0 | 0 | 0 | 16 | avg 42.00; min 23; max 63; low season 7; champion pts 57..85; last pts 18..34; ability spread 2.62->2.67; draw rate avg/max 0.240/0.290 | season 2; S.S. Carpi; Giorgio Vitali; assists 12; team goals 40; top1 0.30; top3 0.55; top assist Ibrahima Diop; top scorer Giorgio Esposito:16 | top_assist_max | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase75-release-world-09800` | 23 | season 22; Virtus Cagliari; Davide Moro; assists 23; team goals 75; top1 0.31; top3 0.43; top assist Davide Moro; top scorer Matteo Farina:20 | top_assist_max, top_creator_goal_share_max |
| `phase75-release-world-05423` | 23 | season 36; A.C. Ravenna; Nico Arena; assists 23; team goals 78; top1 0.29; top3 0.54; top assist Nico Arena; top scorer Giorgio Franchi:19 | top_assist_max |
| `phase75-release-world-05518` | 23 | season 23; A.S. Turin; Nico Damiani; assists 23; team goals 79; top1 0.29; top3 0.44; top assist Nico Damiani; top scorer Dario Kostic:17 | top_assist_max |
| `phase75-release-world-08484` | 23 | season 50; A.S. Como; Luca Righetti; assists 11; team goals 43; top1 0.26; top3 0.51; top assist Enrico Bellini; top scorer Enrico Greco:18 | top_assist_max |
| `phase75-release-world-03184` | 22 | season 34; A.S.D. Pisa; Luca Morandi; assists 22; team goals 55; top1 0.40; top3 0.55; top assist Luca Morandi; top scorer Matteo Sartori:16 | top_assist_max, top_creator_goal_share_max |
| `phase75-release-world-02614` | 22 | season 38; A.S. Taranto; Luca Bocchi; assists 22; team goals 67; top1 0.33; top3 0.49; top assist Luca Bocchi; top scorer Dario Kovac:17 | top_assist_max, top_creator_goal_share_max |
| `phase75-release-world-03461` | 22 | season 17; Terni Calcio; Enrico Bevilacqua; assists 12; team goals 41; top1 0.29; top3 0.44; top assist Enrico Bevilacqua; top scorer Jonas Hartmann:18 | top_assist_max |
| `phase75-release-world-06694` | 22 | season 31; S.S. Ravenna; Nico Zaccaria; assists 22; team goals 80; top1 0.28; top3 0.45; top assist Nico Zaccaria; top scorer Nikola Knezevic:17 | top_assist_max |
| `phase75-release-world-03230` | 22 | season 8; U.S. Padova; Matteo Landi; assists 11; team goals 43; top1 0.26; top3 0.47; top assist Matteo Landi; top scorer Davide Bonacina:14 | top_assist_max |
| `phase75-release-world-05156` | 21 | season 44; A.S. Cosenza; Matteo Bernardi; assists 21; team goals 69; top1 0.30; top3 0.45; top assist Matteo Bernardi; top scorer Giorgio Carli:15 | top_assist_max |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase75-release-world-00771` | 16 | U.S. Cosenza | 65..82 | 47.94 | 12 | transfer=200; squad=2196 | top_assist_max, champion_streak |
| `phase75-release-world-08435` | 15 | Taranto Calcio | 61..78 | 40.53 | 12 | transfer=200; squad=2218 | champion_streak |
| `phase75-release-world-05138` | 14 | Pescara Calcio | 65..82 | 45.93 | 11 | transfer=200; squad=2213 | champion_streak |
| `phase75-release-world-00734` | 13 | U.S. Padova | 65..84 | 48.23 | 12 | transfer=200; squad=2233 | top_assist_max, champion_streak |
| `phase75-release-world-00128` | 13 | S.S. Cosenza | 65..82 | 46.23 | 14 | transfer=200; squad=2239 | top_assist_max, champion_streak |
| `phase75-release-world-09683` | 13 | U.S. Pisa | 64..88 | 44.85 | 12 | transfer=200; squad=2192 | champion_streak |
| `phase75-release-world-04255` | 12 | A.C. Pisa | 67..90 | 48.08 | 10 | transfer=200; squad=2209 | champion_streak |
| `phase75-release-world-01528` | 12 | U.S. Parma | 64..86 | 46.08 | 10 | transfer=200; squad=2220 | champion_streak |
| `phase75-release-world-03308` | 12 | S.S. Pescara | 61..83 | 43.67 | 12 | transfer=200; squad=2193 | top_assist_max, champion_streak |
| `phase75-release-world-02131` | 12 | A.S.D. Siena | 66..82 | 43.42 | 11 | transfer=200; squad=2232 | champion_streak |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase75-release-world-03160` | 36.86 | 24..57 | 59..78 | 20..38 | avg 0.250 max 0.290 | 2.49->2.74 | none |
| `phase75-release-world-06249` | 37.14 | 23..51 | 57..77 | 20..37 | avg 0.250 max 0.310 | 2.79->2.83 | none |
| `phase75-release-world-01633` | 37.46 | 24..51 | 56..74 | 19..35 | avg 0.240 max 0.320 | 2.38->3.03 | top_assist_max |
| `phase75-release-world-07146` | 37.50 | 23..56 | 57..83 | 21..39 | avg 0.240 max 0.310 | 2.47->2.86 | top_assist_max |
| `phase75-release-world-01235` | 37.66 | 24..57 | 58..81 | 18..36 | avg 0.250 max 0.290 | 2.74->3.15 | none |
| `phase75-release-world-05432` | 37.72 | 22..54 | 52..78 | 17..37 | avg 0.240 max 0.300 | 2.27->2.77 | none |
| `phase75-release-world-03005` | 37.72 | 26..57 | 59..75 | 17..37 | avg 0.240 max 0.310 | 2.50->2.59 | top_assist_max |
| `phase75-release-world-05584` | 37.84 | 22..56 | 57..79 | 19..38 | avg 0.250 max 0.300 | 2.49->3.02 | none |
| `phase75-release-world-08662` | 37.90 | 25..54 | 56..75 | 18..37 | avg 0.250 max 0.320 | 2.18->2.61 | none |
| `phase75-release-world-03030` | 37.92 | 24..54 | 55..80 | 19..39 | avg 0.250 max 0.290 | 2.50->2.54 | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase75-release --worlds=10000 --seasons=50 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_10000X50_REPORT.md
```
