# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-27
Seed prefix: `phase79-market-smoke-50x20`
Worlds: 50
Seasons per world: 20
Total seasons: 1000
Execution: parallel; workers=8; partition_hashes=9d052b1548ed4497,f3dba38cc82d1eb0,179440f525df6fda,a4d16fe826888108,cd9c0ed48cc26338,8e52bb49763090ec,497ba39352b12d51,79c217ab463f956e
Status: FAIL

## Phase 79A Acceptance Interpretation

The generic status is red only because worlds `00001` and `00046` reach the
existing `champion_streak=7` football-story boundary. That signal is outside
Phase 79A tuning and remains visible.

All Phase 79A-owned acceptance criteria pass across the exact 50-world,
20-season cohort:

- contract/finance structural violations: `0`;
- clubs below the 18-player minimum: `0`;
- clubs without a natural goalkeeper: `0`;
- committed annual wage above budget: `0`;
- permanent completions: `1,719`, with no zero-completion world;
- maximum free-agent share: `0.2274`, below the unchanged `0.25` monitor;
- maximum useful prime-age free-agent stock: `3`;
- wage pressure share: `0.1900`; exact-ceiling share: `0.0400`.

The required sequential run first exposed one final department failure in
world `00025`: a retirement left a club with zero attackers despite a
numerically valid 18-player squad. After the reproduced lifecycle correction,
the same 50 seeds were verified with eight workers; worker partitioning changes
only execution evidence, not deterministic per-world results.

Repeated final single-world output hashes:

- `00025`: `c70983aa1831399eae0108dcf80f2c1d3ab1513b788d81e64adda2a06be299a1`;
- `00041`: `5e64535b0acae9e079d7d5fd53760f21388198fbb27ba9f8e67e4633add65a98`;
- `00023`: `91f5f94faf9bdb7e7804555148ad91eae8a7e3f89d24d671443e5bc25665325c`.

