# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase75-diagnostic`
Worlds: 50
Seasons per world: 10
Total seasons: 500
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 23
- Goals per match average: 2.770
- Goals per match p95: 2.870
- Table spread average: 37.80
- Table spread minimum world average: 33.10
- Draw rate average: 0.250
- Draw rate maximum world average: 0.260
- Champion streak max observed: 4
- Top assist max p95: 15
- Production warning max: assists=15 top1=0.33 top3=0.48
- Age 30+ share p95: 0.37
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 7824
- Role coverage warnings p95: 165
- Youth roster max observed: 11
- Active player count min/max: senior=396..426 youth=198..198 total=594..624
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: table_points_spread_avg=12, useful_players_after_long_run=6, top_creator_goal_share_max=5, champion_streak=3
- Signal check counts: story=15, monitor=11
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Phase 75 Calibration Classification

The diagnostic cohort is accepted without gameplay tuning because it has no
structural failures: every club keeps at least `19` senior players, no club loses
natural goalkeeper coverage, every academy remains exactly at the `11` player
target, and the active-player population stays inside the current beta model.

Warning classification:

- `table_points_spread_avg`: accepted as short-run league compression. The worst
  `50 x 10` world averages `33.10` points of spread, still above the hard fail
  floor of `30` and not paired with draw-rate or squad-structure collapse.
- `top_creator_goal_share_max`: accepted as story variance. The highest single
  creator share is `0.33`, below the fail threshold of `>0.40`, and appears on
  plausible low-scoring or creator-led club seasons.
- `champion_streak`: accepted as dynasty story variance. The maximum observed
  streak is `4`, below the ten-season fail threshold of `>=8`.
- `useful_players_after_long_run`: accepted as a monitor signal. The cohort has
  no senior overpopulation, no youth overpopulation, and no missing goalkeeper
  signal, so the warning does not represent roster collapse.

Locked thresholds before Step 15:

