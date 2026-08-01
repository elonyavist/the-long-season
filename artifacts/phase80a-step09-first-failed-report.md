# Phase 80A Prospect And Player-Economy Bounded Gates Report

Date: 2026-08-01
Seed prefix: `phase80a-prechange-baseline`
Worlds: 20
Seasons per world: 2
Total seasons: 40
Execution: sharded; workers=7; shards=20; resumed=0; partition_hashes=80e07e9e0e265283,36606eb409b3e4ff,c3d8a954bed07cac,44a1bf609009eaa1,9e52d32d8338a036,ccd5c0fe001fdb3c,02798488caddf518,ef066903fb5dd379,211e982b5a859428,38c7bc886496b8d2,03c19bd971194387,e9e010d074a6b3c2,17b7ccb994d53c4c,2c95a51ceefb605d,065db01fb5e6802e,38bf584441c6f0ec,0e84e6b271353d8d,151e159e15e8356f,9987e477e4f906cb,2ae6475119af1572
Status: FAIL

## Aggregate Metrics

- Failed worlds: 5
- Warning worlds: 15
- Player-economy gate violations: 7
- Closing division-value fit: FAIL
- Closing checkpoint season start year: 2028
- Closing division-value observations: 25753
- Closing division-value violations: 6
- Year-10 rating-stock observations: 0/20
- Year-10 current-six maximum observed: n/a
- Year-10 stored-ceiling-six maximum observed: n/a
- Year-10 lower-tier stored-ceiling-six maximum observed: n/a
- Goals per match average: 2.930
- Goals per match p95: 3.040
- Table spread average: 36.17
- Table spread minimum world average: 27.50
- Draw rate average: 0.240
- Draw rate maximum world average: 0.270
- Champion streak max observed: 2
- Top assist max p95: 14
- Production warning max: assists=14 top1=0.25 top3=0.49
- Age 30+ share p95: 0.16
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 1800
- Role coverage warnings p95: 94
- Youth roster max observed: 11
- Active player count min/max: senior=1217..1301 youth=594..594 total=1811..1895
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 720518918
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.8800; p90=0.9800; p95=1.0000; p99=1.0000; pressure share=0.3300; exact ceiling share=0.0200; above budget share=0.0000; reallocation exact ceiling count=4
- Annual wage headroom (minor): p10=7090000; p50=187800000
- Maximum free-agent share: 0.0392
- Maximum useful free-agent stock: 0
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=1576/0/2/0; ability <8/8-9/10-11/12+=897/680/1/0; unattached <1/1-2/3+ seasons=1240/338/0
- Permanent-transfer funnel: needs=408615; recruitable=312448; targets=10108; unavailable=398507; offers=10108; seller rejected/countered/accepted/expired/withdrawn=6745/2820/3001/337/31; player started/countered/rejected/counter-accepted=2995/0/1052/0; unaffordable=31; completed=1621; lost reasons=active_talk_limit_reached=842, club_already_handled=10995, club_cannot_recruit=84330, counter_exceeds_capacity=31, implausible_downward_move=374, permanent_start_limit_reached=89709, seller_department_floor=18930, transfer_terms_unaffordable=5662, transfer_window_closed=187665
- Preliminary-agreement funnel: candidates=2100; unavailable=219303; offers=2100; rejected/countered/counter-accepted/counter-rejected=637/0/0/0; agreements=478; expired=918; activations=20; activation failures=8; lost reasons=active_talk_limit_reached=14135, club_terms_unaffordable=62, contract_overlap=7, current_contract_expired=4, negotiation_deadline=914, player_unwilling=575, preliminary_start_limit_reached=416, preliminary_target_unavailable=204752, unaffordable=1
- Permanent-transfer public values: count=1621; p50=120557800; p90=1251338600; p99=1856823500; max=8308000000
- Permanent-transfer asking prices: count=1621; p50=142284240; p90=1686924225; p99=2802928118; max=9886520000
- Permanent-transfer completed fees: count=1621; p50=130925103; p90=1543315110; p99=2586068332; max=9886520000
- Free-agent public values: count=687; p50=10030800; p90=12937200; p99=14494600; max=18238000
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 3355700..15000000000
- Contract lifecycle: renewals=5427; releases=16; expiries=22; selected expiry decisions=3
- Warning check counts: role_coverage_warning_count=20, senior_active_player_population=20, total_active_player_population=20, wage_budget_pressure_prevalence=20, youth_active_player_population=20, table_points_spread_avg=7, goals_per_match_avg=4
- Signal check counts: monitor=104, story=7
- Failing check counts: player_economy_young_stored_ceiling_six_club_uniqueness=3, player_economy_young_stored_ceiling_six_category_placement=1, table_points_spread_avg=1
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Player Economy Non-Vacuous Gates

| Gate | Observations | Violations | Failed worlds | Not evaluated worlds | Cohort proof | Threshold |
|---|---:|---:|---:|---:|---|---|
| `age_seventeen_senior_public_upside_observations` | 1556 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | descriptive age-17 senior public-upside share; positive denominator required, no frozen quota |
| `ai_information_parity_offer_selection` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_target_ranking` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_willingness` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `annual_exceptional_intake` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated -> generated -> accepted; active-stock bounds and replacement are checked from complete snapshots |
| `free_agent_zero_fee_and_value` | 687 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent |
| `hard_cap_eligibility_and_display` | 8 | 0 | 0 | 12 | matching=3 share_bps=3750 cohort_evidence=n/a cohort_minimum=n/a | positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points |
| `initial_established_current_six_stock` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs |
| `initial_exceptional_allocation` | 35640 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | established current-six 2..3; young stored-ceiling-six 4..5; lower-tier young stored-ceiling-six <=1; allocated/effective identity |
| `initial_young_stored_ceiling_six_stock` | 88 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail |
| `intrinsic_public_value_invariance_contract_expiry` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_free_agent` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_owner_category` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_promotion_relegation` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_transfer` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `negotiation_counter_path` | 2820 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required counter observations and at least one completed-after-counter path |
| `negotiation_offer_spread` | 10108 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required offers; not structural 100% asking/offer equality |
| `negotiation_seller_outcomes` | 10108 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required accepted, rejected, and countered observations |
| `public_potential_range_ordering` | 75210 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | current <= P50 <= public upper <= stored ceiling |
| `stored_ceiling_six_joint_profile` | 288 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every stored-ceiling-six observation has positive public value; asking is measured separately |
| `stored_ceiling_six_prospect_value_observations` | 188 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required positive-valued stored-ceiling-six prospect population |
| `young_stored_ceiling_prospect_share_first_division` | 4114 | 0 | 0 | 0 | matching=865 share_bps=2103 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points |
| `young_stored_ceiling_prospect_share_second_division` | 3661 | 0 | 0 | 0 | matching=532 share_bps=1453 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 800..1500 basis points |
| `young_stored_ceiling_prospect_share_third_division` | 3244 | 1 | 0 | 0 | matching=275 share_bps=848 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 400..800 basis points |
| `young_stored_ceiling_six_active_stock` | 60 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (4 or 5) |
| `young_stored_ceiling_six_category_placement` | 60 | 2 | 1 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; outside First Division <=1; every First Division placement is title_contender or playoff_contender |
| `young_stored_ceiling_six_club_uniqueness` | 60 | 4 | 3 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; <=1 associated player per club |
| `young_stored_ceiling_six_no_inflation` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target |
| `young_stored_ceiling_six_vacancy_replacement` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=12 cohort_minimum=1 | adjacent-season vacancies are replenished to the closing snapshot's deterministic target |

## Closing Checkpoint Division Public Values

This cohort is the active senior stock at the explicitly named closing season checkpoint; it is not a year-ten proxy.

| Division | Observations | Median | P90 | P99 | Maximum | Fit |
|---|---:|---:|---:|---:|---:|---|
| first_division | 9300 | 181786150 | 1266024610 | 2980455953 | 13684000000 | fail |
| second_division | 8384 | 50041000 | 226400760 | 459319663 | 2312677100 | fail |
| third_division | 8069 | 11823100 | 50207200 | 101465240 | 1170005400 | fail |

## Phase 79C Version And Replay Evidence

Exact calibration bundles:

- `{"topologyDecisionId":"fictional-three-tier-v1","playerRatingScaleVersion":"player-rating-scale-v6","playerMarketCalibrationVersion":"player-market-calibration-transfermarkt-it-2026-07-28-v2","valuationCurvesVersion":"valuation-curves-v4","askingPriceCurvesVersion":"asking-price-curves-v3","marketBehaviorCalibrationVersion":"market-behavior-calibration-v4","wageFinanceCalibrationVersion":"wage-finance-calibration-reportcalcio-2025-v1","playerDevelopmentEnvironmentVersion":"player-development-environment-v1"}`

