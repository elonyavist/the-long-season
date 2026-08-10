# Phase 81A - Big Five Statistical Baseline

## Status

Frozen on 2026-08-09 before any post-L5 engine correction. This document is
the external statistical denominator for Amendment A4 and Step 06B10. It does
not prove which game Module owns a deviation and it is never regenerated to
make a later checkpoint pass.

## Product Question

Does the fictional first division produce a credible top-flight season over a
ten-year career, specifically for:

- total goals and draws;
- champion, bottom-club and table-point separation;
- how many players a club uses;
- the ages, appearances and production of leading scorers and creators?

The first division is compared with the real Big Five. The second and third
fictional divisions are deliberately excluded: they need separate lower-league
benchmarks and must not inherit top-flight targets by convenience.

## Sources And Populations

### Team and result population

- Source: [Football-Data historical CSV archive](https://www.football-data.co.uk/data.php).
- Leagues: Premier League, La Liga, Serie A, Bundesliga and Ligue 1.
- Seasons: 2005/06 through 2024/25.
- Denominator: `100` league-seasons.
- Inputs used: final score, home club and away club only.
- Points are converted to points per match and then to a `34`-match equivalent.
  Goals per match and draw share need no schedule conversion.
- The shortened 2019/20 Ligue 1 season remains in the population; its rate
  statistics and `34`-match points equivalent remain comparable.

### Player population

- Source: [Top 5 League Football Player Stats 2017-2025](https://www.kaggle.com/datasets/emrey3lmaz/top-5-league-football-player-stats-2017-2025),
  collected from FBref through soccerdata.
- Coverage cross-check: [FBref Big Five history](https://fbref.com/en/comps/Big5/history/Big-5-European-Leagues-Seasons).
- Seasons: 2017/18 through 2024/25.
- Denominator after same-league transfer aggregation: `22,065`
  player-seasons with at least one league appearance across `40`
  league-seasons.
- One duplicated scrape group for Emanuele Torrasi, Serie A 2017/18, was
  removed before aggregation. No result was selected or removed for being
  inconvenient.
- Appearance shares, starts and minutes are normalized by the scheduled league
  matches when compared with a `34`-match fictional season.
- Top-ten tables are taken independently for each league-season, giving `400`
  scorer rows and `400` assist rows.

### Canary population

- Artifact:
  `simulation-out/phase81a-league-diversity-canary-7x10.json`.
- Profile: `phase81a-league-diversity-canary-7x10`.
- Denominator used for the top-flight comparison: `7 worlds x 10 seasons x 1
  first division = 70` league-seasons.
- The three-division aggregate remains useful as world-health evidence but is
  not used to calibrate a top-flight gate.

## Historical Team Baseline

All point quantities are on a `34`-match equivalent.

| Metric | Twenty-year mean | Historical p10 | Historical p90 | Canary first division |
|---|---:|---:|---:|---:|
| goals per match | `2.7172` | `2.4789` | `3.0331` | `2.8276` |
| draw share | `0.2559` | `0.2184` | `0.2924` | `0.2801` |
| champion points | `79.2589` | `72.3842` | `87.7158` | `66.9857` |
| last-club points | `22.4026` | `16.0000` | `29.0000` | `26.1714` |
| champion-last spread | `56.8563` | `47.0000` | `68.0000` | `40.8143` |
| between-club PPG deviation | `0.4335` | `0.3648` | `0.5065` | `0.3284` |
| fourth-place PPG | `1.7941` | `1.6302` | `1.9763` | `1.6534` |
| fourth-bottom PPG | `1.0101` | `0.9211` | `1.1053` | `1.0483` |

The canary's total goal rate is credible and its draw share is high but still
inside the twenty-year central band. The table is not: its champion is about
`12.27` points below the real mean and its champion-last spread is about
`16.04` points narrower.

This is already present in canary seasons `1-2`: champion points `66.86`, table
spread `38.14`, between-club PPG deviation `0.3189`. Seasons `8-10` improve to
`68.05`, `43.52` and `0.3483`. The observed table compression is therefore not
introduced by ten years of transfers or development, although those systems
can still influence its later magnitude.

## Historical Player-Use Baseline

The denominator is a player with at least one league appearance.

| League | Mean appearances | Mean schedule share |
|---|---:|---:|
| Premier League | `20.12` | `52.96%` |
| La Liga | `19.65` | `51.71%` |
| Serie A | `19.46` | `51.21%` |
| Bundesliga | `18.44` | `54.22%` |
| Ligue 1 | `18.36` | `51.23%` |
| Big Five pooled | `19.22` | `52.20%` |

Pooled median appearances are `20`, with p25 `9`, p75 `29` and p90 `34`.
Only `2.08%` of all player-seasons cover every scheduled match.

The canary uses `23.53` players per club-season and a player who appears plays
`22.06` of `34` matches, or `64.87%`. The real population contains at least
`28.29` distinct player-league seasons per club-season; same-season transfers
make that a lower bound for distinct club users. The canary therefore
concentrates its season on a smaller set even though its substitution count is
already credible.

For players aged `33+`, normalized to `34` matches:

| Metric | Big Five | Canary first division | Canary first division, seasons 8-10 |
|---|---:|---:|---:|
| appearances | `18.31` | `not_observed` | `not_observed` |
| starts | `14.10` | `23.86` | `24.72` |
| minutes | `1264.53` | `1963.30` | `2037.89` |

The all-player canary artifact does not retain age-banded appearance counts, so
that cell stays `not_observed`; starts and minutes are canonical recorded
facts. It must not be reconstructed as an appearance estimate.

## Historical Leader Baseline

Historical goal and assist totals are converted to a `34`-match equivalent.

| Metric | Big Five 2017-2025 | Canary first division | Canary seasons 8-10 |
|---|---:|---:|---:|
| top-ten scorer mean age | `26.62` | `29.86` | `31.00` |
| scorer rows aged 33+ | `8.00%` | `24.00%` | `47.62%` |
| top-ten assist mean age | `26.29` | `29.38` | `30.47` |
| assist rows aged 33+ | `6.50%` | `22.14%` | `43.81%` |
| top-ten scorer schedule share | `88.78%` | `91.71%` | `90.85%` |
| top-ten assist schedule share | `88.69%` | `91.54%` | `91.08%` |
| champion scorer mean goals | `25.88` | `17.80` | `18.29` |
| top-ten scorer mean goals | `16.48` | `12.91` | `12.69` |
| leading creator mean assists | `13.20` | `8.33` | `8.00` |
| top-ten creator mean assists | `9.01` | `6.30` | `6.10` |

Canary seasons `1-2` are materially different from the late career: scorer
mean age `27.91`, scorer `33+` share `2.14%`, creator mean age `27.69`, creator
`33+` share `1.43%`. The drift appears during the career.

Leader appearance shares are close to real football and the canary now has
fewer all-34 leaders than the real full-schedule share. More injuries or more
substitutions are therefore not an evidence-backed fix for leader age.

Total goals are healthy while individual leader totals are low. Goals and
assists are spread across too many players rather than missing from the world.

## Frozen Product Targets

These targets were accepted by the owner on 2026-08-09 before any corrective
implementation.

### First-division table health

- champion-point cohort mean: `72..88` on `34` matches;
- champion-last spread mean: `47..68`;
- between-club PPG deviation: `0.365..0.507`;
- goals per match: `2.48..3.03` as a non-regression band;
- draw share: `0.218..0.292` as a non-regression band;
- last-club points `16..29`, fourth-place PPG `1.63..1.98` and fourth-bottom
  PPG `0.92..1.11` remain supporting diagnostics, not independent tuning
  targets until the attribution checkpoint shows which edge owns the failure.

### Player use and renewal

- mean appearance share among players with a positive appearance: `0.48..0.58`;
- distinct users per club-season: `26..31` in the current MVP, a deliberately
  conservative band below the real lower-bound mean `28.29`;
- pooled first-division `33+` starts per selected player: `12..17`;
- pooled first-division `33+` minutes per selected player: `1100..1500`;
- existing L5 renewal gates remain: season-ten career-generated leader share
  `>= 0.30`, opening-origin share `<= 0.50`, and at least one generated leader
  per world.

### Leader age and production

- scorer top-ten mean age: `25.5..28.5`;
- assist top-ten mean age: `25.0..28.5`;
- pooled `33+` share `<= 0.12` in each table;
- at least one real-data `33+` leader remains reachable in the checkpoint
  corpus; no individual season is forced to contain one;
- mean leading scorer: `20.5..32.3` goals per `34` matches;
- mean leading creator: `9.0..18.0` assists per `34` matches;
- top-ten means: scorers `14.5..18.5`, creators `8.0..10.5`;
- existing early/late mean-age drift `<= 2.0` remains;
- no rule may read age to assign goals, assists, shooter identity or creator
  identity directly.

### Club tactical identity

- the carried four-replicated-formation retention target remains `>= 0.95`;
- an intake policy may preserve a soft club role blueprint, never assign or
  protect a formation;
- AI continues to choose its shape from current players and current state.

## What This Baseline Does Not Prove

- It does not prove that generation bands, `TeamStrength`, match conversion,
  draw resolution or transfers own table compression.
- It does not prove that old-player selection, development, intake quality or
  actor allocation owns late leader age.
- It does not authorize direct age penalties on output, direct club-tier result
  bonuses, formation locks or coefficient tuning against the same canary.
- It does not calibrate lower divisions.

Step 06B10 must attribute each deviation on canonical facts before any owner
step changes behaviour.
