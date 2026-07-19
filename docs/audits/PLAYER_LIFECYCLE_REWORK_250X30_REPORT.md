# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase75-pre-gate`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 74
- Goals per match average: 2.890
- Goals per match p95: 2.980
- Table spread average: 40.82
- Table spread minimum world average: 36.10
- Draw rate average: 0.240
- Draw rate maximum world average: 0.250
- Champion streak max observed: 8
- Top assist max p95: 17
- Production warning max: assists=19 top1=0.38 top3=0.58
- Age 30+ share p95: 0.40
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 70172
- Role coverage warnings p95: 315
- Youth roster max observed: 11
- Active player count min/max: senior=396..429 youth=198..198 total=594..627
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: top_assist_max=46, top_creator_goal_share_max=21, champion_streak=10, goals_per_match_avg=3, useful_players_after_long_run=2
- Signal check counts: story=56, monitor=26
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Phase 75 Calibration Classification

The pre-gate cohort is accepted without gameplay tuning because the lifecycle
structure holds for `7,500` simulated seasons: every club keeps at least `19`
senior players, no club loses natural goalkeeper coverage, every academy remains
at the `11` player target, and the total active-player population remains within
the intended beta corridor.

Warning classification:

- `top_assist_max`: accepted as rare creator-story variance. The p95 is `17`,
  the maximum is `19`, and the thirty-season hard fail threshold is `>=24`.
  These seasons are high but still useful for player stories rather than proof
  that the assist model is broken.
- `top_creator_goal_share_max`: accepted as monitor-only. The worst snapshot is
  `0.38`, below the `>0.40` fail threshold, and usually appears on lower-scoring
  teams where one creative player naturally carries more of the attack.
- `champion_streak`: accepted as dynasty-story variance. The maximum observed
  streak is `8`, below the thirty-season fail threshold of `>=9`; unique
  champion counts remain healthy across the warning snapshots.
- `goals_per_match_avg`: accepted as edge-of-band scoring variety. The aggregate
  average is `2.890`, p95 is `2.980`, and the strict balance profile also
  passes `2.000..3.200`.
- `useful_players_after_long_run`: accepted as monitor-only because it is not
  paired with senior overpopulation, youth overpopulation, missing goalkeeper,
  or squad-size collapse.

Locked thresholds before Step 15:

