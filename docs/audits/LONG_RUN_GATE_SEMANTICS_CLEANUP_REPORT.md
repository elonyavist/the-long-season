# Long-Run Gate Semantics Cleanup Report

Date: 2026-06-22
Phase: `37-long-run-gate-semantics-cleanup`
Status: Complete

## Purpose

Phase 37 converts the Phase 36 warning review into clearer long-run gate
semantics. The goal is user-facing game quality: keep structural failures
strict, keep useful monitoring signals visible, and avoid making healthy
football variance look like a defect.

This phase does not tune gameplay behavior.

## Step 02 - Active Player Population Semantics

Decision: split the old ambiguous `active_player_population` check into:

- `senior_active_player_population`
- `youth_active_player_population`
- `total_active_player_population`

The current stable roster model is 18 clubs with 22 senior players and 11
youth players each, so a healthy world starts at 396 senior players, 198 youth
players, and 594 total active players. The old 396-player total expectation was
semantically outdated after the youth-academy phase.

## Step 03 - Warning Signal Grouping

Decision: keep existing anomaly keys and thresholds, but add report-level
`Signal check counts` so warnings can be read as:

- `story`: plausible football variance worth watching, not a bug by itself
- `monitor`: a useful balance signal that needs context
- `structural`: a real integrity warning if it appears at warning level

This preserves strict failure semantics: only `fail` blocks the gate.

## Step 04 - Monitoring Signal Readability

Decision: no additional code was needed in Step 04. The current generated
report already exposes aggregate counts, signal-kind grouping, worst-world
snapshots, production snapshots, dynasty snapshots, and table-spread snapshots.

Observed 50x10 readability result:

- status: PASS
- failed worlds: 0
- warning worlds: 11
- warning check counts: `champion_streak=6`,
  `table_points_spread_avg=4`, `top_creator_goal_share_max=1`
- signal check counts: `story=10`, `monitor=1`
- active player range: senior `396..438`, youth `198..198`, total `594..636`

## Step 05 - Regression Gate

Decision: the semantics cleanup did not change gameplay behavior and did not
hide real failures. The full 250x30 gate passes with no failing checks.

Observed 250x30 regression result:

- status: PASS
- failed worlds: 0
- warning worlds: 56
- goals per match average/p95: `2.770 / 2.840`
- table spread average/min: `39.83 / 35.67`
- draw rate average/max: `0.250 / 0.260`
- champion streak max: `8`
- top assist p95: `16`
- active player range: senior `396..443`, youth `198..198`, total `594..641`
- warning check counts: `top_assist_max=29`,
  `top_creator_goal_share_max=26`, `champion_streak=5`,
  `table_points_spread_avg=3`
- signal check counts: `story=37`, `monitor=26`
- failing check counts: none

Strict `calibration-v1` balance also passed after the long-run gate:

- goals per match: `3.102`
- table points spread: `43.800`
- status: PASS

## Step 06 - Phase Decision

Phase 37 is complete.

Gameplay behavior changed: no. The implementation changed diagnostics and
report language only:

- the active-player warning now matches the senior/youth roster model;
- warning checks are grouped as `story`, `monitor`, or `structural`;
- the full gate still exposes all underlying anomaly keys and snapshots.

Long-run gate result: PASS.

Strict balance result: PASS.

Remaining warnings are not current blockers:

- `top_assist_max` remains a story/production-watch signal;
- `top_creator_goal_share_max` remains a monitoring signal for creator
  concentration;
- `champion_streak` remains a story signal for dynasty seasons;
- `table_points_spread_avg` remains a story signal for unusually compact but
  still structurally valid leagues.

Next action: choose the next phase explicitly before implementation. A useful
direction is to keep focusing on long-run fun evidence and career-world
credibility before adding broad UI or unrelated feature work.

## Generated Evidence Report

# Career Squad Refresh Long-Run Gates Report