- goals per match: fail `<2.0` or `>3.2`; warn outside `2.3..3.0`;
- table points spread: fail `<30` or `>70`; warn outside `36..60`;
- top assists: pass `<=15`; warn `16..20`; fail `>=21` for ten-season runs;
- top creator share: pass `<=0.30`; warn `>0.30`; fail `>0.40`;
- top-three creator share: pass `<=0.60`; warn `>0.60`; fail `>0.75`;
- champion streak: warn from `4`; fail from `8` for ten-season runs;
- useful original players after long run: pass `<=8`; warn `9..16`; fail `>16`;
- age 30+ share: pass `<=0.45`; warn `>0.45`; fail `>0.60`;
- minimum senior squad: fail if any club falls below the squad-size gate;
- natural goalkeeper coverage: fail if any club has no natural goalkeeper;
- youth roster: pass exactly `11`; fail above or below the target;
- active population: seniors `396..450`, youth `198..198`, total `594..648`.

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| `phase75-diagnostic-world-00001` | WARN | 19 | 11 | senior 396..419; youth 198..198; total 594..617 | 0 | 0 | 0 | 12 | avg 35.70; min 26; max 48; low season 2; champion pts 58..74; last pts 25..34; ability spread 2.64->1.78; draw rate avg/max 0.240/0.270 | season 8; A.C. Pescara; Nico Martino; assists 11; team goals 36; top1 0.31; top3 0.38; top assist Matteo Fiorini; top scorer Luca Vitali:17 | table_points_spread_avg, top_creator_goal_share_max | none |
| `phase75-diagnostic-world-00004` | WARN | 20 | 11 | senior 396..417; youth 198..198; total 594..615 | 0 | 0 | 0 | 13 | avg 36.00; min 25; max 47; low season 7; champion pts 58..68; last pts 20..36; ability spread 2.26->2.48; draw rate avg/max 0.250/0.290 | season 2; A.C. Trieste; Lukas Hartmann; assists 13; team goals 41; top1 0.32; top3 0.44; top assist Lukas Hartmann; top scorer Lautaro Rojas:15 | top_creator_goal_share_max | none |
| `phase75-diagnostic-world-00005` | WARN | 20 | 11 | senior 396..418; youth 198..198; total 594..616 | 0 | 0 | 0 | 12 | avg 35.70; min 29; max 43; low season 6; champion pts 61..71; last pts 25..34; ability spread 2.49->1.78; draw rate avg/max 0.250/0.280 | season 8; U.S. Parma; Nikola Bozic; assists 7; team goals 31; top1 0.23; top3 0.38; top assist Davide Baldi; top scorer Luca Cavallaro:16 | table_points_spread_avg | none |
| `phase75-diagnostic-world-00007` | WARN | 20 | 11 | senior 396..421; youth 198..198; total 594..619 | 0 | 0 | 0 | 11 | avg 33.30; min 20; max 39; low season 9; champion pts 58..72; last pts 26..38; ability spread 2.55->1.90; draw rate avg/max 0.250/0.280 | season 10; Perugia Calcio; Nico Moretti; assists 9; team goals 38; top1 0.24; top3 0.39; top assist Iker Delgado; top scorer Nuno Cardoso:18 | table_points_spread_avg | none |
| `phase75-diagnostic-world-00008` | WARN | 20 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | 11 | avg 35.80; min 29; max 45; low season 5; champion pts 58..71; last pts 19..32; ability spread 2.69->1.84; draw rate avg/max 0.250/0.280 | season 7; Virtus Trieste; Matteo Villa; assists 9; team goals 34; top1 0.26; top3 0.43; top assist Enrico Tarantino; top scorer Matteo Schiavone:17 | table_points_spread_avg | none |
| `phase75-diagnostic-world-00010` | WARN | 21 | 11 | senior 396..421; youth 198..198; total 594..619 | 0 | 0 | 0 | 11 | avg 38.80; min 31; max 51; low season 3; champion pts 61..72; last pts 21..35; ability spread 2.68->1.84; draw rate avg/max 0.260/0.280 | season 4; S.S. Pescara; Matteo Cremonesi; assists 10; team goals 43; top1 0.23; top3 0.47; top assist Matteo Cremonesi; top scorer Nico Gatti:13 | useful_players_after_long_run | none |
| `phase75-diagnostic-world-00013` | WARN | 20 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | 14 | avg 40.90; min 33; max 52; low season 3; champion pts 61..72; last pts 19..32; ability spread 2.87->1.84; draw rate avg/max 0.250/0.290 | season 2; U.S. Cosenza; Giorgio Gagliardi; assists 10; team goals 37; top1 0.27; top3 0.41; top assist Giorgio Gagliardi; top scorer Enrico Canini:16 | champion_streak | none |
| `phase75-diagnostic-world-00014` | WARN | 21 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | 11 | avg 35.50; min 28; max 46; low season 9; champion pts 57..74; last pts 27..34; ability spread 2.76->2.46; draw rate avg/max 0.250/0.280 | season 10; S.S. Foggia; Milan Kovacic; assists 10; team goals 43; top1 0.23; top3 0.44; top assist Nico Ferrari; top scorer Felix Schuster:16 | table_points_spread_avg | none |
| `phase75-diagnostic-world-00016` | WARN | 20 | 11 | senior 396..419; youth 198..198; total 594..617 | 0 | 0 | 0 | 15 | avg 35.00; min 26; max 41; low season 3; champion pts 60..67; last pts 25..36; ability spread 2.35->1.86; draw rate avg/max 0.250/0.300 | season 8; A.C. Bologna; Davide Serafini; assists 12; team goals 51; top1 0.24; top3 0.41; top assist Davide Serafini; top scorer Marko Maric:13 | table_points_spread_avg | none |
| `phase75-diagnostic-world-00018` | WARN | 20 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | 11 | avg 36.00; min 25; max 43; low season 4; champion pts 59..72; last pts 22..34; ability spread 2.64->2.15; draw rate avg/max 0.250/0.290 | season 7; A.S.D. Vicenza; Harry Hughes; assists 10; team goals 43; top1 0.23; top3 0.41; top assist Harry Hughes; top scorer Yaya Diallo:17 | champion_streak | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase75-diagnostic-world-00019` | 15 | season 2; U.S. Perugia; Giorgio Amato; assists 10; team goals 34; top1 0.29; top3 0.45; top assist Matteo De Angelis; top scorer Nico Bocchi:16 | none |
| `phase75-diagnostic-world-00048` | 15 | season 10; U.S. Modena; Kerem Celik; assists 8; team goals 32; top1 0.25; top3 0.39; top assist Enrico Albanesi; top scorer Matteo De Santis:17 | table_points_spread_avg |
| `phase75-diagnostic-world-00016` | 15 | season 8; A.C. Bologna; Davide Serafini; assists 12; team goals 51; top1 0.24; top3 0.41; top assist Davide Serafini; top scorer Marko Maric:13 | table_points_spread_avg |
| `phase75-diagnostic-world-00045` | 15 | season 6; A.C. Cesena; Matteo Fiorini; assists 11; team goals 47; top1 0.23; top3 0.45; top assist Matteo Fiorini; top scorer Enrico Bellandi:16 | none |
| `phase75-diagnostic-world-00050` | 14 | season 6; S.S. Padova; Davide Abate; assists 14; team goals 50; top1 0.28; top3 0.46; top assist Davide Abate; top scorer Enrico Molinari:14 | champion_streak |
| `phase75-diagnostic-world-00012` | 14 | season 8; A.S. Lecco; Giorgio Verdi; assists 5; team goals 18; top1 0.28; top3 0.44; top assist Davide Vitale; top scorer Davide Lippi:15 | none |
| `phase75-diagnostic-world-00013` | 14 | season 2; U.S. Cosenza; Giorgio Gagliardi; assists 10; team goals 37; top1 0.27; top3 0.41; top assist Giorgio Gagliardi; top scorer Enrico Canini:16 | champion_streak |
| `phase75-diagnostic-world-00032` | 14 | season 5; A.C. Taranto; Mathis Moreau; assists 8; team goals 30; top1 0.27; top3 0.48; top assist Matteo Lombardo; top scorer Giorgio Coppola:15 | none |
| `phase75-diagnostic-world-00039` | 14 | season 5; U.S. Parma; Enrico Pavan; assists 11; team goals 42; top1 0.26; top3 0.48; top assist Nico Gori; top scorer Enrico Pavan:13 | useful_players_after_long_run |
| `phase75-diagnostic-world-00033` | 14 | season 1; S.S. Pisa; Giorgio Villa; assists 12; team goals 48; top1 0.25; top3 0.48; top assist Giorgio Villa; top scorer Enrico Vannucci:16 | table_points_spread_avg |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase75-diagnostic-world-00013` | 4 | Brescia Calcio | 68..72 | 44.00 | 4 | transfer=40; squad=209 | champion_streak |
| `phase75-diagnostic-world-00018` | 4 | Milan Calcio | 60..69 | 34.75 | 4 | transfer=40; squad=207 | champion_streak |
| `phase75-diagnostic-world-00050` | 4 | A.S. Matera | 59..69 | 34.75 | 5 | transfer=40; squad=218 | champion_streak |
| `phase75-diagnostic-world-00038` | 3 | S.S. Cagliari | 66..73 | 41.00 | 3 | transfer=40; squad=217 | none |
| `phase75-diagnostic-world-00031` | 3 | Pro Brescia | 63..73 | 40.33 | 5 | transfer=40; squad=194 | none |
| `phase75-diagnostic-world-00030` | 3 | U.S. Parma | 64..69 | 38.67 | 2 | transfer=40; squad=187 | top_creator_goal_share_max |
| `phase75-diagnostic-world-00005` | 3 | S.S. Pisa | 64..68 | 37.67 | 5 | transfer=40; squad=215 | table_points_spread_avg |
| `phase75-diagnostic-world-00010` | 3 | Pro Rimini | 61..69 | 37.67 | 6 | transfer=40; squad=178 | useful_players_after_long_run |
| `phase75-diagnostic-world-00006` | 3 | F.C. Lucca | 64..66 | 37.33 | 5 | transfer=40; squad=199 | none |
| `phase75-diagnostic-world-00025` | 3 | A.S. Foggia | 57..72 | 37.00 | 3 | transfer=40; squad=243 | none |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase75-diagnostic-world-00029` | 33.10 | 28..37 | 60..70 | 27..33 | avg 0.250 max 0.290 | 2.48->1.85 | table_points_spread_avg, useful_players_after_long_run |
| `phase75-diagnostic-world-00007` | 33.30 | 20..39 | 58..72 | 26..38 | avg 0.250 max 0.280 | 2.55->1.90 | table_points_spread_avg |
| `phase75-diagnostic-world-00021` | 34.30 | 27..45 | 58..69 | 23..34 | avg 0.240 max 0.280 | 2.62->1.94 | table_points_spread_avg |
| `phase75-diagnostic-world-00048` | 34.60 | 25..42 | 58..68 | 20..36 | avg 0.250 max 0.280 | 2.55->1.86 | table_points_spread_avg |
| `phase75-diagnostic-world-00047` | 34.80 | 28..41 | 61..70 | 25..36 | avg 0.250 max 0.300 | 2.80->2.52 | table_points_spread_avg, top_creator_goal_share_max |
| `phase75-diagnostic-world-00042` | 35.00 | 24..44 | 57..73 | 22..36 | avg 0.250 max 0.270 | 2.71->1.92 | table_points_spread_avg |
| `phase75-diagnostic-world-00016` | 35.00 | 26..41 | 60..67 | 25..36 | avg 0.250 max 0.300 | 2.35->1.86 | table_points_spread_avg |
| `phase75-diagnostic-world-00033` | 35.30 | 26..49 | 55..71 | 22..34 | avg 0.250 max 0.330 | 2.50->2.00 | table_points_spread_avg |
| `phase75-diagnostic-world-00014` | 35.50 | 28..46 | 57..74 | 27..34 | avg 0.250 max 0.280 | 2.76->2.46 | table_points_spread_avg |
| `phase75-diagnostic-world-00001` | 35.70 | 26..48 | 58..74 | 25..34 | avg 0.240 max 0.270 | 2.64->1.78 | table_points_spread_avg, top_creator_goal_share_max |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase75-diagnostic --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_50X10_REPORT.md
```