Each pair was compared byte for byte.

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 33
- Goals per match average: 2.990
- Goals per match p95: 3.060
- Table spread average: 42.60
- Table spread minimum world average: 37.70
- Draw rate average: 0.240
- Draw rate maximum world average: 0.250
- Champion streak max observed: 7
- Top assist max p95: 16
- Production warning max: assists=17 top1=0.30 top3=0.55
- Age 30+ share p95: 0.17
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 2568
- Role coverage warnings p95: 56
- Youth roster max observed: 11
- Active player count min/max: senior=394..439 youth=198..198 total=592..637
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 964157323
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.8200; p90=0.9800; p95=1.0000; p99=1.0000; pressure share=0.1900; exact ceiling share=0.0400; above budget share=0.0000; reallocation exact ceiling count=629
- Annual wage headroom (minor): p10=11770000; p50=120630000
- Maximum free-agent share: 0.2274
- Maximum useful free-agent stock: 3
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=49281/13318/6580/3672; ability <8/8-9/10-11/12+=61094/11619/136/2; unattached <1/1-2/3+ seasons=6085/57164/9602
- Permanent-transfer funnel: needs=2631510; recruitable=2218109; targets=3149; unavailable=2628361; offers=3149; seller rejected/countered/accepted/expired/withdrawn=6/0/3071/61/0; player started/countered/rejected/counter-accepted=3071/0/762/0; unaffordable=0; completed=1719; lost reasons=active_talk_limit_reached=8052, club_already_handled=336120, club_cannot_recruit=69229, permanent_start_limit_reached=13775, seller_department_floor=19237, transfer_terms_unaffordable=17396, transfer_window_closed=2164552
- Preliminary-agreement funnel: candidates=160320; unavailable=2022180; offers=160320; rejected/countered/counter-accepted/counter-rejected=73138/0/0/0; agreements=23999; expired=62996; activations=16312; activation failures=6291; lost reasons=active_talk_limit_reached=1138121, club_terms_unaffordable=28512, contract_overlap=4236, current_contract_expired=3433, negotiation_deadline=59563, player_unwilling=44626, preliminary_target_unavailable=884059, unaffordable=2055
- Sampled player value min/max (minor): 23328946..367003220
- Contract lifecycle: renewals=172868; releases=15798; expiries=39885; selected expiry decisions=16374
- Warning check counts: goals_per_match_avg=21, champion_streak=13, top_assist_max=8, senior_active_player_population=7, total_active_player_population=7
- Signal check counts: monitor=35, story=21
- Failing check counts: champion_streak=2
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase79-market-smoke-50x20-world-00001` | FAIL | 19 | 11 | senior 396..421; youth 198..198; total 594..619 | 0 | 0 | 0 | structural 0; cash 988335800; wage 1.0000; free agents 0.2176; values 29221524..335862648; renew/release/expiry 3376/299/811 | 15 | avg 45.15; min 34; max 53; low season 3; champion pts 65..85; last pts 21..34; ability spread 2.47->2.40; draw rate avg/max 0.230/0.260 | season 20; A.C. Lecco; Giorgio Lombardi; assists 12; team goals 53; top1 0.23; top3 0.42; top assist Giorgio Lombardi; top scorer Enrico Tosi:19 | goals_per_match_avg | champion_streak |
| `phase79-market-smoke-50x20-world-00046` | FAIL | 18 | 11 | senior 396..429; youth 198..198; total 594..627 | 0 | 0 | 0 | structural 0; cash 971889696; wage 1.0000; free agents 0.2085; values 29429073..329424813; renew/release/expiry 3385/311/814 | 13 | avg 43.65; min 33; max 58; low season 5; champion pts 64..81; last pts 17..34; ability spread 2.51->2.90; draw rate avg/max 0.230/0.270 | season 9; A.S. Taranto; Nico Barbieri; assists 11; team goals 44; top1 0.25; top3 0.43; top assist Nico Barbieri; top scorer Luca Bonacina:14 | goals_per_match_avg | champion_streak |
| `phase79-market-smoke-50x20-world-00004` | WARN | 18 | 11 | senior 396..434; youth 198..198; total 594..632 | 0 | 0 | 0 | structural 0; cash 1050026962; wage 1.0000; free agents 0.2274; values 31133458..367003220; renew/release/expiry 3435/318/803 | 14 | avg 40.70; min 27; max 48; low season 5; champion pts 61..80; last pts 21..34; ability spread 2.72->2.32; draw rate avg/max 0.240/0.290 | season 18; A.C. Catania; Matteo Rossi; assists 11; team goals 51; top1 0.22; top3 0.43; top assist Emir Sahin; top scorer Emir Sahin:15 | goals_per_match_avg | none |
| `phase79-market-smoke-50x20-world-00011` | WARN | 19 | 11 | senior 396..428; youth 198..198; total 594..626 | 0 | 0 | 0 | structural 0; cash 1010589208; wage 1.0000; free agents 0.2263; values 31762712..310686084; renew/release/expiry 3515/344/784 | 14 | avg 42.05; min 26; max 59; low season 6; champion pts 59..83; last pts 18..36; ability spread 2.71->3.40; draw rate avg/max 0.240/0.290 | season 19; A.S.D. Pisa; Davide Benedetti; assists 10; team goals 44; top1 0.23; top3 0.41; top assist Davide Benedetti; top scorer Davide Carlini:16 | champion_streak | none |
| `phase79-market-smoke-50x20-world-00036` | WARN | 18 | 11 | senior 395..433; youth 198..198; total 593..631 | 0 | 0 | 0 | structural 0; cash 1042713905; wage 1.0000; free agents 0.2262; values 30999569..337137322; renew/release/expiry 3428/314/819 | 14 | avg 41.95; min 31; max 58; low season 4; champion pts 60..87; last pts 23..34; ability spread 2.59->3.14; draw rate avg/max 0.250/0.300 | season 8; S.S. Padova; Nico Grassi; assists 12; team goals 42; top1 0.29; top3 0.55; top assist Nico Grassi; top scorer Nico Zorzi:17 | senior_active_player_population, total_active_player_population | none |
| `phase79-market-smoke-50x20-world-00002` | WARN | 18 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | structural 0; cash 1005712107; wage 1.0000; free agents 0.2256; values 29346394..315215710; renew/release/expiry 3507/331/784 | 14 | avg 43.05; min 33; max 53; low season 4; champion pts 62..80; last pts 22..34; ability spread 2.44->2.56; draw rate avg/max 0.230/0.260 | season 4; A.C. Perugia; Hugo Moreau; assists 13; team goals 45; top1 0.29; top3 0.40; top assist Hugo Moreau; top scorer Emilio Paredes:17 | goals_per_match_avg | none |
| `phase79-market-smoke-50x20-world-00035` | WARN | 18 | 11 | senior 396..432; youth 198..198; total 594..630 | 0 | 0 | 0 | structural 0; cash 1000806780; wage 1.0000; free agents 0.2208; values 26008917..337528791; renew/release/expiry 3440/317/789 | 14 | avg 43.40; min 30; max 59; low season 5; champion pts 60..85; last pts 18..34; ability spread 2.22->2.83; draw rate avg/max 0.240/0.280 | season 18; A.C. Taranto; Lucas Moreau; assists 12; team goals 40; top1 0.30; top3 0.47; top assist Lucas Moreau; top scorer Giorgio Bini:15 | goals_per_match_avg | none |
| `phase79-market-smoke-50x20-world-00041` | WARN | 18 | 11 | senior 394..431; youth 198..198; total 592..629 | 0 | 0 | 0 | structural 0; cash 1047077824; wage 1.0000; free agents 0.2207; values 28130852..356714241; renew/release/expiry 3464/304/792 | 13 | avg 46.90; min 32; max 64; low season 6; champion pts 62..91; last pts 17..35; ability spread 2.46->2.98; draw rate avg/max 0.230/0.270 | season 19; S.S. Mantova; Oliver Bennett; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Davide Lorenzini; top scorer Matteo Villa:17 | goals_per_match_avg, champion_streak, senior_active_player_population, total_active_player_population | none |
| `phase79-market-smoke-50x20-world-00048` | WARN | 19 | 11 | senior 396..427; youth 198..198; total 594..625 | 0 | 0 | 0 | structural 0; cash 1014270548; wage 1.0000; free agents 0.2201; values 27546755..297947758; renew/release/expiry 3447/300/796 | 13 | avg 41.35; min 32; max 51; low season 6; champion pts 64..77; last pts 21..35; ability spread 2.23->2.28; draw rate avg/max 0.240/0.270 | season 5; S.S. Como; Nico Balzano; assists 10; team goals 42; top1 0.24; top3 0.50; top assist Nico Balzano; top scorer Luca Perini:16 | goals_per_match_avg | none |
| `phase79-market-smoke-50x20-world-00030` | WARN | 18 | 11 | senior 396..435; youth 198..198; total 594..633 | 0 | 0 | 0 | structural 0; cash 975067938; wage 1.0000; free agents 0.2199; values 26228983..308976070; renew/release/expiry 3472/315/830 | 16 | avg 39.25; min 27; max 55; low season 3; champion pts 61..79; last pts 24..36; ability spread 2.58->2.49; draw rate avg/max 0.250/0.300 | season 7; Catania Calcio; Nico Parisi; assists 16; team goals 69; top1 0.23; top3 0.41; top assist Nico Parisi; top scorer Enrico Arena:18 | goals_per_match_avg, top_assist_max | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase79-market-smoke-50x20-world-00038` | 17 | season 18; Pro Pisa; Nico Ferrari; assists 17; team goals 67; top1 0.25; top3 0.48; top assist Nico Ferrari; top scorer Enrico Pastore:16 | goals_per_match_avg, top_assist_max |
| `phase79-market-smoke-50x20-world-00025` | 17 | season 20; U.S. Taranto; Giorgio Lombardo; assists 10; team goals 40; top1 0.25; top3 0.42; top assist Giorgio Lombardo; top scorer Matteo Cavallini:20 | top_assist_max |
| `phase79-market-smoke-50x20-world-00040` | 16 | season 3; U.S. Cosenza; Dario Nikolic; assists 11; team goals 43; top1 0.26; top3 0.47; top assist Dario Nikolic; top scorer Marko Zoric:19 | goals_per_match_avg, top_assist_max |
| `phase79-market-smoke-50x20-world-00026` | 16 | season 5; S.S. Siena; Giorgio Carminati; assists 12; team goals 47; top1 0.26; top3 0.45; top assist Giorgio Carminati; top scorer Enrico Fiorini:13 | top_assist_max, champion_streak |
| `phase79-market-smoke-50x20-world-00030` | 16 | season 7; Catania Calcio; Nico Parisi; assists 16; team goals 69; top1 0.23; top3 0.41; top assist Nico Parisi; top scorer Enrico Arena:18 | goals_per_match_avg, top_assist_max |
| `phase79-market-smoke-50x20-world-00024` | 16 | season 14; Genoa Calcio; Milan Simic; assists 9; team goals 40; top1 0.23; top3 0.42; top assist Nico Zaccaria; top scorer Nico Castelli:20 | goals_per_match_avg, top_assist_max, champion_streak |
| `phase79-market-smoke-50x20-world-00029` | 16 | season 16; U.S. Mantova; Enrico Tosi; assists 12; team goals 54; top1 0.22; top3 0.46; top assist Enrico Tosi; top scorer Matteo Marino:18 | top_assist_max, champion_streak |
| `phase79-market-smoke-50x20-world-00031` | 16 | season 16; Pro Lucca; Nico Foschi; assists 12; team goals 56; top1 0.21; top3 0.41; top assist Nico Foschi; top scorer Matteo Tarantino:21 | goals_per_match_avg, top_assist_max |
| `phase79-market-smoke-50x20-world-00047` | 15 | season 11; F.C. Terni; Marko Tomic; assists 11; team goals 40; top1 0.28; top3 0.42; top assist Giorgio Trevisan; top scorer Davide Magnani:15 | goals_per_match_avg, champion_streak |
| `phase79-market-smoke-50x20-world-00018` | 15 | season 12; Real Parma; Nico Carbone; assists 12; team goals 47; top1 0.26; top3 0.45; top assist Nico Balzano; top scorer Dario Bozic:17 | goals_per_match_avg |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase79-market-smoke-50x20-world-00001` | 7 | S.S. Cagliari | 65..85 | 45.14 | 6 | transfer=41; squad=1635 | goals_per_match_avg |
| `phase79-market-smoke-50x20-world-00046` | 7 | S.S. Modena | 64..76 | 45.14 | 6 | transfer=31; squad=1625 | goals_per_match_avg |
| `phase79-market-smoke-50x20-world-00020` | 6 | Virtus Perugia | 65..84 | 47.50 | 8 | transfer=35; squad=1638 | champion_streak |
| `phase79-market-smoke-50x20-world-00050` | 6 | A.S.D. Catania | 69..81 | 45.33 | 6 | transfer=43; squad=1653 | goals_per_match_avg, champion_streak, senior_active_player_population, total_active_player_population |
| `phase79-market-smoke-50x20-world-00011` | 5 | A.C. Siena | 64..83 | 50.20 | 9 | transfer=30; squad=1654 | champion_streak |
| `phase79-market-smoke-50x20-world-00045` | 5 | F.C. Trento | 63..85 | 47.00 | 7 | transfer=26; squad=1622 | champion_streak |
| `phase79-market-smoke-50x20-world-00042` | 5 | A.S.D. Catania | 66..80 | 45.60 | 6 | transfer=32; squad=1640 | champion_streak |
| `phase79-market-smoke-50x20-world-00028` | 5 | F.C. Ravenna | 64..85 | 44.00 | 8 | transfer=44; squad=1629 | champion_streak |
| `phase79-market-smoke-50x20-world-00026` | 5 | U.S. Cosenza | 61..80 | 43.20 | 7 | transfer=40; squad=1585 | top_assist_max, champion_streak |
| `phase79-market-smoke-50x20-world-00024` | 4 | Real Cosenza | 73..79 | 52.50 | 8 | transfer=31; squad=1633 | goals_per_match_avg, top_assist_max, champion_streak |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase79-market-smoke-50x20-world-00012` | 37.70 | 25..55 | 58..80 | 22..36 | avg 0.240 max 0.310 | 2.24->2.62 | senior_active_player_population, total_active_player_population |
| `phase79-market-smoke-50x20-world-00005` | 38.20 | 23..58 | 58..83 | 22..35 | avg 0.240 max 0.290 | 2.24->3.05 | none |
| `phase79-market-smoke-50x20-world-00030` | 39.25 | 27..55 | 61..79 | 24..36 | avg 0.250 max 0.300 | 2.58->2.49 | goals_per_match_avg, top_assist_max |
| `phase79-market-smoke-50x20-world-00014` | 39.80 | 28..51 | 58..80 | 20..32 | avg 0.240 max 0.270 | 2.28->2.55 | champion_streak |
| `phase79-market-smoke-50x20-world-00006` | 39.90 | 20..56 | 55..81 | 19..35 | avg 0.240 max 0.280 | 2.21->2.56 | none |
| `phase79-market-smoke-50x20-world-00026` | 40.00 | 31..60 | 61..80 | 18..33 | avg 0.250 max 0.310 | 2.85->2.71 | top_assist_max, champion_streak |
| `phase79-market-smoke-50x20-world-00023` | 40.05 | 28..57 | 62..77 | 10..36 | avg 0.240 max 0.280 | 2.36->2.34 | champion_streak |
| `phase79-market-smoke-50x20-world-00038` | 40.45 | 30..57 | 61..80 | 19..34 | avg 0.240 max 0.270 | 2.35->3.43 | goals_per_match_avg, top_assist_max |
| `phase79-market-smoke-50x20-world-00050` | 40.50 | 25..60 | 61..84 | 21..36 | avg 0.230 max 0.260 | 2.18->2.77 | goals_per_match_avg, champion_streak, senior_active_player_population, total_active_player_population |
| `phase79-market-smoke-50x20-world-00004` | 40.70 | 27..48 | 61..80 | 21..34 | avg 0.240 max 0.290 | 2.72->2.32 | goals_per_match_avg |