Date: 2026-06-22
Seed prefix: `phase35-table-spread`
Worlds: 250
Seasons per world: 30
Total seasons: 7500
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 56
- Goals per match average: 2.770
- Goals per match p95: 2.840
- Table spread average: 39.83
- Table spread minimum world average: 35.67
- Draw rate average: 0.250
- Draw rate maximum world average: 0.260
- Champion streak max observed: 8
- Top assist max p95: 16
- Production warning max: assists=18 top1=0.40 top3=0.57
- Age 30+ share p95: 0.24
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 54022
- Role coverage warnings p95: 249
- Youth roster max observed: 11
- Active player count min/max: senior=396..443 youth=198..198 total=594..641
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Warning check counts: top_assist_max=29, top_creator_goal_share_max=26, champion_streak=5, table_points_spread_avg=3
- Signal check counts: story=37, monitor=26
- Failing check counts: none

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| `phase35-table-spread-world-00006` | WARN | 20 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | 16 | avg 38.50; min 27; max 52; low season 22; champion pts 61..76; last pts 21..36; ability spread 2.56->2.22; draw rate avg/max 0.240/0.290 | season 28; Pro Carpi; Nico Rosati; assists 12; team goals 44; top1 0.27; top3 0.43; top assist Nico Rosati; top scorer Enrico Magnani:13 | top_assist_max | none |
| `phase35-table-spread-world-00009` | WARN | 20 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | 16 | avg 39.17; min 28; max 54; low season 10; champion pts 58..77; last pts 16..35; ability spread 2.26->2.22; draw rate avg/max 0.250/0.300 | season 1; A.C. Cesena; Felix Vogel; assists 10; team goals 37; top1 0.27; top3 0.40; top assist Felix Vogel; top scorer Mathis Rousseau:16 | top_assist_max | none |
| `phase35-table-spread-world-00014` | WARN | 20 | 11 | senior 396..433; youth 198..198; total 594..631 | 0 | 0 | 0 | 12 | avg 38.27; min 20; max 50; low season 5; champion pts 57..74; last pts 20..37; ability spread 2.53->2.40; draw rate avg/max 0.250/0.310 | season 27; Siena Calcio; Enrico De Marchi; assists 12; team goals 36; top1 0.33; top3 0.41; top assist Enrico De Marchi; top scorer Enrico Greco:15 | top_creator_goal_share_max | none |
| `phase35-table-spread-world-00024` | WARN | 20 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | 15 | avg 36.07; min 23; max 53; low season 20; champion pts 59..85; last pts 20..36; ability spread 2.18->2.11; draw rate avg/max 0.250/0.280 | season 29; A.C. Siena; Luca Santi; assists 8; team goals 26; top1 0.31; top3 0.37; top assist Dario Babic; top scorer Enrico Pugliese:19 | top_creator_goal_share_max | none |
| `phase35-table-spread-world-00025` | WARN | 20 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | 17 | avg 39.97; min 27; max 62; low season 4; champion pts 61..85; last pts 18..36; ability spread 2.58->2.28; draw rate avg/max 0.250/0.290 | season 5; S.S. Catania; Luca Alberti; assists 12; team goals 43; top1 0.28; top3 0.49; top assist Luca Alberti; top scorer Matteo Giordano:15 | top_assist_max | none |
| `phase35-table-spread-world-00029` | WARN | 20 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | 18 | avg 39.97; min 28; max 60; low season 7; champion pts 59..81; last pts 18..34; ability spread 2.48->2.16; draw rate avg/max 0.250/0.310 | season 11; Brescia Calcio; Matteo Mazzi; assists 18; team goals 62; top1 0.29; top3 0.45; top assist Matteo Mazzi; top scorer Luca Sartori:15 | top_assist_max | none |
| `phase35-table-spread-world-00030` | WARN | 20 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | 12 | avg 39.43; min 26; max 53; low season 8; champion pts 57..77; last pts 17..33; ability spread 2.43->2.35; draw rate avg/max 0.240/0.300 | season 10; Catania Calcio; Matteo Naldi; assists 4; team goals 10; top1 0.40; top3 0.38; top assist Giorgio Santoro; top scorer Ren Tanaka:17 | top_creator_goal_share_max | none |
| `phase35-table-spread-world-00037` | WARN | 21 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | 14 | avg 39.60; min 22; max 52; low season 2; champion pts 58..76; last pts 20..37; ability spread 2.27->2.84; draw rate avg/max 0.260/0.310 | season 23; U.S. Florence; Enrico Costantini; assists 13; team goals 46; top1 0.28; top3 0.48; top assist Enrico Costantini; top scorer Davide Pini:14 | champion_streak | none |
| `phase35-table-spread-world-00054` | WARN | 20 | 11 | senior 396..425; youth 198..198; total 594..623 | 0 | 0 | 0 | 15 | avg 38.30; min 29; max 55; low season 6; champion pts 60..76; last pts 16..34; ability spread 2.20->2.31; draw rate avg/max 0.250/0.280 | season 5; Virtus Ascoli; Luca Foschi; assists 13; team goals 42; top1 0.31; top3 0.52; top assist Luca Foschi; top scorer Ivan Stanic:17 | top_creator_goal_share_max | none |
| `phase35-table-spread-world-00059` | WARN | 19 | 11 | senior 396..434; youth 198..198; total 594..632 | 0 | 0 | 0 | 15 | avg 41.23; min 29; max 62; low season 1; champion pts 61..87; last pts 17..33; ability spread 2.46->2.32; draw rate avg/max 0.250/0.280 | season 26; S.S. Pisa; Matteo Trevisan; assists 8; team goals 22; top1 0.36; top3 0.40; top assist Matteo Cardini; top scorer Enrico Battaglia:16 | top_creator_goal_share_max | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase35-table-spread-world-00065` | 18 | season 7; U.S. Como; Luca Vallini; assists 18; team goals 60; top1 0.30; top3 0.43; top assist Luca Vallini; top scorer Matteo Grassi:14 | top_assist_max |
| `phase35-table-spread-world-00029` | 18 | season 11; Brescia Calcio; Matteo Mazzi; assists 18; team goals 62; top1 0.29; top3 0.45; top assist Matteo Mazzi; top scorer Luca Sartori:15 | top_assist_max |
| `phase35-table-spread-world-00103` | 18 | season 20; F.C. Padova; Enrico Conti; assists 9; team goals 31; top1 0.29; top3 0.39; top assist Matteo Palmieri; top scorer Nico Testa:18 | top_assist_max |
| `phase35-table-spread-world-00075` | 18 | season 1; S.S. Parma; Giorgio Abate; assists 18; team goals 63; top1 0.29; top3 0.44; top assist Giorgio Abate; top scorer Giorgio Negri:22 | top_assist_max |
| `phase35-table-spread-world-00229` | 18 | season 19; U.S. Siena; Enrico Spinelli; assists 10; team goals 36; top1 0.28; top3 0.46; top assist Enrico Spinelli; top scorer Davide Mancuso:18 | top_assist_max |
| `phase35-table-spread-world-00164` | 18 | season 10; Virtus Vicenza; Luca Pugliese; assists 9; team goals 36; top1 0.25; top3 0.40; top assist Luca Pugliese; top scorer Luca Zini:18 | top_assist_max |
| `phase35-table-spread-world-00160` | 17 | season 24; Milan Calcio; Giorgio Merlo; assists 17; team goals 53; top1 0.32; top3 0.49; top assist Giorgio Merlo; top scorer Luca Bagnoli:18 | top_assist_max, top_creator_goal_share_max |
| `phase35-table-spread-world-00219` | 17 | season 7; Pro Cosenza; Luca Accardi; assists 13; team goals 46; top1 0.28; top3 0.45; top assist Luca Accardi; top scorer Giorgio Vallini:14 | top_assist_max |
| `phase35-table-spread-world-00025` | 17 | season 5; S.S. Catania; Luca Alberti; assists 12; team goals 43; top1 0.28; top3 0.49; top assist Luca Alberti; top scorer Matteo Giordano:15 | top_assist_max |
| `phase35-table-spread-world-00223` | 17 | season 9; A.C. Terni; Davide Maresca; assists 17; team goals 61; top1 0.28; top3 0.56; top assist Davide Maresca; top scorer Marko Novak:14 | top_assist_max |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase35-table-spread-world-00238` | 8 | Salerno Calcio | 66..78 | 42.88 | 10 | transfer=120; squad=1232 | champion_streak |
| `phase35-table-spread-world-00037` | 7 | Pro Rimini | 62..74 | 40.71 | 10 | transfer=120; squad=1239 | champion_streak |
| `phase35-table-spread-world-00062` | 6 | A.C. Parma | 65..86 | 47.67 | 9 | transfer=120; squad=1252 | champion_streak |
| `phase35-table-spread-world-00123` | 6 | A.S. Ascoli | 65..75 | 40.50 | 10 | transfer=120; squad=1204 | top_assist_max, champion_streak |
| `phase35-table-spread-world-00077` | 6 | A.C. Trieste | 61..69 | 35.67 | 9 | transfer=120; squad=1243 | table_points_spread_avg, champion_streak |
| `phase35-table-spread-world-00244` | 5 | Parma Calcio | 69..78 | 49.60 | 9 | transfer=120; squad=1226 | none |
| `phase35-table-spread-world-00157` | 5 | Terni Calcio | 70..81 | 48.40 | 11 | transfer=120; squad=1214 | none |
| `phase35-table-spread-world-00206` | 5 | U.S. Catania | 64..85 | 46.80 | 10 | transfer=120; squad=1215 | none |
| `phase35-table-spread-world-00036` | 5 | F.C. Taranto | 66..76 | 46.20 | 10 | transfer=120; squad=1240 | none |
| `phase35-table-spread-world-00156` | 5 | A.C. Taranto | 65..70 | 45.00 | 10 | transfer=120; squad=1265 | none |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase35-table-spread-world-00208` | 35.67 | 26..48 | 58..73 | 20..35 | avg 0.250 max 0.310 | 2.29->2.13 | table_points_spread_avg |
| `phase35-table-spread-world-00107` | 35.90 | 25..55 | 59..83 | 19..36 | avg 0.250 max 0.310 | 2.28->2.42 | table_points_spread_avg |
| `phase35-table-spread-world-00077` | 35.93 | 23..53 | 59..74 | 18..37 | avg 0.250 max 0.290 | 2.22->2.26 | table_points_spread_avg, champion_streak |
| `phase35-table-spread-world-00024` | 36.07 | 23..53 | 59..85 | 20..36 | avg 0.250 max 0.280 | 2.18->2.11 | top_creator_goal_share_max |
| `phase35-table-spread-world-00022` | 36.27 | 24..47 | 58..78 | 21..35 | avg 0.250 max 0.310 | 2.08->2.49 | none |
| `phase35-table-spread-world-00023` | 36.27 | 29..48 | 59..81 | 21..36 | avg 0.260 max 0.320 | 2.40->2.11 | none |
| `phase35-table-spread-world-00065` | 36.30 | 26..52 | 59..73 | 19..36 | avg 0.250 max 0.300 | 2.28->2.06 | top_assist_max |
| `phase35-table-spread-world-00173` | 36.60 | 23..48 | 56..74 | 20..37 | avg 0.250 max 0.280 | 2.28->2.00 | none |
| `phase35-table-spread-world-00099` | 37.03 | 24..50 | 59..78 | 18..37 | avg 0.250 max 0.290 | 2.31->2.31 | none |
| `phase35-table-spread-world-00053` | 37.17 | 22..50 | 58..76 | 17..36 | avg 0.250 max 0.310 | 2.21->2.34 | none |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md
```
