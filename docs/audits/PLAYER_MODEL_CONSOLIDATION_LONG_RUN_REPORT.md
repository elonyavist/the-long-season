# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase74-player-model`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Status: FAIL

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 52
- Goals per match average: 2.750
- Goals per match p95: 2.800
- Table spread average: 38.64
- Table spread minimum world average: 34.53
- Draw rate average: 0.250
- Draw rate maximum world average: 0.260
- Champion streak max observed: 11
- Top assist max p95: 16
- Production warning max: assists=18 top1=0.41 top3=0.60
- Age 30+ share p95: 0.28
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 47268
- Role coverage warnings p95: 217
- Youth roster max observed: 11
- Active player count min/max: senior=396..450 youth=198..198 total=594..648
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: top_creator_goal_share_max=35, top_assist_max=16, table_points_spread_avg=5, champion_streak=3
- Signal check counts: monitor=35, story=24
- Failing check counts: champion_streak=1, top_creator_goal_share_max=1
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| `phase74-player-model-world-00009` | FAIL | 20 | 11 | senior 396..444; youth 198..198; total 594..642 | 0 | 0 | 0 | 14 | avg 37.10; min 28; max 58; low season 5; champion pts 58..84; last pts 19..39; ability spread 2.74->2.32; draw rate avg/max 0.250/0.300 | season 30; U.S. Brescia; Vitor Moraes; assists 7; team goals 17; top1 0.41; top3 0.38; top assist Mert Aydin; top scorer Nico Di Biase:16 | none | top_creator_goal_share_max |
| `phase74-player-model-world-00233` | FAIL | 20 | 11 | senior 396..448; youth 198..198; total 594..646 | 0 | 0 | 0 | 18 | avg 40.80; min 30; max 58; low season 19; champion pts 56..80; last pts 19..36; ability spread 3.76->2.06; draw rate avg/max 0.260/0.310 | season 26; F.C. Ravenna; Enrico Lombardini; assists 8; team goals 27; top1 0.30; top3 0.42; top assist Enrico Lombardini; top scorer Nico Gallo:15 | top_assist_max | champion_streak |
| `phase74-player-model-world-00004` | WARN | 21 | 11 | senior 396..448; youth 198..198; total 594..646 | 0 | 0 | 0 | 12 | avg 39.57; min 30; max 53; low season 20; champion pts 61..76; last pts 16..33; ability spread 2.62->2.03; draw rate avg/max 0.250/0.300 | season 15; Virtus Lucca; Giorgio Bortolotti; assists 9; team goals 28; top1 0.32; top3 0.41; top assist Luca Verdi; top scorer Davide Vitale:12 | top_creator_goal_share_max | none |
| `phase74-player-model-world-00005` | WARN | 20 | 11 | senior 396..446; youth 198..198; total 594..644 | 0 | 0 | 0 | 13 | avg 37.93; min 25; max 50; low season 18; champion pts 59..76; last pts 17..37; ability spread 2.69->2.02; draw rate avg/max 0.250/0.300 | season 27; A.C. Cagliari; Luka Knezevic; assists 8; team goals 24; top1 0.33; top3 0.41; top assist Nico Carnevali; top scorer Luca Corsi:16 | top_creator_goal_share_max | none |
| `phase74-player-model-world-00024` | WARN | 20 | 11 | senior 396..446; youth 198..198; total 594..644 | 0 | 0 | 0 | 14 | avg 36.40; min 24; max 51; low season 18; champion pts 58..79; last pts 24..36; ability spread 2.88->1.83; draw rate avg/max 0.250/0.300 | season 23; S.S. Parma; Kerem Kaya; assists 12; team goals 39; top1 0.31; top3 0.41; top assist Kerem Kaya; top scorer Giorgio Parisi:14 | top_creator_goal_share_max | none |
| `phase74-player-model-world-00026` | WARN | 20 | 11 | senior 396..446; youth 198..198; total 594..644 | 0 | 0 | 0 | 16 | avg 39.03; min 25; max 49; low season 14; champion pts 59..72; last pts 18..35; ability spread 2.92->2.08; draw rate avg/max 0.250/0.300 | season 17; S.S. Trieste; Giorgio Gallo; assists 9; team goals 29; top1 0.31; top3 0.43; top assist Giorgio Conti; top scorer Giorgio Calvi:16 | top_assist_max, top_creator_goal_share_max | none |
| `phase74-player-model-world-00034` | WARN | 19 | 11 | senior 396..449; youth 198..198; total 594..647 | 0 | 0 | 0 | 12 | avg 39.90; min 24; max 58; low season 13; champion pts 58..78; last pts 15..36; ability spread 2.91->1.85; draw rate avg/max 0.250/0.290 | season 20; A.C. Foggia; Giorgio Rinaldi; assists 12; team goals 37; top1 0.32; top3 0.41; top assist Giorgio Rinaldi; top scorer Nico Pugliese:15 | top_creator_goal_share_max | none |
| `phase74-player-model-world-00036` | WARN | 20 | 11 | senior 396..443; youth 198..198; total 594..641 | 0 | 0 | 0 | 13 | avg 37.73; min 29; max 51; low season 6; champion pts 60..75; last pts 21..33; ability spread 3.00->1.66; draw rate avg/max 0.250/0.290 | season 25; Pro Pescara; Nico Pagani; assists 9; team goals 29; top1 0.31; top3 0.44; top assist Giorgio Fiore; top scorer Enrico Villa:16 | top_creator_goal_share_max | none |
| `phase74-player-model-world-00039` | WARN | 20 | 11 | senior 396..447; youth 198..198; total 594..645 | 0 | 0 | 0 | 13 | avg 40.97; min 27; max 59; low season 19; champion pts 58..78; last pts 16..35; ability spread 3.32->2.12; draw rate avg/max 0.250/0.300 | season 25; U.S. Brescia; Nico Carlini; assists 13; team goals 44; top1 0.30; top3 0.52; top assist Nico Carlini; top scorer Enrico Palumbo:16 | champion_streak | none |
| `phase74-player-model-world-00043` | WARN | 20 | 11 | senior 396..446; youth 198..198; total 594..644 | 0 | 0 | 0 | 15 | avg 36.73; min 25; max 55; low season 23; champion pts 59..77; last pts 18..38; ability spread 2.52->1.82; draw rate avg/max 0.250/0.310 | season 12; F.C. Foggia; Matteo Spinelli; assists 15; team goals 46; top1 0.33; top3 0.54; top assist Matteo Spinelli; top scorer Ivan Knezevic:17 | top_creator_goal_share_max | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase74-player-model-world-00233` | 18 | season 26; F.C. Ravenna; Enrico Lombardini; assists 8; team goals 27; top1 0.30; top3 0.42; top assist Enrico Lombardini; top scorer Nico Gallo:15 | top_assist_max |
| `phase74-player-model-world-00153` | 18 | season 12; Pro Pescara; Davide Tosi; assists 13; team goals 50; top1 0.26; top3 0.50; top assist Davide Tosi; top scorer Marko Zoric:18 | top_assist_max |
| `phase74-player-model-world-00162` | 17 | season 28; Virtus Catania; Nico Marchetti; assists 17; team goals 57; top1 0.30; top3 0.49; top assist Nico Marchetti; top scorer Nico Carnevali:14 | top_assist_max |
| `phase74-player-model-world-00117` | 17 | season 14; A.S. Pisa; Luca Bernardi; assists 14; team goals 48; top1 0.29; top3 0.46; top assist Luca Bernardi; top scorer Enrico Fontana:16 | top_assist_max |
| `phase74-player-model-world-00099` | 17 | season 23; U.S. Siena; Nico Guidi; assists 4; team goals 14; top1 0.29; top3 0.48; top assist Nico Cavallaro; top scorer Matteo Carbone:16 | top_assist_max |
| `phase74-player-model-world-00204` | 17 | season 4; A.S. Catania; Matteo Vallini; assists 11; team goals 39; top1 0.28; top3 0.44; top assist Matteo Vallini; top scorer Giorgio Magnani:15 | top_assist_max |
| `phase74-player-model-world-00234` | 17 | season 8; S.S. Cesena; Nico Angelini; assists 9; team goals 32; top1 0.28; top3 0.44; top assist Nico Cambi; top scorer Matteo Parisi:19 | top_assist_max |
| `phase74-player-model-world-00205` | 17 | season 4; Virtus Carpi; Davide Pellegrino; assists 17; team goals 69; top1 0.25; top3 0.45; top assist Davide Pellegrino; top scorer Miguel Ferreira:17 | top_assist_max |
| `phase74-player-model-world-00240` | 16 | season 9; Real Palermo; Enrico Ferrini; assists 16; team goals 48; top1 0.33; top3 0.48; top assist Enrico Ferrini; top scorer Marvin Bergmann:19 | top_assist_max, top_creator_goal_share_max |
| `phase74-player-model-world-00147` | 16 | season 28; F.C. Rome; Luca D'Amico; assists 16; team goals 50; top1 0.32; top3 0.50; top assist Luca D'Amico; top scorer Giorgio Magnani:19 | top_assist_max, top_creator_goal_share_max |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase74-player-model-world-00233` | 11 | F.C. Ravenna | 63..80 | 45.55 | 11 | transfer=120; squad=1206 | top_assist_max |
| `phase74-player-model-world-00039` | 6 | Pisa Calcio | 67..77 | 44.00 | 10 | transfer=120; squad=1180 | champion_streak |
| `phase74-player-model-world-00173` | 6 | A.S.D. Foggia | 65..78 | 43.33 | 10 | transfer=120; squad=1196 | top_assist_max, champion_streak |
| `phase74-player-model-world-00085` | 6 | A.C. Catania | 59..70 | 36.33 | 11 | transfer=120; squad=1184 | champion_streak |
| `phase74-player-model-world-00005` | 5 | Padova Calcio | 67..76 | 44.20 | 10 | transfer=120; squad=1201 | top_creator_goal_share_max |
| `phase74-player-model-world-00105` | 5 | Pro Rimini | 60..76 | 44.20 | 11 | transfer=120; squad=1205 | none |
| `phase74-player-model-world-00032` | 5 | Taranto Calcio | 61..78 | 42.60 | 12 | transfer=120; squad=1204 | none |
| `phase74-player-model-world-00170` | 5 | Pro Ascoli | 63..73 | 42.00 | 11 | transfer=120; squad=1184 | none |
| `phase74-player-model-world-00014` | 5 | F.C. Ascoli | 62..74 | 41.80 | 11 | transfer=120; squad=1199 | none |
| `phase74-player-model-world-00180` | 5 | A.S. Cesena | 65..72 | 40.80 | 13 | transfer=120; squad=1172 | none |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase74-player-model-world-00186` | 34.53 | 22..52 | 57..75 | 20..37 | avg 0.250 max 0.290 | 2.61->2.01 | table_points_spread_avg |
| `phase74-player-model-world-00149` | 35.47 | 20..51 | 57..76 | 20..38 | avg 0.250 max 0.310 | 2.73->2.25 | table_points_spread_avg, top_creator_goal_share_max |
| `phase74-player-model-world-00206` | 35.50 | 25..49 | 58..76 | 17..36 | avg 0.250 max 0.310 | 2.69->2.02 | table_points_spread_avg |
| `phase74-player-model-world-00086` | 35.77 | 25..47 | 57..77 | 21..36 | avg 0.250 max 0.290 | 2.76->1.94 | table_points_spread_avg |
| `phase74-player-model-world-00250` | 35.80 | 21..48 | 54..73 | 17..36 | avg 0.250 max 0.290 | 2.83->2.26 | table_points_spread_avg, top_creator_goal_share_max |
| `phase74-player-model-world-00175` | 36.10 | 25..53 | 56..72 | 18..35 | avg 0.250 max 0.300 | 2.85->2.01 | none |
| `phase74-player-model-world-00201` | 36.13 | 25..48 | 56..76 | 20..36 | avg 0.250 max 0.310 | 3.06->1.95 | none |
| `phase74-player-model-world-00221` | 36.33 | 22..47 | 57..74 | 21..35 | avg 0.250 max 0.330 | 2.51->1.93 | none |
| `phase74-player-model-world-00117` | 36.33 | 25..56 | 58..72 | 16..34 | avg 0.250 max 0.320 | 2.62->2.14 | top_assist_max |
| `phase74-player-model-world-00024` | 36.40 | 24..51 | 58..79 | 24..36 | avg 0.250 max 0.300 | 2.88->1.83 | top_creator_goal_share_max |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_MODEL_CONSOLIDATION_LONG_RUN_REPORT.md
```