- goals per match: fail `<2.0` or `>3.2`; warn outside `2.3..3.0`;
- table points spread: fail `<30` or `>70`; warn outside `36..60`;
- top assists: pass `<=15`; warn `16..23`; fail `>=24` for thirty-season runs;
- top creator share: pass `<=0.30`; warn `>0.30`; fail `>0.40`;
- top-three creator share: pass `<=0.60`; warn `>0.60`; fail `>0.75`;
- champion streak: warn from `6`; fail from `9` for thirty-season runs;
- useful original players after long run: pass `<=8`; warn `9..16`; fail `>16`;
- age 30+ share: pass `<=0.45`; warn `>0.45`; fail `>0.60`;
- role coverage warnings: pass up to one warning per club-season, warn above;
- minimum senior squad: fail if any club falls below the squad-size gate;
- natural goalkeeper coverage: fail if any club has no natural goalkeeper;
- youth roster: pass exactly `11`; fail above or below the target;
- active population: seniors `396..450`, youth `198..198`, total `594..648`.

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| `phase75-pre-gate-world-00016` | WARN | 20 | 11 | senior 396..420; youth 198..198; total 594..618 | 0 | 0 | 0 | 15 | avg 39.87; min 27; max 50; low season 16; champion pts 58..77; last pts 21..35; ability spread 2.52->3.15; draw rate avg/max 0.240/0.310 | season 22; S.S. Como; Enrico Marino; assists 9; team goals 28; top1 0.32; top3 0.39; top assist Milan Ilic; top scorer Nolan Mercier:16 | top_creator_goal_share_max | none |
| `phase75-pre-gate-world-00017` | WARN | 20 | 11 | senior 396..422; youth 198..198; total 594..620 | 0 | 0 | 0 | 16 | avg 43.43; min 31; max 56; low season 4; champion pts 60..82; last pts 14..36; ability spread 2.90->2.56; draw rate avg/max 0.230/0.270 | season 24; U.S. Siena; Matteo Baldi; assists 10; team goals 38; top1 0.26; top3 0.42; top assist Enrico Albanesi; top scorer Giorgio Piras:17 | top_assist_max | none |
| `phase75-pre-gate-world-00021` | WARN | 20 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | 16 | avg 41.23; min 28; max 58; low season 8; champion pts 61..82; last pts 20..37; ability spread 2.52->2.94; draw rate avg/max 0.240/0.290 | season 30; U.S. Cagliari; Luca Piras; assists 16; team goals 53; top1 0.30; top3 0.47; top assist Luca Piras; top scorer Davide Bortolotti:17 | top_assist_max | none |
| `phase75-pre-gate-world-00028` | WARN | 20 | 11 | senior 396..423; youth 198..198; total 594..621 | 0 | 0 | 0 | 16 | avg 38.70; min 26; max 51; low season 1; champion pts 60..79; last pts 22..36; ability spread 2.75->3.14; draw rate avg/max 0.240/0.310 | season 2; A.S. Modena; Luca Zanetti; assists 9; team goals 36; top1 0.25; top3 0.39; top assist Enrico Grimaldi; top scorer Luca Santoro:15 | top_assist_max | none |
| `phase75-pre-gate-world-00031` | WARN | 20 | 11 | senior 396..420; youth 198..198; total 594..618 | 0 | 0 | 0 | 16 | avg 42.60; min 26; max 63; low season 10; champion pts 58..83; last pts 17..33; ability spread 2.36->2.36; draw rate avg/max 0.240/0.290 | season 13; Catania Calcio; Matteo Amato; assists 16; team goals 55; top1 0.29; top3 0.51; top assist Matteo Amato; top scorer Davide Pavoni:19 | top_assist_max | none |
| `phase75-pre-gate-world-00032` | WARN | 20 | 11 | senior 396..417; youth 198..198; total 594..615 | 0 | 0 | 0 | 13 | avg 40.30; min 30; max 60; low season 23; champion pts 62..81; last pts 17..36; ability spread 2.49->2.61; draw rate avg/max 0.230/0.270 | season 24; S.S. Trieste; Nico Pellegrino; assists 6; team goals 17; top1 0.35; top3 0.39; top assist Enrico D'Amico; top scorer Matteo Lombardi:16 | top_creator_goal_share_max | none |
| `phase75-pre-gate-world-00036` | WARN | 20 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | 17 | avg 40.03; min 28; max 57; low season 2; champion pts 60..84; last pts 19..33; ability spread 2.65->2.86; draw rate avg/max 0.240/0.280 | season 22; S.S. Matera; Milan Van Dalen; assists 14; team goals 48; top1 0.29; top3 0.44; top assist Milan Van Dalen; top scorer Luca Palumbo:17 | goals_per_match_avg, top_assist_max | none |
| `phase75-pre-gate-world-00037` | WARN | 20 | 11 | senior 396..421; youth 198..198; total 594..619 | 0 | 0 | 0 | 16 | avg 39.27; min 28; max 52; low season 7; champion pts 57..83; last pts 23..35; ability spread 2.61->2.90; draw rate avg/max 0.250/0.300 | season 5; U.S. Matera; Davide Carlini; assists 12; team goals 39; top1 0.31; top3 0.39; top assist Davide Carlini; top scorer Nico Martino:13 | top_assist_max, top_creator_goal_share_max | none |
| `phase75-pre-gate-world-00038` | WARN | 20 | 11 | senior 396..424; youth 198..198; total 594..622 | 0 | 0 | 0 | 16 | avg 42.63; min 28; max 56; low season 4; champion pts 59..77; last pts 15..36; ability spread 2.90->2.86; draw rate avg/max 0.240/0.300 | season 10; U.S. Como; Nolan Dumont; assists 11; team goals 42; top1 0.26; top3 0.45; top assist Seojun Kang; top scorer Diego Molina:16 | top_assist_max | none |
| `phase75-pre-gate-world-00040` | WARN | 19 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | 15 | avg 43.43; min 30; max 61; low season 29; champion pts 60..83; last pts 16..32; ability spread 2.30->2.86; draw rate avg/max 0.240/0.290 | season 14; U.S. Catania; Javier Molina; assists 10; team goals 34; top1 0.29; top3 0.42; top assist Luca Costantini; top scorer Miguel Cardoso:16 | champion_streak | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase75-pre-gate-world-00133` | 19 | season 25; S.S. Modena; Giorgio Farina; assists 12; team goals 42; top1 0.29; top3 0.43; top assist Giorgio Farina; top scorer Luca Masi:18 | top_assist_max |
| `phase75-pre-gate-world-00214` | 19 | season 22; Virtus Rome; Enrico Venturi; assists 19; team goals 69; top1 0.28; top3 0.45; top assist Enrico Venturi; top scorer Luca Mazza:18 | top_assist_max |
| `phase75-pre-gate-world-00114` | 18 | season 18; F.C. Ravenna; Giorgio Montanari; assists 18; team goals 56; top1 0.32; top3 0.50; top assist Giorgio Montanari; top scorer Daan Van Dalen:20 | top_assist_max, top_creator_goal_share_max |
| `phase75-pre-gate-world-00130` | 18 | season 20; U.S. Ravenna; Enrico Bruni; assists 11; team goals 38; top1 0.29; top3 0.42; top assist Enrico Bruni; top scorer Matteo Baldi:19 | top_assist_max |
| `phase75-pre-gate-world-00195` | 18 | season 20; A.S. Pisa; Matteo Bianchi; assists 6; team goals 21; top1 0.29; top3 0.40; top assist Ivan Petrovic; top scorer Nico Basile:20 | goals_per_match_avg, top_assist_max |
| `phase75-pre-gate-world-00239` | 18 | season 21; Virtus Milan; Matteo Abate; assists 9; team goals 32; top1 0.28; top3 0.38; top assist Nuno Barros; top scorer Giorgio Lombardo:15 | top_assist_max |
| `phase75-pre-gate-world-00241` | 18 | season 7; A.C. Foggia; Dario Jovanovic; assists 11; team goals 43; top1 0.26; top3 0.47; top assist Dario Jovanovic; top scorer Giorgio Biondi:14 | top_assist_max |
| `phase75-pre-gate-world-00177` | 17 | season 5; A.C. Arezzo; Enrico Lippi; assists 11; team goals 34; top1 0.32; top3 0.42; top assist Enrico Lippi; top scorer Matteo Cavallini:17 | top_assist_max, top_creator_goal_share_max |
| `phase75-pre-gate-world-00150` | 17 | season 16; U.S. Trieste; Luca Trevisan; assists 12; team goals 41; top1 0.29; top3 0.46; top assist Luca Trevisan; top scorer Kamil Kowalski:18 | top_assist_max |
| `phase75-pre-gate-world-00036` | 17 | season 22; S.S. Matera; Milan Van Dalen; assists 14; team goals 48; top1 0.29; top3 0.44; top assist Milan Van Dalen; top scorer Luca Palumbo:17 | goals_per_match_avg, top_assist_max |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase75-pre-gate-world-00060` | 8 | U.S. Arezzo | 67..77 | 43.75 | 12 | transfer=120; squad=1185 | champion_streak |
| `phase75-pre-gate-world-00167` | 7 | A.C. Mantova | 60..79 | 39.57 | 10 | transfer=120; squad=1202 | champion_streak |
| `phase75-pre-gate-world-00240` | 6 | Virtus Matera | 65..88 | 45.83 | 12 | transfer=120; squad=1179 | champion_streak |
| `phase75-pre-gate-world-00091` | 6 | A.C. Pisa | 63..81 | 45.33 | 11 | transfer=120; squad=1163 | champion_streak |
| `phase75-pre-gate-world-00124` | 6 | A.S. Padova | 66..82 | 44.00 | 8 | transfer=120; squad=1199 | top_creator_goal_share_max, champion_streak |
| `phase75-pre-gate-world-00095` | 6 | U.S. Lucca | 64..78 | 43.33 | 11 | transfer=120; squad=1202 | champion_streak |
| `phase75-pre-gate-world-00046` | 6 | S.S. Perugia | 61..82 | 42.33 | 10 | transfer=120; squad=1171 | champion_streak |
| `phase75-pre-gate-world-00226` | 6 | Carpi Calcio | 66..75 | 41.00 | 10 | transfer=120; squad=1200 | champion_streak |
| `phase75-pre-gate-world-00040` | 6 | Rimini Calcio | 63..79 | 40.83 | 10 | transfer=120; squad=1218 | champion_streak |
| `phase75-pre-gate-world-00206` | 6 | Trento Calcio | 62..72 | 40.33 | 9 | transfer=120; squad=1170 | champion_streak |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase75-pre-gate-world-00045` | 36.10 | 19..53 | 54..80 | 19..36 | avg 0.250 max 0.310 | 2.54->2.81 | none |
| `phase75-pre-gate-world-00170` | 37.00 | 20..52 | 55..73 | 19..35 | avg 0.250 max 0.310 | 2.49->2.82 | none |
| `phase75-pre-gate-world-00011` | 37.03 | 23..52 | 55..75 | 18..35 | avg 0.240 max 0.290 | 2.44->2.95 | none |
| `phase75-pre-gate-world-00094` | 37.50 | 19..55 | 57..77 | 17..38 | avg 0.250 max 0.290 | 2.53->2.76 | none |
| `phase75-pre-gate-world-00046` | 37.50 | 23..60 | 56..82 | 21..36 | avg 0.250 max 0.310 | 2.95->2.59 | champion_streak |
| `phase75-pre-gate-world-00140` | 37.63 | 19..58 | 55..82 | 22..37 | avg 0.240 max 0.290 | 2.50->2.58 | none |
| `phase75-pre-gate-world-00084` | 37.67 | 24..55 | 57..78 | 20..34 | avg 0.240 max 0.280 | 2.32->2.66 | none |
| `phase75-pre-gate-world-00076` | 37.83 | 23..58 | 58..76 | 17..38 | avg 0.240 max 0.370 | 2.31->2.64 | none |
| `phase75-pre-gate-world-00039` | 37.90 | 29..49 | 59..77 | 17..35 | avg 0.250 max 0.310 | 2.37->2.66 | none |
| `phase75-pre-gate-world-00199` | 37.93 | 27..48 | 60..76 | 21..36 | avg 0.250 max 0.290 | 2.73->2.90 | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase75-pre-gate --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_250X30_REPORT.md
```