| Seed | Initial composition hash |
|---|---|
| `phase80a-prechange-baseline-world-00001` | `6cfd6122f52a1a7f` |
| `phase80a-prechange-baseline-world-00002` | `47336bf042ea673e` |
| `phase80a-prechange-baseline-world-00003` | `82662ed6b00ddb51` |
| `phase80a-prechange-baseline-world-00004` | `04a3cd849140e3b6` |
| `phase80a-prechange-baseline-world-00005` | `105306f7dcb9f589` |
| `phase80a-prechange-baseline-world-00006` | `f9d7be9614c64f7a` |
| `phase80a-prechange-baseline-world-00007` | `757799321566e6ae` |
| `phase80a-prechange-baseline-world-00008` | `e95f8a9f88504ab7` |
| `phase80a-prechange-baseline-world-00009` | `107248d44cfd05ee` |
| `phase80a-prechange-baseline-world-00010` | `a61f7d5a1bb8d278` |
| `phase80a-prechange-baseline-world-00011` | `80c794e8c728ad0d` |
| `phase80a-prechange-baseline-world-00012` | `704041601869cca1` |
| `phase80a-prechange-baseline-world-00013` | `9c191bdecc735801` |
| `phase80a-prechange-baseline-world-00014` | `0055eab61ebb3c09` |
| `phase80a-prechange-baseline-world-00015` | `e6387eeaac351d13` |
| `phase80a-prechange-baseline-world-00016` | `e481dc19ed39bfe8` |
| `phase80a-prechange-baseline-world-00017` | `a1ab8565031248d4` |
| `phase80a-prechange-baseline-world-00018` | `8be277bbfbc4d79a` |
| `phase80a-prechange-baseline-world-00019` | `7c17292631c9d998` |
| `phase80a-prechange-baseline-world-00020` | `9fbc0fce6781978e` |

## Phase 79C Closing Division Economy

### Wage Economy