## Market And Economy Diagnostic Worlds

### Zero Permanent Completions Despite Recruitment Needs

| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |
|---|---:|---:|---:|---:|---:|---|

### Highest Useful Free-Agent Stock

| Seed | Useful stock max | Free-agent share max |
|---|---:|---:|
| `phase79-market-smoke-50x20-world-00001` | 3 | 0.2176 |
| `phase79-market-smoke-50x20-world-00008` | 2 | 0.2083 |
| `phase79-market-smoke-50x20-world-00021` | 2 | 0.2083 |
| `phase79-market-smoke-50x20-world-00010` | 1 | 0.2273 |
| `phase79-market-smoke-50x20-world-00041` | 1 | 0.2207 |
| `phase79-market-smoke-50x20-world-00017` | 1 | 0.2185 |
| `phase79-market-smoke-50x20-world-00007` | 1 | 0.2140 |
| `phase79-market-smoke-50x20-world-00012` | 1 | 0.2109 |
| `phase79-market-smoke-50x20-world-00045` | 1 | 0.2089 |
| `phase79-market-smoke-50x20-world-00032` | 1 | 0.2074 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase79-market-smoke-50x20-world-00027` | 0.2417 | 0.0389 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00022` | 0.2333 | 0.0444 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00017` | 0.2194 | 0.0556 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00026` | 0.2139 | 0.0306 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00006` | 0.2111 | 0.0639 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00040` | 0.2083 | 0.0444 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00041` | 0.2056 | 0.0528 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00032` | 0.2056 | 0.0472 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00045` | 0.2056 | 0.0361 | 0.0000 | 1.0000 |
| `phase79-market-smoke-50x20-world-00034` | 0.2028 | 0.0750 | 0.0000 | 1.0000 |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase79-market-smoke-50x20 --worlds=50 --seasons=20 --report-output=docs/audits/TRANSFER_MARKET_79A_50X20_REPORT.md
```
