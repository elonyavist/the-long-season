# Long-Run Warning Fun Audit

Date: 2026-06-22
Phase: `36-long-run-warning-semantics-and-fun-audit`

## Purpose

This audit interprets remaining long-run warnings from Phase 35 as gameplay
questions first and mathematical signals second.

The goal is not to make reports green. The goal is to decide whether each
warning points to:

- a believable football story that should remain possible;
- a useful monitor that should keep warning us;
- a threshold whose wording or severity is wrong;
- missing diagnostics;
- a real engine, content, or career-logic issue that hurts the game.

The product rule for this phase is:

> Math is a diagnostic instrument. User fun, football credibility, readability,
> and emergent football stories are the objective.

## Final Warning Decisions

| Warning | Classification | Decision |
|---|---|---|
| `active_player_population` | `bad threshold semantics` with useful monitoring value | The world is structurally healthy. The warning fires because the lower total-player threshold expects `612+` active players while the current stable model can sit at `594` active players: 18 senior squads around 22 players plus 18 exact 11-player academies. Future cleanup should split senior/youth/total semantics rather than adding players to satisfy a number. |
| `top_assist_max` | `healthy narrative variance` with monitoring value | Max assists `18` and p95 `16` create believable standout playmaker seasons. Strong raw assist cases usually occur on productive teams and do not show impossible creator share. |
| `top_creator_goal_share_max` | `useful monitoring warning` | Max top1 creator share reaches `0.40` without failures and top3 max stays `0.57`. Keep monitoring, but current evidence does not justify attribution or chance-actor changes. |
| `champion_streak` | `healthy narrative variance` with monitoring value | Max streak `8` across 250 worlds x 30 seasons is rare and supported by healthy turnover, multiple unique champions, and strong table spread. This is a useful "team to beat" story, not stagnation. |
| `table_points_spread_avg` | `healthy narrative variance` with monitoring value | Only `3 / 250` worlds warn, the lowest world average is `35.67` against a pass threshold of `36`, and supporting draw/ability/spread evidence does not show recurring compression collapse. |

## Fun-First Evaluation Summary

The current warnings should not be treated as a bug list.

From a player perspective:

- a few tight leagues are good because not every season should have the same
  table shape;
- a few dynasties are good because they create teams to chase;
- a few elite playmaker seasons are good because they create memorable players;
- population monitoring is useful, but its current total-player threshold is
  semantically outdated for the current roster model.

No tuning is recommended just to reduce warning counts.

## Final Next Action

Phase 36 can close without gameplay rework.

Keep all five warning types as monitoring signals for future long-run reports:

- `active_player_population` should remain visible, but a future diagnostics
  cleanup should split senior, youth, and total-player semantics instead of
  using a single total-player lower bound.
- `top_assist_max` should remain visible because standout creators are fun when
  their team and creator-share context stay believable.
- `top_creator_goal_share_max` should remain visible because it is the best
  early warning for over-concentrated chance creation.
- `champion_streak` should remain visible because rare dynasties are good
  football stories, but repeated long streaks across many worlds would reduce
  long-run uncertainty.
- `table_points_spread_avg` should remain visible because very tight leagues are
  believable in moderation, but recurring compression could make squad building
  feel less meaningful.

No next implementation phase is selected by this report. The next phase should
be chosen explicitly after reviewing whether the user wants to continue engine
hardening, career systems, or UI exploration.

## Step Evidence Summary

### Step 02 - Active Player Population

- active senior players: `396..443`;
- active youth players: `198..198`;
- active total players: `594..641`;
- minimum squad size observed: `19`;
- clubs below minimum squad size: `0`;
- clubs without natural goalkeeper: `0`;
- clubs above youth target: `0`;
- clubs below youth minimum: `0`.

### Step 03 - Creator And Assist

- `top_assist_max` warning worlds: `29 / 250`;
- `top_creator_goal_share_max` warning worlds: `26 / 250`;
- max assists: `18`;
- top assist p95: `16`;
- max top1 creator share: `0.40`;
- max top3 creator share: `0.57`;
- failing check counts: `none`.