| Seed | Division | Clubs | Players | Wage P50/P90/P99 | Committed P50/P90/P99 | Utilization P50/P90/P99 | Headroom P10/P50 |
|---|---|---:|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 18 | 454 | 189540000/784035000/1777954900 | 7382115000/13480617000/14022152600 | 0.8945/0.9764/0.9989 | 156902000/929100000 |
| `phase80a-prechange-baseline-world-00001` | second_division | 18 | 417 | 52150000/139976000/222407600 | 1385100000/2149012000/2474761400 | 0.8456/0.9658/0.9899 | 64898000/186495000 |
| `phase80a-prechange-baseline-world-00001` | third_division | 18 | 408 | 11225000/28235000/40256900 | 318125000/442300000/448783000 | 0.9772/0.9925/0.9995 | 2711000/7475000 |
| `phase80a-prechange-baseline-world-00002` | first_division | 18 | 469 | 183280000/779180000/1384794800 | 8344535000/13044966000/13699645200 | 0.8723/0.9597/0.9827 | 338424000/1135155000 |
| `phase80a-prechange-baseline-world-00002` | second_division | 18 | 423 | 52390000/124784000/245945000 | 1417290000/2218142000/2478555300 | 0.8536/0.9827/0.9933 | 40766000/225780000 |
| `phase80a-prechange-baseline-world-00002` | third_division | 18 | 403 | 11520000/27736000/38063000 | 290220000/431423000/446779400 | 0.9805/1.0000/1.0000 | 0/7085000 |
| `phase80a-prechange-baseline-world-00003` | first_division | 18 | 469 | 160510000/781094000/1711659200 | 7738545000/13420236000/13905579100 | 0.8502/0.9910/0.9982 | 94684000/1348590000 |
| `phase80a-prechange-baseline-world-00003` | second_division | 18 | 423 | 49810000/129074000/257213200 | 1349575000/2444229000/2449333400 | 0.8859/0.9795/0.9946 | 49903000/148905000 |
| `phase80a-prechange-baseline-world-00003` | third_division | 18 | 401 | 11820000/28160000/38560000 | 270610000/445548000/451074100 | 0.9791/0.9987/0.9999 | 507000/6620000 |
| `phase80a-prechange-baseline-world-00004` | first_division | 18 | 468 | 174095000/798561000/1793523100 | 7256800000/13729811000/13929408400 | 0.8336/0.9845/0.9968 | 212341000/1297080000 |
| `phase80a-prechange-baseline-world-00004` | second_division | 18 | 416 | 48955000/145690000/233375000 | 1326345000/2449300000/2461370900 | 0.8569/0.9841/0.9917 | 39811000/216300000 |
| `phase80a-prechange-baseline-world-00004` | third_division | 18 | 398 | 11480000/29389000/39929000 | 284760000/445730000/450910500 | 0.9786/0.9997/1.0000 | 147000/6200000 |
| `phase80a-prechange-baseline-world-00005` | first_division | 18 | 464 | 192900000/865593000/1614375600 | 7751960000/13308745000/13680560700 | 0.8737/0.9802/0.9817 | 226304000/1207765000 |
| `phase80a-prechange-baseline-world-00005` | second_division | 18 | 415 | 56320000/145688000/228973200 | 1400550000/2390615000/2504747600 | 0.8830/0.9964/0.9989 | 8699000/198075000 |
| `phase80a-prechange-baseline-world-00005` | third_division | 18 | 409 | 11160000/29056000/40502000 | 281795000/444036000/446846300 | 0.9776/0.9982/1.0000 | 707000/6885000 |
| `phase80a-prechange-baseline-world-00006` | first_division | 18 | 473 | 170870000/836618000/1723323600 | 7980765000/13764149000/14012300100 | 0.8804/0.9832/0.9960 | 235851000/1077665000 |
| `phase80a-prechange-baseline-world-00006` | second_division | 18 | 424 | 51865000/126321000/229436700 | 1434380000/2461075000/2498682000 | 0.8743/0.9848/0.9995 | 23399000/170315000 |
| `phase80a-prechange-baseline-world-00006` | third_division | 18 | 404 | 10890000/28001000/41354600 | 285470000/441351000/447080400 | 0.9790/0.9945/0.9957 | 1560000/5985000 |
| `phase80a-prechange-baseline-world-00007` | first_division | 18 | 461 | 177580000/749260000/1971536000 | 8000920000/13764993000/13890569900 | 0.8817/0.9904/0.9988 | 119708000/1047790000 |
| `phase80a-prechange-baseline-world-00007` | second_division | 18 | 426 | 53815000/135035000/227445000 | 1373030000/2451413000/2489270900 | 0.8631/0.9911/0.9971 | 21981000/152145000 |
| `phase80a-prechange-baseline-world-00007` | third_division | 18 | 404 | 10775000/27728000/50642700 | 290535000/428874000/448461100 | 0.9757/0.9991/1.0000 | 358000/6635000 |
| `phase80a-prechange-baseline-world-00008` | first_division | 18 | 467 | 199360000/821404000/1510265000 | 7926820000/13243155000/13969015300 | 0.8618/0.9849/0.9978 | 156217000/1273180000 |
| `phase80a-prechange-baseline-world-00008` | second_division | 18 | 423 | 53540000/143224000/254352600 | 1470850000/2461880000/2517831100 | 0.9151/0.9848/0.9989 | 35852000/141520000 |
| `phase80a-prechange-baseline-world-00008` | third_division | 18 | 399 | 10620000/29878000/42122400 | 284775000/441655000/446942200 | 0.9782/0.9964/0.9997 | 1404000/6295000 |
| `phase80a-prechange-baseline-world-00009` | first_division | 18 | 455 | 179360000/839550000/1469145800 | 7936530000/13723016000/13837763800 | 0.8751/0.9815/0.9888 | 248380000/1087945000 |
| `phase80a-prechange-baseline-world-00009` | second_division | 18 | 420 | 52980000/130788000/212953200 | 1363610000/2480008000/2507583700 | 0.8674/0.9920/0.9996 | 18564000/164395000 |
| `phase80a-prechange-baseline-world-00009` | third_division | 18 | 405 | 11300000/28966000/41086800 | 291170000/442630000/448888700 | 0.9765/1.0000/1.0000 | 0/8395000 |
| `phase80a-prechange-baseline-world-00010` | first_division | 18 | 458 | 182535000/776877000/1895243200 | 8113320000/13338938000/13973164100 | 0.8868/0.9850/0.9981 | 166246000/1089910000 |
| `phase80a-prechange-baseline-world-00010` | second_division | 18 | 422 | 54420000/135448000/213280500 | 1404370000/2448549000/2489740300 | 0.8695/0.9809/0.9959 | 36779000/182110000 |
| `phase80a-prechange-baseline-world-00010` | third_division | 18 | 406 | 11325000/28795000/40715500 | 285310000/443578000/450027900 | 0.9766/0.9966/1.0000 | 1319000/7330000 |
| `phase80a-prechange-baseline-world-00011` | first_division | 18 | 462 | 165295000/733117000/2086155000 | 7281035000/13510868000/13695064200 | 0.8442/0.9729/0.9791 | 326401000/1301505000 |
| `phase80a-prechange-baseline-world-00011` | second_division | 18 | 415 | 59220000/131388000/204820800 | 1372090000/2201175000/2485506400 | 0.8952/0.9785/0.9942 | 41540000/170975000 |
| `phase80a-prechange-baseline-world-00011` | third_division | 18 | 407 | 11230000/28126000/39422400 | 282235000/427355000/448884600 | 0.9790/0.9971/1.0000 | 812000/6080000 |
| `phase80a-prechange-baseline-world-00012` | first_division | 18 | 463 | 174430000/836184000/1944000000 | 7456890000/12847029000/13883366400 | 0.8441/0.9883/0.9974 | 144684000/1311215000 |
| `phase80a-prechange-baseline-world-00012` | second_division | 18 | 409 | 53330000/141362000/231373600 | 1433795000/2425403000/2492280700 | 0.8804/0.9904/0.9969 | 15342000/197550000 |
| `phase80a-prechange-baseline-world-00012` | third_division | 18 | 408 | 11305000/29684000/40051800 | 317935000/438863000/448933800 | 0.9792/0.9994/1.0000 | 290000/5580000 |
| `phase80a-prechange-baseline-world-00013` | first_division | 18 | 467 | 185000000/664010000/1855207400 | 7549080000/13392087000/13727156500 | 0.8875/0.9803/0.9835 | 262867000/1114655000 |
| `phase80a-prechange-baseline-world-00013` | second_division | 18 | 416 | 53330000/129085000/251913000 | 1455455000/2407360000/2501008500 | 0.8969/0.9860/0.9979 | 31299000/161635000 |
| `phase80a-prechange-baseline-world-00013` | third_division | 18 | 407 | 11420000/28046000/39475400 | 311555000/447343000/449233300 | 0.9789/0.9991/0.9997 | 399000/6490000 |
| `phase80a-prechange-baseline-world-00014` | first_division | 18 | 471 | 172950000/826200000/1642685000 | 7859090000/13980549000/13999586200 | 0.8720/0.9986/1.0000 | 19451000/1119200000 |
| `phase80a-prechange-baseline-world-00014` | second_division | 18 | 414 | 56505000/142014000/215242700 | 1345865000/2468692000/2488084800 | 0.8823/0.9837/0.9952 | 36152000/133820000 |
| `phase80a-prechange-baseline-world-00014` | third_division | 18 | 403 | 10930000/28822000/40859800 | 286675000/444914000/449718100 | 0.9715/0.9995/1.0000 | 210000/8830000 |
| `phase80a-prechange-baseline-world-00015` | first_division | 18 | 466 | 202580000/772950000/1841730500 | 7535895000/13615137000/14000533500 | 0.8743/0.9793/0.9971 | 258520000/1199205000 |
| `phase80a-prechange-baseline-world-00015` | second_division | 18 | 422 | 54355000/140567000/223811200 | 1398245000/2478049000/2495694500 | 0.8700/0.9916/0.9983 | 18094000/179850000 |
| `phase80a-prechange-baseline-world-00015` | third_division | 18 | 397 | 11100000/29120000/40968000 | 302005000/444546000/449075400 | 0.9786/0.9975/0.9997 | 1126000/7625000 |
| `phase80a-prechange-baseline-world-00016` | first_division | 18 | 470 | 210935000/792112000/1612634600 | 7449210000/13881301000/13960397500 | 0.8621/0.9944/0.9972 | 74707000/1257755000 |
| `phase80a-prechange-baseline-world-00016` | second_division | 18 | 424 | 53750000/138593000/257847800 | 1416280000/2472321000/2482732200 | 0.8958/0.9889/0.9931 | 24487000/184495000 |
| `phase80a-prechange-baseline-world-00016` | third_division | 18 | 399 | 11500000/28300000/41587400 | 279055000/438030000/449128400 | 0.9674/0.9963/0.9998 | 1656000/10275000 |
| `phase80a-prechange-baseline-world-00017` | first_division | 18 | 469 | 158650000/751868000/1730664400 | 7400385000/13796378000/13886083000 | 0.8353/0.9912/0.9986 | 110123000/1369510000 |
| `phase80a-prechange-baseline-world-00017` | second_division | 18 | 419 | 58800000/139516000/236076000 | 1393185000/2404340000/2502840400 | 0.8874/0.9898/0.9987 | 24760000/165935000 |
| `phase80a-prechange-baseline-world-00017` | third_division | 18 | 407 | 11410000/27720000/42471000 | 298265000/406116000/449761000 | 0.9771/0.9983/0.9996 | 661000/8075000 |
| `phase80a-prechange-baseline-world-00018` | first_division | 18 | 469 | 170390000/805402000/2012842800 | 8121235000/13754958000/13906337400 | 0.8916/0.9871/0.9951 | 177203000/1022930000 |
| `phase80a-prechange-baseline-world-00018` | second_division | 18 | 424 | 52080000/143938000/239095900 | 1416615000/2412694000/2486816500 | 0.8689/0.9799/0.9948 | 39040000/172155000 |
| `phase80a-prechange-baseline-world-00018` | third_division | 18 | 396 | 10880000/28645000/39818500 | 280060000/409586000/449218500 | 0.9759/0.9943/1.0000 | 1533000/7205000 |
| `phase80a-prechange-baseline-world-00019` | first_division | 18 | 461 | 146070000/802760000/2341294000 | 7409685000/13807312000/13979575900 | 0.8544/0.9999/1.0000 | 763000/1211865000 |
| `phase80a-prechange-baseline-world-00019` | second_division | 18 | 416 | 51970000/141255000/268206000 | 1504955000/2463264000/2494377700 | 0.9079/0.9853/0.9978 | 36736000/174375000 |
| `phase80a-prechange-baseline-world-00019` | third_division | 18 | 405 | 11230000/29328000/40483600 | 299875000/447340000/451008900 | 0.9814/0.9993/0.9999 | 275000/3810000 |
| `phase80a-prechange-baseline-world-00020` | first_division | 18 | 464 | 191160000/751895000/1964627500 | 8001400000/12909206000/14046685400 | 0.9007/0.9833/0.9969 | 194997000/982975000 |
| `phase80a-prechange-baseline-world-00020` | second_division | 18 | 416 | 54900000/134225000/216862500 | 1322530000/2454815000/2494037300 | 0.8552/0.9819/0.9976 | 42364000/197360000 |
| `phase80a-prechange-baseline-world-00020` | third_division | 18 | 403 | 11320000/29920000/40919600 | 288360000/447110000/449592000 | 0.9721/0.9963/1.0000 | 1683000/8580000 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 30668676293.5/33979901220.4/35854494910.78 | 6800000000/11968402000/13350449799.33 | 0/129241100/386437400 | 0/976423000/2788737100 | 73/12/15 |
| `phase80a-prechange-baseline-world-00001` | second_division | 6111883907.5/7560967991.4/7751740544.93 | 1086071251/1829278045.7/2043318226.26 | 0/3632700/9398140 | 0/60536000/156629000 | 96/13/0 |
| `phase80a-prechange-baseline-world-00001` | third_division | 1320680500/1424104020.6/1536013893.92 | 140000000/300000000/300000000 | 0/0/0 | 0/0/0 | 50/14/0 |
| `phase80a-prechange-baseline-world-00002` | first_division | 31083721505/32811016922.7/37971363192.97 | 6800000000/12064376370/12503849857.06 | 4609500/54189300/148696560 | 76820000/758916000/1642184000 | 90/11/26 |
| `phase80a-prechange-baseline-world-00002` | second_division | 5998698754.5/7128563055.1/7219629840.62 | 1020000000/1500000000/1770179816.33 | 0/2755000/12010600 | 0/45920000/123728700 | 90/9/2 |
| `phase80a-prechange-baseline-world-00002` | third_division | 1307099470/1488280497.8/1607509800.7 | 139938877.5/300000000/320181679.08 | 0/987000/3568050 | 0/7050000/34082500 | 42/1/0 |
| `phase80a-prechange-baseline-world-00003` | first_division | 30987871315/35436443296.5/36761687279.63 | 7564668902/12000000000/12012681583.28 | 4381000/30961100/47511350 | 73020000/385956000/484732700 | 78/16/27 |
| `phase80a-prechange-baseline-world-00003` | second_division | 6217214881/6999962738.3/8199707348.11 | 1166547891/1500000000/2494372080.33 | 0/292800/7733030 | 0/4881000/78437000 | 87/12/0 |
| `phase80a-prechange-baseline-world-00003` | third_division | 1293060666/1470859943.8/1487789804.38 | 140000000/300000000/470822959.02 | 0/100500/3925580 | 0/1677000/28581000 | 27/5/0 |
| `phase80a-prechange-baseline-world-00004` | first_division | 30618876947/34120183578.1/35427085841.32 | 6800000000/12000000000/13511669159.52 | 1072000/71690400/80697150 | 17860000/829642000/865369100 | 83/13/31 |
| `phase80a-prechange-baseline-world-00004` | second_division | 6074352209/7291341384.1/7664915376.91 | 1180000000/1606010382.9/1992729247.42 | 0/14167000/21065740 | 0/170657000/184387900 | 83/11/0 |
| `phase80a-prechange-baseline-world-00004` | third_division | 1330847587/1406761353.4/1578218570.01 | 123107525/299202000/300000000 | 0/0/0 | 0/0/0 | 41/6/0 |
| `phase80a-prechange-baseline-world-00005` | first_division | 30392359859/34363193377.3/35520769335.85 | 6800000000/12000000000/12444887245.07 | 1962000/50845000/221555580 | 32700000/460175000/1583340800 | 76/7/21 |
| `phase80a-prechange-baseline-world-00005` | second_division | 6246013888.5/6789313264.8/7230429418 | 892567949.5/1541683194.3/1691827928.17 | 0/5498700/11848150 | 0/61875000/190251600 | 84/6/0 |
| `phase80a-prechange-baseline-world-00005` | third_division | 1303533565/1470986267.8/1513017393.63 | 145473250/300000000/300000000 | 0/0/0 | 0/0/0 | 34/6/0 |
| `phase80a-prechange-baseline-world-00006` | first_division | 30566404746.5/32518167001.2/37787353642.68 | 6800000000/11942061000/12000000000 | 2711000/24971900/62492430 | 45180000/247582000/476802400 | 72/6/30 |
| `phase80a-prechange-baseline-world-00006` | second_division | 6168897272.5/6976268276.5/7834205646.9 | 997198469/1550802963/2254625536.9 | 0/8731500/14055220 | 0/129727000/146369700 | 94/3/0 |
| `phase80a-prechange-baseline-world-00006` | third_division | 1295408124/1425959899.7/1493374635.91 | 124554904/300000000/301474115.69 | 0/0/0 | 0/0/0 | 31/6/0 |
| `phase80a-prechange-baseline-world-00007` | first_division | 30442793548/34480899543.5/39523406362.17 | 6800000000/12000000000/12000000000 | 4508500/85293900/245145940 | 75140000/771625000/1766051700 | 84/9/26 |
| `phase80a-prechange-baseline-world-00007` | second_division | 6067097584/6978717265.9/7123794461.91 | 1003204098.5/1500000000/1500000000 | 0/3654200/7143580 | 0/49997000/102840500 | 88/14/0 |
| `phase80a-prechange-baseline-world-00007` | third_division | 1323521876/1546973152.4/1642730347.48 | 145059390/300107350.5/335990081.94 | 0/164400/1366380 | 0/2742000/22776900 | 38/8/0 |
| `phase80a-prechange-baseline-world-00008` | first_division | 31029111081/35642408722.5/36113022552.6 | 7402481745.5/12000000000/12230537023.5 | 4728000/107425900/174295460 | 78805000/946249000/1670415600 | 72/12/21 |
| `phase80a-prechange-baseline-world-00008` | second_division | 6088904152.5/6919594511.2/7030859589.89 | 982287611/1500000000/1658962238.27 | 0/5820100/10686690 | 0/80267000/178111500 | 95/8/0 |
| `phase80a-prechange-baseline-world-00008` | third_division | 1329118564/1492484264.8/1520709509.7 | 144370100.5/304918877.4/362770423.87 | 0/0/0 | 0/0/0 | 32/6/0 |
| `phase80a-prechange-baseline-world-00009` | first_division | 31382395950/33435957682/34162749496.4 | 6800000000/12000000000/12000000000 | 1987000/39071300/68235220 | 33120000/618456000/819437900 | 91/12/21 |
| `phase80a-prechange-baseline-world-00009` | second_division | 6052322835/7256214685.4/9023998843.06 | 1020000000/1543172949.3/3155028483.06 | 0/398400/3058550 | 0/6642000/32091700 | 82/8/0 |
| `phase80a-prechange-baseline-world-00009` | third_division | 1308275750/1455292424.9/2106762168.74 | 128211872.5/300000000/842430832.09 | 0/0/0 | 0/0/0 | 48/6/0 |
| `phase80a-prechange-baseline-world-00010` | first_division | 30953286854.5/34565208061.9/38398800840.89 | 6800000000/12000000000/12537135409.68 | 16708500/85493800/123194730 | 147755000/1277225000/2053249900 | 83/14/20 |
| `phase80a-prechange-baseline-world-00010` | second_division | 6109434708.5/6665671356.2/6962906828.84 | 976015994/1500000000/1508409551.7 | 0/5671900/22175030 | 0/94528000/189731700 | 95/17/0 |
| `phase80a-prechange-baseline-world-00010` | third_division | 1303143774.5/1476230078.1/1532038795.65 | 140000000/299965000/300000000 | 0/0/0 | 0/0/0 | 41/8/0 |
| `phase80a-prechange-baseline-world-00011` | first_division | 30114704311/36878986449.3/38556492549.21 | 7469715962.5/12454982007/14597808616.92 | 0/59430000/278863340 | 0/594300000/2427334400 | 93/14/23 |
| `phase80a-prechange-baseline-world-00011` | second_division | 6166552060.5/6932285439.5/7062555062.24 | 998040264/1500000000/1644608272.22 | 0/6798400/9757130 | 0/90045000/125392300 | 93/13/0 |
| `phase80a-prechange-baseline-world-00011` | third_division | 1295993913.5/1539308720.6/1587555092.89 | 140006652.5/343993759.1/447255963.97 | 0/0/0 | 0/0/0 | 49/5/0 |
| `phase80a-prechange-baseline-world-00012` | first_division | 30492268364/35172600458.8/37292741524.35 | 6800000000/12000000000/12229109835.18 | 0/41143900/262822950 | 0/541107000/1901362300 | 71/11/22 |
| `phase80a-prechange-baseline-world-00012` | second_division | 6236466693.5/7309299298.5/8844541621.68 | 1106321049/1854523805.1/3257038373.38 | 0/383700/2567990 | 0/6396000/42808700 | 86/6/0 |
| `phase80a-prechange-baseline-world-00012` | third_division | 1276362880.5/1470525174.3/1587703600.41 | 114435720.5/300000000/300000000 | 0/0/0 | 0/0/0 | 49/16/0 |
| `phase80a-prechange-baseline-world-00013` | first_division | 29965207152/35289364587.8/38117816605.72 | 6800000000/12000000000/12432929446.69 | 2478500/23531100/92622770 | 41310000/392189000/798722500 | 80/5/25 |
| `phase80a-prechange-baseline-world-00013` | second_division | 6077406817.5/7112291621.5/7164527231.28 | 1020000000/1494659000/1500000000 | 0/2285300/3732560 | 0/38087000/62201600 | 84/6/1 |
| `phase80a-prechange-baseline-world-00013` | third_division | 1343747685/1464430545.2/1847325359.71 | 139720000/300000000/586184556.1 | 0/0/0 | 0/0/0 | 35/12/0 |
| `phase80a-prechange-baseline-world-00014` | first_division | 30100741360.5/35370716447.6/36905585028.94 | 6941344915/12000000000/12000000000 | 1794500/49511300/89001180 | 29910000/708295000/981269900 | 75/14/25 |
| `phase80a-prechange-baseline-world-00014` | second_division | 6086950768/6977485831.5/7146697387.59 | 1112353624/1497205005/1500000000 | 0/4149100/6230580 | 0/59654000/93959500 | 85/11/0 |
| `phase80a-prechange-baseline-world-00014` | third_division | 1356725671.5/1570395347.4/2193258187.25 | 198578840/351765071.4/905796107.25 | 0/0/0 | 0/0/0 | 52/10/0 |
| `phase80a-prechange-baseline-world-00015` | first_division | 30443569016/34708391688.3/37325284703.57 | 6800000000/12000000000/12543809874.6 | 5561500/35406300/53675710 | 92685000/527446000/864444600 | 78/7/24 |
| `phase80a-prechange-baseline-world-00015` | second_division | 6196634918.5/6705161923.2/6951968115.36 | 911476102.5/1500000000/1500000000 | 0/840700/1310300 | 0/14014000/21841100 | 81/3/0 |
| `phase80a-prechange-baseline-world-00015` | third_division | 1364985608.5/1467624768.4/1550065003.51 | 138285698/300000000/399838791.83 | 0/0/530370 | 0/0/8839500 | 50/9/0 |
| `phase80a-prechange-baseline-world-00016` | first_division | 30840976976/34510373649.8/35113816373.84 | 6839089650.5/12000000000/12000000000 | 6776500/54567200/82939830 | 112940000/571467000/889888700 | 60/9/25 |
| `phase80a-prechange-baseline-world-00016` | second_division | 6068313415/7148954482.2/9156394811.73 | 1075348608/1500000000/3292552842.6 | 0/5228200/14102330 | 0/68512000/147269100 | 85/10/0 |
| `phase80a-prechange-baseline-world-00016` | third_division | 1366055000/1589500841.7/2073273558.87 | 162841349/391472430.6/817458808.87 | 0/0/864030 | 0/0/14400500 | 63/19/1 |
| `phase80a-prechange-baseline-world-00017` | first_division | 30570435562/35301503649.8/37940569937.7 | 7042019658/12000000000/12000000000 | 5746500/29085500/406519320 | 95775000/223678000/2913779400 | 60/2/30 |
| `phase80a-prechange-baseline-world-00017` | second_division | 6147672150/6549475492.6/6655810784.07 | 860000000/1493504000/1500000000 | 0/1556300/7759870 | 0/25934000/109612000 | 90/5/0 |
| `phase80a-prechange-baseline-world-00017` | third_division | 1314276129/1428241030.2/1547857474.8 | 115994707.5/300000000/300766579.7 | 0/0/0 | 0/0/0 | 54/12/0 |
| `phase80a-prechange-baseline-world-00018` | first_division | 30451689798.5/33446362345/39636103088.43 | 6800000000/12000000000/12454981281.77 | 931000/61946000/123495260 | 15520000/549308000/966310700 | 74/14/27 |
| `phase80a-prechange-baseline-world-00018` | second_division | 6209699640.5/7056195447.6/7770642352.08 | 976852430/1567050633/2189019919.73 | 0/321000/2559020 | 0/5352000/42648700 | 87/7/0 |
| `phase80a-prechange-baseline-world-00018` | third_division | 1358090886/1535098195.3/1644599033.58 | 143250791.5/302267889/326856374.7 | 0/0/3708440 | 0/0/37084400 | 48/12/0 |
| `phase80a-prechange-baseline-world-00019` | first_division | 30463034581/35985134572.7/37957597856.55 | 6798780000/12000000000/12058892027.5 | 5813000/62641100/331915410 | 96880000/674166000/2728751000 | 70/7/21 |
| `phase80a-prechange-baseline-world-00019` | second_division | 6117811407/6937916638.9/7093239478.69 | 1095963960.5/1500000000/1500000000 | 0/4010300/6100320 | 0/58645000/63696000 | 90/4/0 |
| `phase80a-prechange-baseline-world-00019` | third_division | 1304678937.5/1443480387.4/1581865271.84 | 139260000/298229000/300000000 | 0/0/0 | 0/0/0 | 27/5/0 |
| `phase80a-prechange-baseline-world-00020` | first_division | 29982298868/34887592621.4/37625166912.46 | 6958351321/11924281000/12074125332.9 | 3992000/46479300/515566240 | 66535000/449795000/3682616000 | 90/18/21 |
| `phase80a-prechange-baseline-world-00020` | second_division | 6101558871.5/6967978102.6/7139522093.56 | 1143101663.5/1500000000/1965318397.25 | 0/11107900/32569750 | 0/140684000/246928200 | 83/10/0 |
| `phase80a-prechange-baseline-world-00020` | third_division | 1356680157.5/1522175072.5/1701057683.08 | 194429047/400170834.3/641654928.1 | 0/0/0 | 0/0/0 | 62/17/0 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00001` | first_division -> first_division | 67 | 11 | 734319200 | 991330920 | 1104267281 | player_unwilling=14, fee_below_valuation=33, stale_ownership=3, player_not_for_sale=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00001` | first_division -> second_division | 8 | 3 | 10438500 | 14035141.5 | 13569588 | fee_below_valuation=4, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> first_division | 6 | 1 | 182176850 | 257425033.5 | 176123052 | fee_below_valuation=2, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> second_division | 88 | 10 | 113023500 | 130121370 | 56343035 | player_unwilling=18, fee_below_valuation=55, stale_ownership=4 |
| `phase80a-prechange-baseline-world-00001` | second_division -> third_division | 13 | 6 | 12351300 | 11857248 | 10611630.5 | fee_below_valuation=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00001` | third_division -> third_division | 37 | 8 | 10869400 | 13224600 | 9785040 | player_unwilling=7, fee_below_valuation=17, unaffordable=2 |
| `phase80a-prechange-baseline-world-00002` | first_division -> first_division | 90 | 11 | 909685900 | 1239186116.5 | 563096282 | fee_below_valuation=59, player_unwilling=13, unaffordable=1 |
| `phase80a-prechange-baseline-world-00002` | second_division -> second_division | 81 | 7 | 156368600 | 187642320 | 165415040 | fee_below_valuation=55, player_unwilling=18 |
| `phase80a-prechange-baseline-world-00002` | second_division -> third_division | 12 | 0 | 21104050 | 19750137 | 0 | fee_below_valuation=10, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00002` | third_division -> second_division | 9 | 2 | 58911600 | 79530660 | 26892279 | fee_below_valuation=7 |
| `phase80a-prechange-baseline-world-00002` | third_division -> third_division | 30 | 1 | 16449950 | 20994600 | 7054178 | player_unwilling=2, fee_below_valuation=23 |
| `phase80a-prechange-baseline-world-00003` | first_division -> first_division | 65 | 12 | 413626700 | 623658000 | 139612866.5 | fee_below_valuation=35, player_unwilling=9, stale_ownership=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | first_division -> second_division | 5 | 3 | 10035400 | 16727414 | 33916399 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> first_division | 13 | 4 | 209578200 | 282930570 | 247092146.5 | fee_below_valuation=6, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00003` | second_division -> second_division | 75 | 7 | 149697500 | 170900325 | 129975300 | fee_below_valuation=53, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00003` | second_division -> third_division | 7 | 2 | 13019500 | 12498720 | 13853207.5 | fee_below_valuation=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | third_division -> second_division | 7 | 2 | 38751100 | 52313985 | 53662047.5 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00003` | third_division -> third_division | 20 | 3 | 10485600 | 12645967.5 | 8113780 | fee_below_valuation=14, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00004` | first_division -> first_division | 77 | 11 | 734552100 | 915223995 | 1607833595 | stale_ownership=2, fee_below_valuation=49, player_unwilling=10, player_not_for_sale=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | first_division -> second_division | 10 | 3 | 48669800 | 63818002 | 57448090 | stale_ownership=3, fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00004` | second_division -> first_division | 4 | 1 | 190999300 | 263579034 | 176939880 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00004` | second_division -> second_division | 70 | 6 | 157939700 | 237012143 | 111389919 | fee_below_valuation=46, player_unwilling=15 |
| `phase80a-prechange-baseline-world-00004` | second_division -> third_division | 6 | 0 | 30282700 | 30282700 | 0 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00004` | third_division -> first_division | 2 | 1 | 4584650 | 6326817 | 6021946 | none |
| `phase80a-prechange-baseline-world-00004` | third_division -> second_division | 3 | 2 | 9557800 | 12888648 | 19851174 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> third_division | 35 | 6 | 11199900 | 11731932 | 7100175.5 | player_unwilling=4, fee_below_valuation=20, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | first_division -> first_division | 67 | 4 | 711243500 | 1065599483 | 774946545 | fee_below_valuation=46, player_unwilling=14, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | first_division -> second_division | 2 | 0 | 97551200 | 109745100 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00005` | second_division -> first_division | 4 | 1 | 99563600 | 117597165 | 133877850 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00005` | second_division -> second_division | 76 | 6 | 164784450 | 223651560 | 78909642.5 | player_unwilling=15, fee_below_valuation=52 |
| `phase80a-prechange-baseline-world-00005` | second_division -> third_division | 3 | 2 | 11161200 | 15402456 | 13610321 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> first_division | 5 | 2 | 61089900 | 85525860 | 78482960 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> second_division | 6 | 0 | 46455550 | 58999740 | 0 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00005` | third_division -> third_division | 31 | 4 | 8881200 | 7993080 | 8303459.5 | fee_below_valuation=15, player_unwilling=8, unaffordable=2 |
| `phase80a-prechange-baseline-world-00006` | first_division -> first_division | 63 | 3 | 974752600 | 1242958500 | 134004203 | player_unwilling=12, fee_below_valuation=44, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | second_division -> first_division | 7 | 2 | 179880600 | 302943915 | 176947447 | stale_ownership=1, fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00006` | second_division -> second_division | 87 | 1 | 135346300 | 175111043 | 105066040 | fee_below_valuation=66, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00006` | second_division -> third_division | 8 | 2 | 18193000 | 20467125 | 14451374 | fee_below_valuation=5, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> first_division | 2 | 1 | 86575100 | 121907739.5 | 56957970 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> second_division | 7 | 2 | 15436600 | 17366175 | 29512336.5 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00006` | third_division -> third_division | 23 | 4 | 12969500 | 14590688 | 7726329 | fee_below_valuation=12, player_unwilling=4, unaffordable=2 |
| `phase80a-prechange-baseline-world-00007` | first_division -> first_division | 79 | 7 | 692579800 | 1090813185 | 948690172 | fee_below_valuation=55, player_unwilling=8, stale_ownership=5 |
| `phase80a-prechange-baseline-world-00007` | first_division -> second_division | 2 | 2 | 10668350 | 14778056 | 13487228 | none |
| `phase80a-prechange-baseline-world-00007` | second_division -> first_division | 4 | 1 | 99182050 | 127625393 | 20683463 | player_not_for_sale=2, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> second_division | 74 | 6 | 192467200 | 230960640 | 216525570 | fee_below_valuation=52, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00007` | second_division -> third_division | 10 | 1 | 56633850 | 58280900 | 56823850 | fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> first_division | 1 | 1 | 96695400 | 152295255 | 144680478 | none |
| `phase80a-prechange-baseline-world-00007` | third_division -> second_division | 12 | 6 | 52097450 | 59870640 | 62679746.5 | fee_below_valuation=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> third_division | 28 | 7 | 8114050 | 8598600 | 8259898 | fee_below_valuation=14, player_unwilling=4 |
| `phase80a-prechange-baseline-world-00008` | first_division -> first_division | 67 | 11 | 1002989500 | 1337676720 | 1270792860 | fee_below_valuation=36, player_unwilling=14, stale_ownership=2, unaffordable=2 |
| `phase80a-prechange-baseline-world-00008` | second_division -> first_division | 5 | 1 | 1852682600 | 2917975095 | 438256814 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00008` | second_division -> second_division | 89 | 5 | 160539000 | 216727650 | 149602844 | fee_below_valuation=68, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00008` | second_division -> third_division | 4 | 0 | 12917700 | 11625930 | 0 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00008` | third_division -> second_division | 6 | 3 | 28375300 | 34055832 | 56710560 | unaffordable=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00008` | third_division -> third_division | 28 | 6 | 13121250 | 15368963 | 9800750 | fee_below_valuation=15, player_unwilling=4 |
| `phase80a-prechange-baseline-world-00009` | first_division -> first_division | 84 | 10 | 528136400 | 685004985 | 442410738 | fee_below_valuation=47, player_unwilling=25 |
| `phase80a-prechange-baseline-world-00009` | first_division -> second_division | 5 | 4 | 19621000 | 25385650 | 25352143.5 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> first_division | 7 | 2 | 12672500 | 15707904 | 114425602.5 | stale_ownership=4, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> second_division | 74 | 4 | 161393300 | 217880955 | 302903654 | fee_below_valuation=53, player_unwilling=15 |
| `phase80a-prechange-baseline-world-00009` | second_division -> third_division | 16 | 3 | 17656700 | 17294049 | 48067382 | fee_below_valuation=12, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> second_division | 3 | 0 | 419032100 | 659975558 | 0 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> third_division | 32 | 3 | 9444300 | 12083513 | 13445788 | fee_below_valuation=18, player_unwilling=9, unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | first_division -> first_division | 77 | 11 | 966042300 | 1449915613 | 1124878964 | fee_below_valuation=46, player_unwilling=10, player_not_for_sale=1, stale_ownership=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | first_division -> second_division | 6 | 3 | 13803300 | 18503563.5 | 9030526 | stale_ownership=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00010` | second_division -> first_division | 6 | 3 | 150010350 | 247525554.5 | 64215828 | fee_below_valuation=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00010` | second_division -> second_division | 85 | 13 | 150491500 | 183829320 | 216474620 | fee_below_valuation=47, player_unwilling=14, stale_ownership=4, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00010` | second_division -> third_division | 4 | 1 | 18801150 | 23340022.5 | 12705490 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00010` | third_division -> second_division | 4 | 1 | 57910200 | 78178770 | 76224285 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00010` | third_division -> third_division | 37 | 7 | 14118900 | 16176105 | 6333262 | fee_below_valuation=21, player_unwilling=7 |
| `phase80a-prechange-baseline-world-00011` | first_division -> first_division | 92 | 13 | 745899350 | 1129215836.5 | 156677118 | fee_below_valuation=46, player_unwilling=20, stale_ownership=3, unaffordable=1 |
| `phase80a-prechange-baseline-world-00011` | first_division -> second_division | 11 | 2 | 17733600 | 19577894 | 33575981.5 | player_unwilling=3, fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00011` | second_division -> first_division | 1 | 1 | 85001900 | 109975458 | 109975458 | none |
| `phase80a-prechange-baseline-world-00011` | second_division -> second_division | 77 | 10 | 150745500 | 210755003 | 268086940 | player_unwilling=12, fee_below_valuation=52, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00011` | second_division -> third_division | 12 | 3 | 59642300 | 80517105 | 12687526 | player_unwilling=2, fee_below_valuation=7 |
| `phase80a-prechange-baseline-world-00011` | third_division -> second_division | 5 | 1 | 47422200 | 64019970 | 261834010 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00011` | third_division -> third_division | 37 | 2 | 16149400 | 18168075 | 7314722.5 | fee_below_valuation=26, player_unwilling=7 |
| `phase80a-prechange-baseline-world-00012` | first_division -> first_division | 68 | 9 | 551688500 | 591720762.5 | 290564192 | player_unwilling=15, fee_below_valuation=35, stale_ownership=3, unaffordable=3 |
| `phase80a-prechange-baseline-world-00012` | first_division -> second_division | 4 | 1 | 9913400 | 10648777 | 7981651 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00012` | second_division -> first_division | 3 | 2 | 1890280200 | 2977191315 | 1382588486 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> second_division | 80 | 5 | 177066400 | 248655420 | 342665930 | player_unwilling=16, fee_below_valuation=55 |
| `phase80a-prechange-baseline-world-00012` | second_division -> third_division | 11 | 4 | 10834400 | 11909952 | 10508143.5 | fee_below_valuation=7 |
| `phase80a-prechange-baseline-world-00012` | third_division -> second_division | 2 | 0 | 51468050 | 69481867.5 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00012` | third_division -> third_division | 38 | 12 | 8519900 | 8595143.5 | 7455009.5 | fee_below_valuation=17, player_unwilling=3, unaffordable=4 |
| `phase80a-prechange-baseline-world-00013` | first_division -> first_division | 79 | 5 | 1030363800 | 1487359913 | 1756950600 | player_unwilling=12, fee_below_valuation=58 |
| `phase80a-prechange-baseline-world-00013` | second_division -> first_division | 1 | 0 | 288373000 | 454187475 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00013` | second_division -> second_division | 81 | 6 | 137259300 | 185300055 | 238797247 | player_unwilling=12, fee_below_valuation=59 |
| `phase80a-prechange-baseline-world-00013` | second_division -> third_division | 4 | 2 | 20458550 | 21681206.5 | 21055783.5 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00013` | third_division -> second_division | 3 | 0 | 48517200 | 58220640 | 0 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00013` | third_division -> third_division | 31 | 10 | 9429800 | 9842574 | 7024803 | fee_below_valuation=16, player_unwilling=4 |
| `phase80a-prechange-baseline-world-00014` | first_division -> first_division | 61 | 9 | 512529900 | 673741080 | 581428781 | fee_below_valuation=31, player_unwilling=13, stale_ownership=5, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00014` | first_division -> second_division | 6 | 4 | 11119400 | 14220444.5 | 12630389.5 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00014` | second_division -> first_division | 12 | 4 | 49185500 | 65820660 | 65820660 | fee_below_valuation=4, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00014` | second_division -> second_division | 72 | 6 | 169920400 | 229392540 | 57586600 | player_unwilling=11, fee_below_valuation=50, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> third_division | 14 | 3 | 16664600 | 18747675 | 8594898 | fee_below_valuation=8, unaffordable=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00014` | third_division -> first_division | 2 | 1 | 359030250 | 502572036 | 920782670 | none |
| `phase80a-prechange-baseline-world-00014` | third_division -> second_division | 7 | 1 | 38466700 | 43275038 | 36879338 | fee_below_valuation=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00014` | third_division -> third_division | 38 | 7 | 11537800 | 13957552.5 | 9202965 | fee_below_valuation=22, unaffordable=1, player_unwilling=4 |
| `phase80a-prechange-baseline-world-00015` | first_division -> first_division | 77 | 7 | 762357500 | 1029182625 | 562374360 | player_unwilling=11, fee_below_valuation=56 |
| `phase80a-prechange-baseline-world-00015` | second_division -> first_division | 1 | 0 | 205186300 | 277001505 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00015` | second_division -> second_division | 80 | 3 | 136603350 | 174378210 | 144522900 | fee_below_valuation=59, player_unwilling=15 |
| `phase80a-prechange-baseline-world-00015` | second_division -> third_division | 9 | 2 | 15835300 | 17814713 | 18726732.5 | fee_below_valuation=6, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> second_division | 1 | 0 | 46612500 | 55935000 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> third_division | 41 | 7 | 11403900 | 13781232 | 13369044 | player_unwilling=8, fee_below_valuation=23, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00016` | first_division -> first_division | 54 | 6 | 525228800 | 697859213 | 151726998 | fee_below_valuation=32, stale_ownership=3, player_unwilling=9, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00016` | first_division -> second_division | 8 | 5 | 10441100 | 11526974 | 9662119 | stale_ownership=2, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00016` | second_division -> first_division | 4 | 1 | 156946500 | 243659441.5 | 4988976 | fee_below_valuation=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00016` | second_division -> second_division | 74 | 5 | 126108600 | 170871260 | 145467960 | player_unwilling=8, fee_below_valuation=57 |
| `phase80a-prechange-baseline-world-00016` | second_division -> third_division | 16 | 3 | 11412950 | 13095096 | 11723898 | fee_below_valuation=9, player_unwilling=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> first_division | 2 | 2 | 385160300 | 482870796.5 | 437125397 | none |
| `phase80a-prechange-baseline-world-00016` | third_division -> second_division | 3 | 0 | 41404800 | 49685760 | 0 | stale_ownership=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00016` | third_division -> third_division | 47 | 16 | 12202400 | 14642880 | 11248065 | stale_ownership=1, fee_below_valuation=19, player_unwilling=6, unaffordable=3 |
| `phase80a-prechange-baseline-world-00017` | first_division -> first_division | 59 | 2 | 1056541800 | 1426331430 | 541482975 | fee_below_valuation=39, player_unwilling=13, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00017` | first_division -> second_division | 1 | 1 | 27833500 | 44171765 | 41963133 | none |
| `phase80a-prechange-baseline-world-00017` | second_division -> first_division | 1 | 0 | 260167300 | 312200760 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> second_division | 86 | 4 | 143384700 | 173832547.5 | 185132329 | fee_below_valuation=70, player_unwilling=9 |
| `phase80a-prechange-baseline-world-00017` | second_division -> third_division | 10 | 1 | 9888000 | 8899200 | 8454200 | fee_below_valuation=6, player_unwilling=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> second_division | 3 | 0 | 239842400 | 285412456 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00017` | third_division -> third_division | 44 | 11 | 12356650 | 13627431.5 | 10537660 | fee_below_valuation=26, player_unwilling=5, unaffordable=2 |
| `phase80a-prechange-baseline-world-00018` | first_division -> first_division | 70 | 11 | 749926200 | 974904060 | 1159955594 | player_unwilling=18, fee_below_valuation=34, stale_ownership=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00018` | second_division -> first_division | 1 | 1 | 324803000 | 438484050 | 394635625 | none |
| `phase80a-prechange-baseline-world-00018` | second_division -> second_division | 82 | 5 | 143481500 | 198004470 | 226132110 | fee_below_valuation=57, player_unwilling=17 |
| `phase80a-prechange-baseline-world-00018` | second_division -> third_division | 16 | 4 | 29365850 | 33036581.5 | 9813996 | fee_below_valuation=10, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00018` | third_division -> first_division | 3 | 2 | 8616900 | 9332280 | 28816828 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00018` | third_division -> second_division | 5 | 2 | 10181100 | 15705269 | 54028363.5 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00018` | third_division -> third_division | 32 | 8 | 9240700 | 10240449 | 8584852 | player_unwilling=6, fee_below_valuation=16, unaffordable=2 |
| `phase80a-prechange-baseline-world-00019` | first_division -> first_division | 64 | 6 | 882754700 | 1191718845 | 266516375.5 | fee_below_valuation=39, player_unwilling=15, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00019` | first_division -> second_division | 1 | 0 | 9703200 | 10712333 | 0 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00019` | second_division -> first_division | 6 | 1 | 153200700 | 275761260 | 117328325 | fee_below_valuation=3, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00019` | second_division -> second_division | 84 | 4 | 158853500 | 217888785 | 240681119 | fee_below_valuation=60, player_unwilling=18 |
| `phase80a-prechange-baseline-world-00019` | second_division -> third_division | 5 | 3 | 11073900 | 15281982 | 14517841 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00019` | third_division -> second_division | 5 | 0 | 51461100 | 69472485 | 0 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00019` | third_division -> third_division | 22 | 2 | 12115400 | 16355790 | 17304666 | player_unwilling=9, fee_below_valuation=9, unaffordable=1 |
| `phase80a-prechange-baseline-world-00020` | first_division -> first_division | 74 | 13 | 475055100 | 589007962.5 | 460970400 | fee_below_valuation=40, player_unwilling=15, stale_ownership=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | first_division -> second_division | 1 | 0 | 29490500 | 32557512 | 0 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> first_division | 10 | 3 | 135919900 | 211015645 | 267547113 | fee_below_valuation=3, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> second_division | 76 | 8 | 165249500 | 256789733.5 | 279078997.5 | fee_below_valuation=51, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00020` | second_division -> third_division | 11 | 3 | 73325100 | 83891588 | 75502394 | fee_below_valuation=6, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00020` | third_division -> first_division | 6 | 2 | 398502900 | 474218451 | 445098501 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00020` | third_division -> second_division | 6 | 2 | 55499800 | 77699720 | 52964935 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00020` | third_division -> third_division | 51 | 14 | 8932700 | 10049288 | 7796670 | player_unwilling=7, fee_below_valuation=25, unaffordable=2 |

## Year-10 Exceptional Stock Locations

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00013` | FAIL | 18 | 11 | senior 1217..1290; youth 594..594; total 1811..1884 | 0 | 0 | 0 | structural 0; cash 811657870; wage 1.0000; free agents 0.0328; values 3496600..15000000000; renew/release/expiry 259/0/0 | 9 | avg 33.50; min 27; max 40; low season 2; champion pts 56..72; last pts 29..32; ability spread 5.40->4.93; draw rate avg/max 0.250/0.260 | season 1; A.S. Mantova; Nikola Cvetkovic; assists 8; team goals 42; top1 0.19; top3 0.35; top assist Tomas Paredes; top scorer Luca Cecchi:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | player_economy_young_stored_ceiling_six_club_uniqueness |
| `phase80a-prechange-baseline-world-00007` | FAIL | 19 | 11 | senior 1222..1291; youth 594..594; total 1816..1885 | 0 | 0 | 0 | structural 0; cash 729492112; wage 1.0000; free agents 0.0314; values 3649400..13495000000; renew/release/expiry 277/0/0 | 12 | avg 39.00; min 33; max 45; low season 1; champion pts 64..69; last pts 24..31; ability spread 5.32->4.69; draw rate avg/max 0.230/0.250 | season 1; Vicenza Calcio; Matteo Pavan; assists 10; team goals 41; top1 0.24; top3 0.49; top assist Matteo Cantini; top scorer Hugo Lefevre:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | player_economy_young_stored_ceiling_six_club_uniqueness |
| `phase80a-prechange-baseline-world-00003` | FAIL | 19 | 11 | senior 1226..1293; youth 594..594; total 1820..1887 | 0 | 0 | 0 | structural 0; cash 744000000; wage 1.0000; free agents 0.0297; values 3921400..12298000000; renew/release/expiry 273/0/2 | 12 | avg 37.00; min 29; max 45; low season 2; champion pts 60..78; last pts 31..33; ability spread 5.71->5.06; draw rate avg/max 0.230/0.240 | season 1; S.S. Modena; Luca Adami; assists 12; team goals 61; top1 0.20; top3 0.37; top assist Luca Adami; top scorer Matteo Marino:15 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | player_economy_young_stored_ceiling_six_club_uniqueness |
| `phase80a-prechange-baseline-world-00011` | FAIL | 19 | 11 | senior 1218..1284; youth 594..594; total 1812..1878 | 0 | 0 | 0 | structural 0; cash 799050837; wage 1.0000; free agents 0.0295; values 3355700..12298000000; renew/release/expiry 275/2/1 | 10 | avg 27.50; min 24; max 31; low season 2; champion pts 58..63; last pts 32..34; ability spread 5.99->5.01; draw rate avg/max 0.270/0.280 | season 1; A.S. Milan; Tomasz Horak; assists 10; team goals 54; top1 0.19; top3 0.38; top assist Tomasz Horak; top scorer Davide Ceccarelli:17 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00008` | FAIL | 18 | 11 | senior 1232..1289; youth 594..594; total 1826..1883 | 0 | 0 | 0 | structural 0; cash 836563050; wage 1.0000; free agents 0.0288; values 3507500..12760000000; renew/release/expiry 254/0/0 | 9 | avg 36.50; min 33; max 40; low season 2; champion pts 65..69; last pts 29..32; ability spread 5.95->5.29; draw rate avg/max 0.270/0.280 | season 1; Palermo Calcio; Davide Morandi; assists 7; team goals 40; top1 0.17; top3 0.40; top assist Luca Esposito; top scorer Luca Rizzo:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | player_economy_young_stored_ceiling_six_category_placement |
| `phase80a-prechange-baseline-world-00019` | WARN | 18 | 11 | senior 1220..1282; youth 594..594; total 1814..1876 | 0 | 0 | 0 | structural 0; cash 744000000; wage 1.0000; free agents 0.0392; values 3690800..12760000000; renew/release/expiry 293/0/0 | 10 | avg 36.00; min 34; max 38; low season 2; champion pts 62..65; last pts 27..28; ability spread 5.94->5.12; draw rate avg/max 0.240/0.250 | season 2; F.C. Arezzo; Giorgio Gandolfi; assists 9; team goals 52; top1 0.17; top3 0.42; top assist Giorgio Venturi; top scorer Giorgio Rinaldi:19 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00006` | WARN | 19 | 11 | senior 1230..1301; youth 594..594; total 1824..1895 | 0 | 0 | 0 | structural 0; cash 796962462; wage 1.0000; free agents 0.0373; values 3653000..13684000000; renew/release/expiry 283/1/1 | 10 | avg 37.50; min 36; max 39; low season 2; champion pts 64..65; last pts 25..29; ability spread 6.10->5.28; draw rate avg/max 0.270/0.290 | season 2; Cosenza Calcio; Nico Moro; assists 8; team goals 45; top1 0.18; top3 0.42; top assist Giorgio Anselmi; top scorer Matteo Zorzi:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00002` | WARN | 18 | 11 | senior 1231..1295; youth 594..594; total 1825..1889 | 0 | 0 | 0 | structural 0; cash 750547390; wage 1.0000; free agents 0.0341; values 3474800..12760000000; renew/release/expiry 279/1/1 | 10 | avg 41.50; min 37; max 46; low season 2; champion pts 70..73; last pts 27..33; ability spread 5.73->5.03; draw rate avg/max 0.250/0.250 | season 1; Virtus Carpi; Dario Pavlovic; assists 10; team goals 46; top1 0.22; top3 0.39; top assist Nico Piccoli; top scorer Luca Fabbri:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00017` | WARN | 20 | 11 | senior 1227..1295; youth 594..594; total 1821..1889 | 0 | 0 | 0 | structural 0; cash 779082000; wage 1.0000; free agents 0.0331; values 3451100..13684000000; renew/release/expiry 275/1/3 | 9 | avg 44.00; min 44; max 44; low season 1; champion pts 67..71; last pts 23..27; ability spread 6.10->5.22; draw rate avg/max 0.210/0.210 | season 2; A.S. Padova; Enrico Sorrentino; assists 9; team goals 46; top1 0.20; top3 0.41; top assist Enrico Sorrentino; top scorer Nikola Vukovic:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00018` | WARN | 18 | 11 | senior 1220..1289; youth 594..594; total 1814..1883 | 0 | 0 | 0 | structural 0; cash 755000000; wage 1.0000; free agents 0.0324; values 3887300..12298000000; renew/release/expiry 276/2/3 | 14 | avg 35.00; min 34; max 36; low season 1; champion pts 62..65; last pts 28..29; ability spread 5.93->5.39; draw rate avg/max 0.250/0.270 | season 1; A.C. Siena; Davide Spinelli; assists 14; team goals 55; top1 0.25; top3 0.45; top assist Davide Spinelli; top scorer Matteo Baldi:16 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase80a-prechange-baseline-world-00018` | 14 | season 1; A.C. Siena; Davide Spinelli; assists 14; team goals 55; top1 0.25; top3 0.45; top assist Davide Spinelli; top scorer Matteo Baldi:16 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00009` | 14 | season 2; Real Mantova; Nico D'Amico; assists 14; team goals 66; top1 0.21; top3 0.42; top assist Nico D'Amico; top scorer Luca Gatti:15 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 13 | season 1; U.S. Carpi; Giorgio Zaccaria; assists 13; team goals 66; top1 0.20; top3 0.41; top assist Giorgio Zaccaria; top scorer Matteo Sartori:17 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00007` | 12 | season 1; Vicenza Calcio; Matteo Pavan; assists 10; team goals 41; top1 0.24; top3 0.49; top assist Matteo Cantini; top scorer Hugo Lefevre:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 12 | season 1; S.S. Modena; Luca Adami; assists 12; team goals 61; top1 0.20; top3 0.37; top assist Luca Adami; top scorer Matteo Marino:15 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00016` | 12 | season 2; A.C. Cagliari; Davide Leoni; assists 12; team goals 62; top1 0.19; top3 0.38; top assist Davide Leoni; top scorer Emilio Sosa:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 12 | season 2; F.C. Catania; Enrico Di Matteo; assists 11; team goals 60; top1 0.18; top3 0.40; top assist Enrico Di Matteo; top scorer Enrico Capra:17 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 11 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 44; top1 0.25; top3 0.46; top assist Nico Colombo; top scorer Giorgio Abate:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 10 | season 1; Virtus Carpi; Dario Pavlovic; assists 10; team goals 46; top1 0.22; top3 0.39; top assist Nico Piccoli; top scorer Luca Fabbri:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00010` | 10 | season 2; S.S. Turin; Luka Babic; assists 9; team goals 47; top1 0.19; top3 0.38; top assist Nico Caruso; top scorer Luka Jovanovic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00017` | 2 | Pro Trento | 67..71 | 44.00 | 1 | transfer=66; squad=108 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00004` | 2 | F.C. Terni | 67..69 | 41.50 | 1 | transfer=83; squad=124 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 2 | A.S.D. Lecco | 64..65 | 37.50 | 1 | transfer=62; squad=105 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 2 | Pro Brescia | 65..69 | 36.50 | 1 | transfer=76; squad=114 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00012` | 2 | U.S. Trento | 61..62 | 33.00 | 1 | transfer=83; squad=118 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 2 | S.S. Cagliari | 58..63 | 27.50 | 1 | transfer=96; squad=131 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 1 | A.C. Terni | 73..73 | 46.00 | 2 | transfer=69; squad=113 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00016` | 1 | A.S. Florence | 75..75 | 45.00 | 2 | transfer=89; squad=125 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 1 | A.C. Matera | 78..78 | 45.00 | 2 | transfer=88; squad=123 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 1 | U.S. Parma | 67..67 | 45.00 | 2 | transfer=63; squad=99 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00011` | 27.50 | 24..31 | 58..63 | 32..34 | avg 0.270 max 0.280 | 5.99->5.01 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 30.00 | 29..31 | 61..66 | 32..35 | avg 0.240 max 0.270 | 6.31->5.39 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00010` | 31.00 | 28..34 | 60..62 | 28..32 | avg 0.250 max 0.260 | 6.21->5.24 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00005` | 31.00 | 28..34 | 64..65 | 31..36 | avg 0.210 max 0.210 | 5.62->4.95 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00009` | 32.50 | 28..37 | 63..63 | 26..35 | avg 0.220 max 0.240 | 6.39->5.55 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00012` | 33.00 | 33..33 | 61..62 | 28..29 | avg 0.240 max 0.250 | 5.96->5.22 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 33.50 | 27..40 | 56..72 | 29..32 | avg 0.250 max 0.260 | 5.40->4.93 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00018` | 35.00 | 34..36 | 62..65 | 28..29 | avg 0.250 max 0.270 | 5.93->5.39 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00019` | 36.00 | 34..38 | 62..65 | 27..28 | avg 0.240 max 0.250 | 5.94->5.12 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 36.50 | 31..42 | 66..69 | 27..35 | avg 0.220 max 0.240 | 5.74->5.04 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Market And Economy Diagnostic Worlds

### Zero Permanent Completions Despite Recruitment Needs

| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |
|---|---:|---:|---:|---:|---:|---|

### Highest Useful Free-Agent Stock

| Seed | Useful stock max | Free-agent share max |
|---|---:|---:|
| `phase80a-prechange-baseline-world-00019` | 0 | 0.0392 |
| `phase80a-prechange-baseline-world-00006` | 0 | 0.0373 |
| `phase80a-prechange-baseline-world-00002` | 0 | 0.0341 |
| `phase80a-prechange-baseline-world-00017` | 0 | 0.0331 |
| `phase80a-prechange-baseline-world-00013` | 0 | 0.0328 |
| `phase80a-prechange-baseline-world-00005` | 0 | 0.0324 |
| `phase80a-prechange-baseline-world-00018` | 0 | 0.0324 |
| `phase80a-prechange-baseline-world-00012` | 0 | 0.0320 |
| `phase80a-prechange-baseline-world-00010` | 0 | 0.0319 |
| `phase80a-prechange-baseline-world-00007` | 0 | 0.0314 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase80a-prechange-baseline-world-00019` | 0.3796 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00007` | 0.3796 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00012` | 0.3796 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00017` | 0.3611 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00020` | 0.3611 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00005` | 0.3519 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00016` | 0.3519 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00018` | 0.3426 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00003` | 0.3426 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00004` | 0.3333 | 0.0185 | 0.0000 | 1.0000 |

## Reproduction

Run the same gate with:

```bash
nvm use 24
pnpm cli ten-season-report --seed-prefix=phase80a-prechange-baseline --worlds=20 --seasons=2 --checkpoint-dir=<checkpoint-directory> --shards=20 --workers=7 --report-output=artifacts/phase80a-step09-report.md
```