### Step 04 - Champion Streak

- `champion_streak` warning worlds: `5 / 250`;
- max champion streak observed: `8`;
- strongest dynasty: `Salerno Calcio`, `8` straight titles,
  champion points `66..78`, streak table spread average `42.88`,
  `10` unique champions in the world, transfer turnover `120`, squad turnover
  `1232`;
- failing check counts: `none`.

### Step 05 - Table Spread

- `table_points_spread_avg` warning worlds: `3 / 250`;
- table spread average across worlds: `39.83`;
- minimum world-average table spread: `35.67`;
- warning world averages: `35.67`, `35.90`, `35.93`;
- draw rate in tight worlds stays around `0.250`;
- ability spread remains present;
- champion points and last-place points ranges are tight but believable, not
  structurally broken.

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
- Warning worlds: 250
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
- Warning check counts: active_player_population=250, top_assist_max=29, top_creator_goal_share_max=26, champion_streak=5, table_points_spread_avg=3
- Failing check counts: none

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| `phase35-table-spread-world-00001` | WARN | 20 | 11 | senior 396..433; youth 198..198; total 594..631 | 0 | 0 | 0 | 14 | avg 38.93; min 29; max 51; low season 15; champion pts 61..78; last pts 21..38; ability spread 2.41->2.46; draw rate avg/max 0.250/0.300 | season 23; Taranto Calcio; Niklas Weber; assists 12; team goals 40; top1 0.30; top3 0.45; top assist Niklas Weber; top scorer Davide Zorzi:17 | active_player_population | none |
| `phase35-table-spread-world-00002` | WARN | 19 | 11 | senior 396..434; youth 198..198; total 594..632 | 0 | 0 | 0 | 13 | avg 40.97; min 30; max 61; low season 10; champion pts 60..82; last pts 20..36; ability spread 2.29->2.22; draw rate avg/max 0.240/0.290 | season 14; Taranto Calcio; Enrico Caputo; assists 10; team goals 37; top1 0.27; top3 0.41; top assist Nico Basile; top scorer Nico Pellegrino:22 | active_player_population | none |
| `phase35-table-spread-world-00003` | WARN | 20 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | 12 | avg 38.63; min 29; max 54; low season 12; champion pts 60..80; last pts 23..33; ability spread 2.51->2.22; draw rate avg/max 0.240/0.280 | season 18; Brescia Calcio; Giorgio De Marchi; assists 9; team goals 30; top1 0.30; top3 0.39; top assist Javier Serrano; top scorer Luca Zini:18 | active_player_population | none |
| `phase35-table-spread-world-00004` | WARN | 20 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | 12 | avg 39.43; min 28; max 49; low season 13; champion pts 59..76; last pts 24..36; ability spread 2.44->2.44; draw rate avg/max 0.240/0.280 | season 16; A.C. Mantova; Dario Babic; assists 10; team goals 35; top1 0.29; top3 0.38; top assist Dario Babic; top scorer Yusuf Aydin:18 | active_player_population | none |
| `phase35-table-spread-world-00005` | WARN | 20 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | 14 | avg 39.43; min 25; max 63; low season 6; champion pts 57..82; last pts 18..35; ability spread 2.37->2.40; draw rate avg/max 0.250/0.300 | season 15; A.C. Trento; Enrico Neri; assists 11; team goals 44; top1 0.25; top3 0.43; top assist Enrico Neri; top scorer Joao Matos:13 | active_player_population | none |
| `phase35-table-spread-world-00006` | WARN | 20 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | 16 | avg 38.50; min 27; max 52; low season 22; champion pts 61..76; last pts 21..36; ability spread 2.56->2.22; draw rate avg/max 0.240/0.290 | season 28; Pro Carpi; Nico Rosati; assists 12; team goals 44; top1 0.27; top3 0.43; top assist Nico Rosati; top scorer Enrico Magnani:13 | top_assist_max, active_player_population | none |
| `phase35-table-spread-world-00007` | WARN | 20 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | 13 | avg 38.90; min 27; max 56; low season 15; champion pts 59..80; last pts 15..35; ability spread 2.62->2.01; draw rate avg/max 0.250/0.290 | season 23; A.C. Vicenza; Nico Greco; assists 11; team goals 39; top1 0.28; top3 0.39; top assist Nico Greco; top scorer Milan Lukic:17 | active_player_population | none |
| `phase35-table-spread-world-00008` | WARN | 19 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | 14 | avg 40.33; min 28; max 59; low season 21; champion pts 62..80; last pts 14..36; ability spread 2.35->2.35; draw rate avg/max 0.240/0.310 | season 6; U.S. Siena; Davide Zorzi; assists 7; team goals 27; top1 0.26; top3 0.41; top assist Enrico Gagliardi; top scorer Giorgio Bocchi:16 | active_player_population | none |
| `phase35-table-spread-world-00009` | WARN | 20 | 11 | senior 396..431; youth 198..198; total 594..629 | 0 | 0 | 0 | 16 | avg 39.17; min 28; max 54; low season 10; champion pts 58..77; last pts 16..35; ability spread 2.26->2.22; draw rate avg/max 0.250/0.300 | season 1; A.C. Cesena; Felix Vogel; assists 10; team goals 37; top1 0.27; top3 0.40; top assist Felix Vogel; top scorer Mathis Rousseau:16 | top_assist_max, active_player_population | none |
| `phase35-table-spread-world-00010` | WARN | 20 | 11 | senior 396..433; youth 198..198; total 594..631 | 0 | 0 | 0 | 14 | avg 38.97; min 28; max 50; low season 24; champion pts 59..73; last pts 16..35; ability spread 2.53->2.28; draw rate avg/max 0.240/0.290 | season 6; A.C. Palermo; Davide Ambrosi; assists 10; team goals 39; top1 0.26; top3 0.39; top assist Enrico Naldi; top scorer Enrico Falcone:17 | active_player_population | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase35-table-spread-world-00065` | 18 | season 7; U.S. Como; Luca Vallini; assists 18; team goals 60; top1 0.30; top3 0.43; top assist Luca Vallini; top scorer Matteo Grassi:14 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00029` | 18 | season 11; Brescia Calcio; Matteo Mazzi; assists 18; team goals 62; top1 0.29; top3 0.45; top assist Matteo Mazzi; top scorer Luca Sartori:15 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00103` | 18 | season 20; F.C. Padova; Enrico Conti; assists 9; team goals 31; top1 0.29; top3 0.39; top assist Matteo Palmieri; top scorer Nico Testa:18 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00075` | 18 | season 1; S.S. Parma; Giorgio Abate; assists 18; team goals 63; top1 0.29; top3 0.44; top assist Giorgio Abate; top scorer Giorgio Negri:22 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00229` | 18 | season 19; U.S. Siena; Enrico Spinelli; assists 10; team goals 36; top1 0.28; top3 0.46; top assist Enrico Spinelli; top scorer Davide Mancuso:18 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00164` | 18 | season 10; Virtus Vicenza; Luca Pugliese; assists 9; team goals 36; top1 0.25; top3 0.40; top assist Luca Pugliese; top scorer Luca Zini:18 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00160` | 17 | season 24; Milan Calcio; Giorgio Merlo; assists 17; team goals 53; top1 0.32; top3 0.49; top assist Giorgio Merlo; top scorer Luca Bagnoli:18 | top_assist_max, top_creator_goal_share_max, active_player_population |
| `phase35-table-spread-world-00219` | 17 | season 7; Pro Cosenza; Luca Accardi; assists 13; team goals 46; top1 0.28; top3 0.45; top assist Luca Accardi; top scorer Giorgio Vallini:14 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00025` | 17 | season 5; S.S. Catania; Luca Alberti; assists 12; team goals 43; top1 0.28; top3 0.49; top assist Luca Alberti; top scorer Matteo Giordano:15 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00223` | 17 | season 9; A.C. Terni; Davide Maresca; assists 17; team goals 61; top1 0.28; top3 0.56; top assist Davide Maresca; top scorer Marko Novak:14 | top_assist_max, active_player_population |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase35-table-spread-world-00238` | 8 | Salerno Calcio | 66..78 | 42.88 | 10 | transfer=120; squad=1232 | champion_streak, active_player_population |
| `phase35-table-spread-world-00037` | 7 | Pro Rimini | 62..74 | 40.71 | 10 | transfer=120; squad=1239 | champion_streak, active_player_population |
| `phase35-table-spread-world-00062` | 6 | A.C. Parma | 65..86 | 47.67 | 9 | transfer=120; squad=1252 | champion_streak, active_player_population |
| `phase35-table-spread-world-00123` | 6 | A.S. Ascoli | 65..75 | 40.50 | 10 | transfer=120; squad=1204 | top_assist_max, champion_streak, active_player_population |
| `phase35-table-spread-world-00077` | 6 | A.C. Trieste | 61..69 | 35.67 | 9 | transfer=120; squad=1243 | table_points_spread_avg, champion_streak, active_player_population |
| `phase35-table-spread-world-00244` | 5 | Parma Calcio | 69..78 | 49.60 | 9 | transfer=120; squad=1226 | active_player_population |
| `phase35-table-spread-world-00157` | 5 | Terni Calcio | 70..81 | 48.40 | 11 | transfer=120; squad=1214 | active_player_population |
| `phase35-table-spread-world-00206` | 5 | U.S. Catania | 64..85 | 46.80 | 10 | transfer=120; squad=1215 | active_player_population |
| `phase35-table-spread-world-00036` | 5 | F.C. Taranto | 66..76 | 46.20 | 10 | transfer=120; squad=1240 | active_player_population |
| `phase35-table-spread-world-00156` | 5 | A.C. Taranto | 65..70 | 45.00 | 10 | transfer=120; squad=1265 | active_player_population |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase35-table-spread-world-00208` | 35.67 | 26..48 | 58..73 | 20..35 | avg 0.250 max 0.310 | 2.29->2.13 | table_points_spread_avg, active_player_population |
| `phase35-table-spread-world-00107` | 35.90 | 25..55 | 59..83 | 19..36 | avg 0.250 max 0.310 | 2.28->2.42 | table_points_spread_avg, active_player_population |
| `phase35-table-spread-world-00077` | 35.93 | 23..53 | 59..74 | 18..37 | avg 0.250 max 0.290 | 2.22->2.26 | table_points_spread_avg, champion_streak, active_player_population |
| `phase35-table-spread-world-00024` | 36.07 | 23..53 | 59..85 | 20..36 | avg 0.250 max 0.280 | 2.18->2.11 | top_creator_goal_share_max, active_player_population |
| `phase35-table-spread-world-00022` | 36.27 | 24..47 | 58..78 | 21..35 | avg 0.250 max 0.310 | 2.08->2.49 | active_player_population |
| `phase35-table-spread-world-00023` | 36.27 | 29..48 | 59..81 | 21..36 | avg 0.260 max 0.320 | 2.40->2.11 | active_player_population |
| `phase35-table-spread-world-00065` | 36.30 | 26..52 | 59..73 | 19..36 | avg 0.250 max 0.300 | 2.28->2.06 | top_assist_max, active_player_population |
| `phase35-table-spread-world-00173` | 36.60 | 23..48 | 56..74 | 20..37 | avg 0.250 max 0.280 | 2.28->2.00 | active_player_population |
| `phase35-table-spread-world-00099` | 37.03 | 24..50 | 59..78 | 18..37 | avg 0.250 max 0.290 | 2.31->2.31 | active_player_population |
| `phase35-table-spread-world-00053` | 37.17 | 22..50 | 58..76 | 17..36 | avg 0.250 max 0.310 | 2.21->2.34 | active_player_population |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md
```
