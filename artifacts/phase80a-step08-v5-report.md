# Phase 80A Prospect And Player-Economy Bounded Gates Report

Date: 2026-08-01
Seed prefix: `phase80a-prechange-baseline`
Worlds: 20
Seasons per world: 2
Total seasons: 40
Execution: sharded; workers=7; shards=20; resumed=0; partition_hashes=b7e223f2f60be750,c2c31b8299cce2a0,4df28208ba3e8d94,e88477f6ca68c922,2b30ba5f6601ca3c,6899d68d4375dd61,97b86117b910bf15,c304fb52d9ee1038,f6f3c4642ffb8775,e1c736f82f125fae,33e64028f1dba66c,9c4beba8e084178f,bbba942a976a4fee,14cfb68324b5966e,25deb72a6ad251e8,29ecd94de343a84f,a77a39b325156d91,81753be2d9a6d87a,09fe3fc219502450,6a65e23a35481637
Status: FAIL

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 18
- Player-economy gate violations: 0
- Closing division-value fit: FAIL
- Closing checkpoint season start year: 2028
- Closing division-value observations: 25769
- Closing division-value violations: 1
- Year-10 rating-stock observations: 0/20
- Year-10 current-six maximum observed: n/a
- Year-10 stored-ceiling-six maximum observed: n/a
- Year-10 lower-tier stored-ceiling-six maximum observed: n/a
- Goals per match average: 2.910
- Goals per match p95: 3.030
- Table spread average: 34.88
- Table spread minimum world average: 27.00
- Draw rate average: 0.240
- Draw rate maximum world average: 0.280
- Champion streak max observed: 2
- Top assist max p95: 13
- Production warning max: assists=13 top1=0.24 top3=0.48
- Age 30+ share p95: 0.16
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 1787
- Role coverage warnings p95: 93
- Youth roster max observed: 11
- Active player count min/max: senior=1215..1302 youth=594..594 total=1809..1896
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 722287931
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.8700; p90=0.9800; p95=1.0000; p99=1.0000; pressure share=0.3200; exact ceiling share=0.0200; above budget share=0.0000; reallocation exact ceiling count=1
- Annual wage headroom (minor): p10=6800000; p50=218740000
- Maximum free-agent share: 0.0402
- Maximum useful free-agent stock: 0
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=1624/0/4/0; ability <8/8-9/10-11/12+=920/707/0/1; unattached <1/1-2/3+ seasons=1278/350/0
- Permanent-transfer funnel: needs=411429; recruitable=311195; targets=10124; unavailable=401305; offers=10124; seller rejected/countered/accepted/expired/withdrawn=6778/2760/2927/374/48; player started/countered/rejected/counter-accepted=2924/0/1067/0; unaffordable=48; completed=1559; lost reasons=active_talk_limit_reached=756, club_already_handled=11113, club_cannot_recruit=88365, counter_exceeds_capacity=48, implausible_downward_move=357, permanent_start_limit_reached=91005, seller_department_floor=18352, transfer_terms_unaffordable=5341, transfer_window_closed=186016
- Preliminary-agreement funnel: candidates=2020; unavailable=217447; offers=2020; rejected/countered/counter-accepted/counter-rejected=578/0/0/0; agreements=471; expired=916; activations=21; activation failures=7; lost reasons=active_talk_limit_reached=14776, club_terms_unaffordable=37, contract_overlap=7, current_contract_expired=5, negotiation_deadline=911, player_unwilling=541, preliminary_start_limit_reached=184, preliminary_target_unavailable=202487
- Permanent-transfer public values: count=1559; p50=111983700; p90=1354982000; p99=2612040700; max=3707123300
- Permanent-transfer asking prices: count=1559; p50=130535020; p90=1628966640; p99=3327840540; max=5755308923
- Permanent-transfer completed fees: count=1559; p50=121196940; p90=1516624763; p99=3078023615; max=5755308923
- Free-agent public values: count=700; p50=10767800; p90=15014900; p99=30559500; max=49806700
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 3241400..15000000000
- Contract lifecycle: renewals=5450; releases=16; expiries=25; selected expiry decisions=3
- Warning check counts: role_coverage_warning_count=20, senior_active_player_population=20, total_active_player_population=20, wage_budget_pressure_prevalence=20, youth_active_player_population=20, table_points_spread_avg=11, goals_per_match_avg=4
- Signal check counts: monitor=104, story=11
- Failing check counts: table_points_spread_avg=2
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Player Economy Non-Vacuous Gates

| Gate | Observations | Violations | Failed worlds | Not evaluated worlds | Cohort proof | Threshold |
|---|---:|---:|---:|---:|---|---|
| `age_seventeen_senior_public_upside_observations` | 1556 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | descriptive age-17 senior public-upside share; positive denominator required, no frozen quota |
| `ai_information_parity_offer_selection` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_target_ranking` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_willingness` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `annual_exceptional_intake` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated -> generated -> accepted; active-stock bounds and replacement are checked from complete snapshots |
| `free_agent_zero_fee_and_value` | 700 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent |
| `hard_cap_eligibility_and_display` | 8 | 0 | 0 | 12 | matching=3 share_bps=3750 cohort_evidence=n/a cohort_minimum=n/a | positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points |
| `initial_established_current_six_stock` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs |
| `initial_exceptional_allocation` | 35640 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | established current-six 2..3; young stored-ceiling-six 4..5; lower-tier young stored-ceiling-six <=1; allocated/effective identity |
| `initial_young_stored_ceiling_six_stock` | 88 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail |
| `intrinsic_public_value_invariance_contract_expiry` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_free_agent` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_owner_category` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_promotion_relegation` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_transfer` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `negotiation_counter_path` | 2760 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required counter observations and at least one completed-after-counter path |
| `negotiation_offer_spread` | 10124 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required offers; not structural 100% asking/offer equality |
| `negotiation_seller_outcomes` | 10124 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required accepted, rejected, and countered observations |
| `public_potential_range_ordering` | 75210 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | current <= P50 <= public upper <= stored ceiling |
| `stored_ceiling_six_joint_profile` | 288 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every stored-ceiling-six observation has positive public value; asking is measured separately |
| `stored_ceiling_six_prospect_value_observations` | 188 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required positive-valued stored-ceiling-six prospect population |
| `young_stored_ceiling_prospect_share_first_division` | 4130 | 0 | 0 | 0 | matching=864 share_bps=2092 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points |
| `young_stored_ceiling_prospect_share_second_division` | 3638 | 0 | 0 | 0 | matching=493 share_bps=1355 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 800..1500 basis points |
| `young_stored_ceiling_prospect_share_third_division` | 3273 | 0 | 0 | 0 | matching=217 share_bps=663 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 400..800 basis points |
| `young_stored_ceiling_six_active_stock` | 60 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (4 or 5) |
| `young_stored_ceiling_six_no_inflation` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target |
| `young_stored_ceiling_six_stock_arrival_category_placement` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals; outside First Division <=1; every introduced First Division placement is title_contender or playoff_contender |
| `young_stored_ceiling_six_stock_arrival_club_uniqueness` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals introduce <=1 associated player per club; later market concentration remains descriptive |
| `young_stored_ceiling_six_vacancy_replacement` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=12 cohort_minimum=1 | adjacent-season vacancies are replenished to the closing snapshot's deterministic target |

## Closing Checkpoint Division Public Values

This cohort is the active senior stock at the explicitly named closing season checkpoint; it is not a year-ten proxy.

| Division | Observations | Median | P90 | P99 | Maximum | Fit |
|---|---:|---:|---:|---:|---:|---|
| first_division | 9312 | 255120950 | 1975896300 | 4809528155 | 13684000000 | fail |
| second_division | 8358 | 47289000 | 212041900 | 442540504 | 1170279800 | pass |
| third_division | 8099 | 11756800 | 43261800 | 92442222 | 460294400 | pass |

## Phase 79C Version And Replay Evidence

Exact calibration bundles:

- `{"topologyDecisionId":"fictional-three-tier-v1","playerRatingScaleVersion":"player-rating-scale-v7","playerMarketCalibrationVersion":"player-market-calibration-transfermarkt-it-2026-07-28-v2","valuationCurvesVersion":"valuation-curves-v5","askingPriceCurvesVersion":"asking-price-curves-v4","marketBehaviorCalibrationVersion":"market-behavior-calibration-v5","wageFinanceCalibrationVersion":"wage-finance-calibration-reportcalcio-2025-v1","playerDevelopmentEnvironmentVersion":"player-development-environment-v1"}`

| Seed | Initial composition hash |
|---|---|
| `phase80a-prechange-baseline-world-00001` | `0a3b84052e3fdcc2` |
| `phase80a-prechange-baseline-world-00002` | `7061a5a7c6233657` |
| `phase80a-prechange-baseline-world-00003` | `c759158728176a61` |
| `phase80a-prechange-baseline-world-00004` | `49be83d892732961` |
| `phase80a-prechange-baseline-world-00005` | `1ba2bf3027ca2927` |
| `phase80a-prechange-baseline-world-00006` | `c40c95e0c2332e4a` |
| `phase80a-prechange-baseline-world-00007` | `d4060b821d65f31c` |
| `phase80a-prechange-baseline-world-00008` | `91b7de40279a69e0` |
| `phase80a-prechange-baseline-world-00009` | `4bf8a9e55e649462` |
| `phase80a-prechange-baseline-world-00010` | `05677a616799ffdf` |
| `phase80a-prechange-baseline-world-00011` | `6f00fcc2c76550d3` |
| `phase80a-prechange-baseline-world-00012` | `61c09f374243439f` |
| `phase80a-prechange-baseline-world-00013` | `72e5acae7d7ff283` |
| `phase80a-prechange-baseline-world-00014` | `d872b02b62ded453` |
| `phase80a-prechange-baseline-world-00015` | `314d6f86bc573265` |
| `phase80a-prechange-baseline-world-00016` | `80adf02db5392f20` |
| `phase80a-prechange-baseline-world-00017` | `a729084a7f168e18` |
| `phase80a-prechange-baseline-world-00018` | `500a62227cf6f4fd` |
| `phase80a-prechange-baseline-world-00019` | `0fa32a461fa37d97` |
| `phase80a-prechange-baseline-world-00020` | `b95ae7e4c3dfe804` |

## Phase 79C Closing Division Economy

### Wage Economy

| Seed | Division | Clubs | Players | Wage P50/P90/P99 | Committed P50/P90/P99 | Utilization P50/P90/P99 | Headroom P10/P50 |
|---|---|---:|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 18 | 460 | 172675000/826884000/1787889200 | 7656480000/12944830000/13952358400 | 0.8653/0.9787/0.9966 | 273136000/1300380000 |
| `phase80a-prechange-baseline-world-00001` | second_division | 18 | 413 | 50040000/143172000/226677200 | 1307985000/2167298000/2464716300 | 0.8190/0.9828/0.9872 | 43027000/264885000 |
| `phase80a-prechange-baseline-world-00001` | third_division | 18 | 407 | 11340000/27848000/39261600 | 294150000/442293000/448783000 | 0.9752/0.9988/0.9995 | 484000/7745000 |
| `phase80a-prechange-baseline-world-00002` | first_division | 18 | 472 | 162355000/802324000/1652055100 | 7795360000/12996770000/13783985300 | 0.8455/0.9671/0.9872 | 329492000/1356355000 |
| `phase80a-prechange-baseline-world-00002` | second_division | 18 | 423 | 51770000/132570000/250895200 | 1301870000/2316082000/2471486800 | 0.8472/0.9797/0.9886 | 48667000/223340000 |
| `phase80a-prechange-baseline-world-00002` | third_division | 18 | 404 | 11225000/27689000/38315500 | 282780000/445199000/448304600 | 0.9776/0.9985/0.9998 | 564000/6010000 |
| `phase80a-prechange-baseline-world-00003` | first_division | 18 | 468 | 159000000/807367000/2232731500 | 7590880000/13305166000/13952146800 | 0.8933/0.9824/0.9978 | 203388000/941390000 |
| `phase80a-prechange-baseline-world-00003` | second_division | 18 | 421 | 52480000/139410000/245368000 | 1359205000/2444893000/2488111700 | 0.8499/0.9809/0.9958 | 39151000/223935000 |
| `phase80a-prechange-baseline-world-00003` | third_division | 18 | 406 | 12250000/28240000/38542500 | 298610000/442051000/450446300 | 0.9779/0.9978/0.9993 | 971000/7770000 |
| `phase80a-prechange-baseline-world-00004` | first_division | 18 | 468 | 157630000/888682000/2091552700 | 7700880000/13545318000/14020472200 | 0.8782/0.9675/0.9986 | 361162000/1020245000 |
| `phase80a-prechange-baseline-world-00004` | second_division | 18 | 413 | 49180000/146050000/229906400 | 1256620000/2332125000/2455391100 | 0.8353/0.9810/0.9904 | 35110000/223380000 |
| `phase80a-prechange-baseline-world-00004` | third_division | 18 | 401 | 11220000/29120000/39970000 | 300840000/443487000/450869500 | 0.9633/0.9992/1.0000 | 350000/12060000 |
| `phase80a-prechange-baseline-world-00005` | first_division | 18 | 461 | 193470000/879570000/1810758000 | 7739775000/13472656000/13771678700 | 0.8644/0.9623/0.9837 | 341956000/1266190000 |
| `phase80a-prechange-baseline-world-00005` | second_division | 18 | 418 | 53595000/145110000/228992400 | 1387595000/2401415000/2512455700 | 0.9108/0.9840/0.9982 | 33632000/167575000 |
| `phase80a-prechange-baseline-world-00005` | third_division | 18 | 411 | 11080000/28870000/41572000 | 280545000/444705000/447009500 | 0.9868/0.9959/0.9999 | 1234000/4825000 |
| `phase80a-prechange-baseline-world-00006` | first_division | 18 | 473 | 157120000/840386000/2131078800 | 7402215000/13256798000/13932577200 | 0.8747/0.9640/0.9945 | 404346000/1123060000 |
| `phase80a-prechange-baseline-world-00006` | second_division | 18 | 421 | 53210000/129740000/231720000 | 1359985000/2380231000/2479403000 | 0.8460/0.9781/0.9918 | 47488000/242145000 |
| `phase80a-prechange-baseline-world-00006` | third_division | 18 | 408 | 10975000/28503000/41366700 | 283480000/447639000/449760500 | 0.9862/1.0000/1.0000 | 7000/3865000 |
| `phase80a-prechange-baseline-world-00007` | first_division | 18 | 463 | 155110000/802532000/2281474200 | 7844785000/13735204000/13789162800 | 0.8702/0.9826/0.9943 | 192797000/1278650000 |
| `phase80a-prechange-baseline-world-00007` | second_division | 18 | 418 | 53880000/139914000/234588500 | 1437910000/2317391000/2486192500 | 0.8884/0.9799/0.9945 | 45491000/222110000 |
| `phase80a-prechange-baseline-world-00007` | third_division | 18 | 406 | 11270000/28575000/48002000 | 300605000/448619000/449774900 | 0.9795/0.9999/1.0000 | 47000/5715000 |
| `phase80a-prechange-baseline-world-00008` | first_division | 18 | 470 | 178525000/825772000/1871659900 | 8162235000/14000282000/14049650800 | 0.8854/0.9993/1.0000 | 9680000/1037765000 |
| `phase80a-prechange-baseline-world-00008` | second_division | 18 | 416 | 53775000/146010000/221381000 | 1379110000/2447766000/2511682800 | 0.8587/0.9847/0.9997 | 32994000/209155000 |
| `phase80a-prechange-baseline-world-00008` | third_division | 18 | 405 | 10440000/30146000/44632000 | 300900000/440588000/447324800 | 0.9792/0.9952/0.9981 | 1767000/4805000 |
| `phase80a-prechange-baseline-world-00009` | first_division | 18 | 458 | 152725000/880708000/1973471100 | 7929000000/13723429000/13973844000 | 0.8762/0.9802/0.9967 | 277693000/1200580000 |
| `phase80a-prechange-baseline-world-00009` | second_division | 18 | 419 | 56930000/133880000/214771200 | 1277165000/2444392000/2507773000 | 0.8268/0.9854/0.9997 | 26460000/219515000 |
| `phase80a-prechange-baseline-world-00009` | third_division | 18 | 402 | 11375000/28596000/41094000 | 268415000/443321000/449157300 | 0.9791/0.9988/1.0000 | 553000/6765000 |
| `phase80a-prechange-baseline-world-00010` | first_division | 18 | 462 | 161775000/828012000/1920152300 | 8063250000/13481117000/13931034600 | 0.8775/0.9629/0.9951 | 518883000/1280775000 |
| `phase80a-prechange-baseline-world-00010` | second_division | 18 | 423 | 52450000/135660000/217500400 | 1483835000/2459780000/2493236200 | 0.8806/0.9941/0.9978 | 13912000/206245000 |
| `phase80a-prechange-baseline-world-00010` | third_division | 18 | 405 | 10920000/28394000/41215200 | 283005000/405154000/448400200 | 0.9747/0.9939/0.9998 | 2370000/9130000 |
| `phase80a-prechange-baseline-world-00011` | first_division | 18 | 461 | 163900000/738600000/2089800000 | 6989265000/13733586000/13870485300 | 0.8919/0.9810/0.9907 | 266414000/990065000 |
| `phase80a-prechange-baseline-world-00011` | second_division | 18 | 415 | 56630000/133568000/205050800 | 1310450000/2202274000/2476687200 | 0.8396/0.9797/0.9907 | 43923000/238950000 |
| `phase80a-prechange-baseline-world-00011` | third_division | 18 | 410 | 10955000/27573000/40551600 | 272765000/443110000/453025300 | 0.9722/0.9998/1.0000 | 91000/7910000 |
| `phase80a-prechange-baseline-world-00012` | first_division | 18 | 464 | 164305000/846626000/1971972000 | 7802955000/13287905000/13849480900 | 0.8943/0.9807/0.9907 | 249751000/1056940000 |
| `phase80a-prechange-baseline-world-00012` | second_division | 18 | 411 | 56670000/141970000/224230000 | 1468265000/2294408000/2449879300 | 0.8569/0.9798/0.9899 | 44078000/225370000 |
| `phase80a-prechange-baseline-world-00012` | third_division | 18 | 405 | 11220000/29604000/40226800 | 326100000/439217000/448905600 | 0.9838/0.9989/1.0000 | 493000/4485000 |
| `phase80a-prechange-baseline-world-00013` | first_division | 18 | 465 | 165390000/777228000/1956069600 | 7603695000/13502743000/13987813400 | 0.8268/0.9855/0.9991 | 176727000/1398925000 |
| `phase80a-prechange-baseline-world-00013` | second_division | 18 | 423 | 52400000/135374000/233329600 | 1304310000/2454099000/2489372700 | 0.8649/0.9873/0.9958 | 30321000/180080000 |
| `phase80a-prechange-baseline-world-00013` | third_division | 18 | 405 | 11350000/27656000/40591200 | 310410000/442894000/449412900 | 0.9793/0.9998/1.0000 | 82000/5355000 |
| `phase80a-prechange-baseline-world-00014` | first_division | 18 | 467 | 161070000/863412000/2056386600 | 8135065000/13765948000/13987997500 | 0.8564/0.9955/0.9993 | 60345000/1202875000 |
| `phase80a-prechange-baseline-world-00014` | second_division | 18 | 416 | 52520000/138515000/218044000 | 1300910000/2451114000/2488254800 | 0.8512/0.9799/0.9942 | 42990000/226695000 |
| `phase80a-prechange-baseline-world-00014` | third_division | 18 | 402 | 11130000/29139000/41709400 | 282225000/440066000/448486800 | 0.9780/0.9996/1.0000 | 168000/7145000 |
| `phase80a-prechange-baseline-world-00015` | first_division | 18 | 467 | 167960000/814252000/2092155800 | 8002050000/13809168000/13965155800 | 0.8701/0.9864/0.9975 | 190832000/1263385000 |
| `phase80a-prechange-baseline-world-00015` | second_division | 18 | 422 | 54220000/141746000/224838200 | 1323460000/2447464000/2495908800 | 0.8355/0.9924/0.9984 | 16416000/212340000 |
| `phase80a-prechange-baseline-world-00015` | third_division | 18 | 396 | 11135000/28935000/41010000 | 310290000/444150000/447556200 | 0.9676/0.9972/1.0000 | 1081000/8375000 |
| `phase80a-prechange-baseline-world-00016` | first_division | 18 | 470 | 174425000/807669000/2074169100 | 7841940000/13889254000/13980693400 | 0.8655/0.9921/0.9986 | 110746000/1345085000 |
| `phase80a-prechange-baseline-world-00016` | second_division | 18 | 417 | 54400000/139148000/251172400 | 1260555000/2471461000/2480911800 | 0.8275/0.9906/0.9986 | 23572000/201710000 |
| `phase80a-prechange-baseline-world-00016` | third_division | 18 | 399 | 11430000/27912000/39866200 | 261785000/443452000/448796400 | 0.9538/0.9932/0.9973 | 1851000/13660000 |
| `phase80a-prechange-baseline-world-00017` | first_division | 18 | 472 | 140475000/821006000/2074591700 | 8433720000/13694978000/13963121000 | 0.8494/0.9896/1.0000 | 97320000/1376415000 |
| `phase80a-prechange-baseline-world-00017` | second_division | 18 | 418 | 57330000/138353000/205248300 | 1426710000/2413359000/2502520800 | 0.8776/0.9819/0.9979 | 39979000/199040000 |
| `phase80a-prechange-baseline-world-00017` | third_division | 18 | 406 | 11575000/27555000/40265500 | 282615000/403937000/449395100 | 0.9688/0.9975/0.9998 | 615000/9020000 |
| `phase80a-prechange-baseline-world-00018` | first_division | 18 | 470 | 164875000/828636000/2045492700 | 8077625000/13499470000/13839888300 | 0.8695/0.9730/0.9887 | 333173000/1081740000 |
| `phase80a-prechange-baseline-world-00018` | second_division | 18 | 419 | 51420000/144996000/222628200 | 1401425000/2462132000/2501152400 | 0.8467/0.9849/0.9996 | 37868000/249985000 |
| `phase80a-prechange-baseline-world-00018` | third_division | 18 | 402 | 10835000/28432000/42055000 | 297700000/432076000/444258500 | 0.9798/0.9991/1.0000 | 302000/8480000 |
| `phase80a-prechange-baseline-world-00019` | first_division | 18 | 462 | 148920000/831989000/2636870700 | 7861430000/13957959000/14002116200 | 0.8540/0.9970/0.9996 | 42041000/1219730000 |
| `phase80a-prechange-baseline-world-00019` | second_division | 18 | 416 | 52875000/142905000/224754000 | 1462875000/2461911000/2495348400 | 0.8511/0.9914/0.9993 | 20684000/206710000 |
| `phase80a-prechange-baseline-world-00019` | third_division | 18 | 410 | 10925000/28856000/40471200 | 289560000/442275000/450285700 | 0.9792/0.9949/0.9990 | 2061000/5645000 |
| `phase80a-prechange-baseline-world-00020` | first_division | 18 | 459 | 171040000/799406000/2310994800 | 8727060000/12890648000/14033382200 | 0.8898/0.9942/0.9991 | 65771000/1217770000 |
| `phase80a-prechange-baseline-world-00020` | second_division | 18 | 416 | 53585000/136485000/216882500 | 1243575000/2470736000/2494986600 | 0.8251/0.9883/0.9980 | 29264000/243120000 |
| `phase80a-prechange-baseline-world-00020` | third_division | 18 | 409 | 11040000/29368000/40968800 | 277880000/442758000/447200300 | 0.9780/1.0000/1.0000 | 0/6065000 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 30224888142.5/34562477789.6/37157169521.04 | 6536152148.5/12000000000/16808793811.72 | 0/60810800/318713050 | 0/563753000/2322121500 | 74/20/17 |
| `phase80a-prechange-baseline-world-00001` | second_division | 6158075969.5/7583192264.2/7794232700.04 | 1180647321/1922492364.2/2442746160.04 | 0/4083400/6539030 | 0/68055000/108988300 | 90/8/0 |
| `phase80a-prechange-baseline-world-00001` | third_division | 1313489796.5/1461412143.7/1558125751.57 | 140000000/300000000/301534396.1 | 0/833100/3289110 | 0/8331000/32891100 | 50/8/0 |
| `phase80a-prechange-baseline-world-00002` | first_division | 31349289146.5/34933867639.2/40277266863.5 | 6860220714/12636406588.9/13398017158.45 | 2409000/37164000/153110650 | 40155000/448715000/1675200900 | 80/7/27 |
| `phase80a-prechange-baseline-world-00002` | second_division | 6091973404.5/7150541974.3/7219803613.19 | 1020000000/1565848661.1/1740025257.49 | 0/3801300/17687180 | 0/56816000/156264000 | 92/7/2 |
| `phase80a-prechange-baseline-world-00002` | third_division | 1315552793.5/1559325421.9/1571479953.81 | 140000000/300000000/300000000 | 0/0/5283780 | 0/0/37740100 | 38/2/0 |
| `phase80a-prechange-baseline-world-00003` | first_division | 31492202622.5/33413396630.3/35256191591.24 | 6800000000/12000000000/12252055120.44 | 7387000/77531600/318238120 | 123115000/704360000/2432671800 | 74/14/27 |
| `phase80a-prechange-baseline-world-00003` | second_division | 6034259465.5/6924896694.7/7442555955.08 | 1099851404.5/1506680308.5/1535243895.08 | 0/3887100/8503340 | 0/64785000/90721600 | 82/8/0 |
| `phase80a-prechange-baseline-world-00003` | third_division | 1294341853/1551134660.7/3167820902.52 | 122801267.5/347810135.9/2157502942.52 | 0/0/3748280 | 0/0/26775800 | 59/12/0 |
| `phase80a-prechange-baseline-world-00004` | first_division | 30365775089.5/34773310549/37031119104.18 | 6589019222/12000000000/12023099163.94 | 0/37068900/150538010 | 0/507851000/1143032500 | 80/9/31 |
| `phase80a-prechange-baseline-world-00004` | second_division | 6212870469.5/7059478220.7/7213056177.41 | 1180000000/1500000000/1500000000 | 0/5631200/18079090 | 0/48653000/173106900 | 93/13/0 |
| `phase80a-prechange-baseline-world-00004` | third_division | 1355610637.5/1439207066.2/1602251126.48 | 140000000/299195000/300000000 | 0/0/0 | 0/0/0 | 66/10/0 |
| `phase80a-prechange-baseline-world-00005` | first_division | 31537287750/33809053702/36275759457.48 | 6935210152/12000000000/12000000000 | 2548500/34185300/89282150 | 42480000/377169000/810716200 | 84/11/22 |
| `phase80a-prechange-baseline-world-00005` | second_division | 6193173457.5/6815840471.3/7303918731.99 | 925709848/1500000000/1654569891.55 | 0/859000/1463540 | 0/14318000/24389000 | 80/9/0 |
| `phase80a-prechange-baseline-world-00005` | third_division | 1299783989.5/1460361095.9/1493471917.57 | 143320720/300000000/300000000 | 0/0/0 | 0/0/0 | 20/5/0 |
| `phase80a-prechange-baseline-world-00006` | first_division | 30943685531.5/35164198704/37884489070.85 | 7196761448/12004177365.3/12284998757.07 | 2410000/46160000/225639740 | 40165000/431457000/1991111700 | 78/13/27 |
| `phase80a-prechange-baseline-world-00006` | second_division | 6173985968.5/6769137110.6/7256723840.06 | 860000000/1523856971.7/1611621767.58 | 0/9571700/27864950 | 0/111430000/228727000 | 89/7/0 |
| `phase80a-prechange-baseline-world-00006` | third_division | 1316421925.5/1403882597.6/1412684568.14 | 113000000/300000000/300000000 | 0/0/0 | 0/0/0 | 25/3/0 |
| `phase80a-prechange-baseline-world-00007` | first_division | 30833863270/33640448284.7/35428588447.32 | 7336788182/12000000000/12000000000 | 218500/71917800/248936570 | 3640000/536488000/1804703600 | 84/8/27 |
| `phase80a-prechange-baseline-world-00007` | second_division | 6119490363.5/7340297217.4/7451737893.93 | 1136923805/1563129129.4/2055682900.73 | 0/4475600/10196880 | 0/74410000/109854600 | 97/10/0 |
| `phase80a-prechange-baseline-world-00007` | third_division | 1287366952.5/1529753878.6/1596358720.93 | 144785776/300000000/300554566.16 | 0/0/0 | 0/0/0 | 43/12/0 |
| `phase80a-prechange-baseline-world-00008` | first_division | 29930875730/36118014476/38314303625.44 | 7351792901.5/11952658000/11997492500 | 1078000/67178800/184783400 | 17965000/575958000/1559765900 | 60/4/23 |
| `phase80a-prechange-baseline-world-00008` | second_division | 6197084650/6915493308.9/8031651032.91 | 1007102700/1500000000/2690329283.61 | 0/2735800/10677710 | 0/45590000/177960700 | 96/9/0 |
| `phase80a-prechange-baseline-world-00008` | third_division | 1319379209.5/1462737283.3/1502305701.52 | 140000000/300000000/300000000 | 0/0/0 | 0/0/0 | 31/10/0 |
| `phase80a-prechange-baseline-world-00009` | first_division | 31379665725/33864063026.6/39373758777.25 | 6800000000/11997382000/14214752214.46 | 1882000/98374200/112826010 | 31360000/1047334000/1155906400 | 89/18/20 |
| `phase80a-prechange-baseline-world-00009` | second_division | 6106547038/6777690004/7259560068.35 | 926126683.5/1500000000/1545907851.12 | 0/1474600/2888710 | 0/24570000/48138500 | 90/8/0 |
| `phase80a-prechange-baseline-world-00009` | third_division | 1306555541/1557351334.5/1849768080.32 | 140000000/353916467.7/506243149.68 | 0/0/0 | 0/0/0 | 32/4/0 |
| `phase80a-prechange-baseline-world-00010` | first_division | 31099320177/34187441276.9/36520572897.34 | 7337163071/12000000000/12052246968.65 | 0/28909600/41374210 | 0/385868000/689571300 | 86/19/23 |
| `phase80a-prechange-baseline-world-00010` | second_division | 6094990601.5/6918115233.2/7362333990.1 | 860000000/1500000000/1548067155.05 | 0/2989200/10582610 | 0/49821000/120344100 | 73/18/0 |
| `phase80a-prechange-baseline-world-00010` | third_division | 1309675416/1412355780.3/1654842464.6 | 126457452/300000000/343713647.35 | 0/0/0 | 0/0/0 | 67/16/0 |
| `phase80a-prechange-baseline-world-00011` | first_division | 30616284615.5/34990198641.5/38539891572.97 | 7273109155/12000000000/12000000000 | 1137000/18463000/241027420 | 18950000/307726000/1865769200 | 90/11/23 |
| `phase80a-prechange-baseline-world-00011` | second_division | 6147786391.5/6720877313.1/7074838708.21 | 987142465.5/1500000000/1500000000 | 0/2416200/9807790 | 0/21786000/79193600 | 94/14/0 |
| `phase80a-prechange-baseline-world-00011` | third_division | 1298691032/1513541627.4/1563246360.24 | 135339511.5/329774829/429925460.59 | 0/0/0 | 0/0/0 | 57/7/0 |
| `phase80a-prechange-baseline-world-00012` | first_division | 30584978949.5/35439224899.7/39585758371.06 | 8433393674/12192207701.1/12749966322.32 | 0/28011600/235798240 | 0/315649000/1692926000 | 75/12/22 |
| `phase80a-prechange-baseline-world-00012` | second_division | 6109467022/6749072977.5/7041881012.83 | 900579459/1500000000/1704249789.72 | 0/233700/2977670 | 0/3897000/49634500 | 82/8/0 |
| `phase80a-prechange-baseline-world-00012` | third_division | 1260319482/1464058155.1/1531052129.02 | 119248355/300000000/300000000 | 0/0/0 | 0/0/0 | 31/9/0 |
| `phase80a-prechange-baseline-world-00013` | first_division | 30118841082.5/36442357056.6/37226809330.54 | 8009637871/12000000000/12000000000 | 3191000/29336000/39975250 | 53175000/410738000/637548100 | 90/3/26 |
| `phase80a-prechange-baseline-world-00013` | second_division | 5966599060/6941005696.3/7553929590.03 | 1051025247.5/1520268034.2/1658609969.43 | 0/3439300/7250510 | 0/51012000/117839000 | 88/13/1 |
| `phase80a-prechange-baseline-world-00013` | third_division | 1320726570.5/1510334105.4/2714809344.61 | 138745000/300000000/1477405954.53 | 0/0/4073640 | 0/0/29099800 | 36/6/0 |
| `phase80a-prechange-baseline-world-00014` | first_division | 30708683822.5/34922892774.7/37260823422.92 | 7588972789/12000000000/12000000000 | 545500/24978500/48741640 | 9090000/416312000/812368400 | 66/8/27 |
| `phase80a-prechange-baseline-world-00014` | second_division | 6064487456/6974257977/7809558364.87 | 1030744144/1576777894.8/2104268789.41 | 0/2788500/5355890 | 0/46470000/89263200 | 96/11/0 |
| `phase80a-prechange-baseline-world-00014` | third_division | 1301505232.5/1581151802.4/3323850738.91 | 198586602.5/304977074.5/2124514373.36 | 0/0/0 | 0/0/0 | 40/8/0 |
| `phase80a-prechange-baseline-world-00015` | first_division | 30541266682.5/34375228339.9/34578205111.5 | 6751793044.5/12000000000/12000000000 | 1370500/43073200/116023580 | 22840000/610831000/1233101200 | 59/5/25 |
| `phase80a-prechange-baseline-world-00015` | second_division | 6005926536/6910050499.6/7051568460.26 | 1072262236/1500000000/1500000000 | 0/1558100/4998180 | 0/25965000/83305200 | 84/7/0 |
| `phase80a-prechange-baseline-world-00015` | third_division | 1353414100/1479735011.5/3263507708.82 | 136803690/300000000/2143761417.34 | 0/464700/2747520 | 0/4647000/20378700 | 42/1/0 |
| `phase80a-prechange-baseline-world-00016` | first_division | 30911866609.5/34552326935.1/38866759454.68 | 6800000000/12000000000/12000000000 | 3303000/58430900/136537950 | 55050000/699673000/977987400 | 69/13/26 |
| `phase80a-prechange-baseline-world-00016` | second_division | 5950061903/7026917839.3/7418224305.56 | 1053411898.5/1511625085.5/1551043222.44 | 0/3130800/35464650 | 0/33888000/295759200 | 79/12/0 |
| `phase80a-prechange-baseline-world-00016` | third_division | 1321850638.5/1558352746.9/3289503400.59 | 154111840.5/313313541.9/2258163259.49 | 0/0/646570 | 0/0/10781700 | 56/9/1 |
| `phase80a-prechange-baseline-world-00017` | first_division | 30673033466.5/34290878096.4/36498694613.42 | 6795203024/12000000000/12688465015.26 | 2049500/138320000/359100860 | 34165000/1296810000/2614037700 | 66/7/30 |
| `phase80a-prechange-baseline-world-00017` | second_division | 6155132339.5/6662230112/6907670462.6 | 865332763.5/1493504000/1500000000 | 0/5097100/12362090 | 0/80997000/131964500 | 88/4/0 |
| `phase80a-prechange-baseline-world-00017` | third_division | 1301824480/1488059655.8/1528874315.74 | 134106427.5/300000000/304095054 | 0/0/2772200 | 0/0/33507100 | 46/5/0 |
| `phase80a-prechange-baseline-world-00018` | first_division | 30834276460.5/34109430644.5/35775719059.34 | 7165328512.5/12000000000/12420308210.22 | 1463500/19901600/76221370 | 24390000/292490000/575296000 | 81/14/27 |
| `phase80a-prechange-baseline-world-00018` | second_division | 6199291479/6836354095.2/7680607428.92 | 907222334.5/1500000000/2200243317.01 | 0/3466800/32870380 | 0/57783000/259961400 | 85/11/0 |
| `phase80a-prechange-baseline-world-00018` | third_division | 1346261090/1529820817.6/1616418261.9 | 135405814/304103626.8/378379525.22 | 0/0/354410 | 0/0/5901300 | 43/8/0 |
| `phase80a-prechange-baseline-world-00019` | first_division | 30521033600.5/34789443416.9/36045674705.57 | 6800000000/11993385000/12000000000 | 0/10095700/70351780 | 0/168265000/564798700 | 72/3/25 |
| `phase80a-prechange-baseline-world-00019` | second_division | 6034466029.5/7130923167.4/7858529519.58 | 891954888/1558347280.5/2810313989.58 | 0/8750200/35673980 | 0/104580000/315628500 | 84/5/0 |
| `phase80a-prechange-baseline-world-00019` | third_division | 1297634322/1450971702.1/1491721938.01 | 140000000/298656000/300000000 | 0/0/500490 | 0/0/8341500 | 30/5/0 |
| `phase80a-prechange-baseline-world-00020` | first_division | 31003289153/34108193399.4/37804672375.45 | 6800000000/11938967000/13303825699.71 | 5704500/167641200/263381010 | 95075000/1206998000/1913199500 | 80/18/24 |
| `phase80a-prechange-baseline-world-00020` | second_division | 6202107325/6909220963.9/7028363750.44 | 1135879356.5/1500000000/1735424005.4 | 0/10133000/12536690 | 0/118555000/150061200 | 86/6/0 |
| `phase80a-prechange-baseline-world-00020` | third_division | 1327486207/1473360036.5/1492564030.8 | 156334357.5/304903872.6/330456991.49 | 0/92400/4276230 | 0/1539000/34304500 | 44/5/0 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00001` | first_division -> first_division | 65 | 15 | 1013723300 | 1454474640 | 1018398668 | fee_below_valuation=33, player_unwilling=12, player_not_for_sale=3 |
| `phase80a-prechange-baseline-world-00001` | first_division -> second_division | 10 | 4 | 25297750 | 27836382.5 | 34899260 | stale_ownership=1, fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00001` | second_division -> first_division | 6 | 4 | 64411450 | 97370652.5 | 94936351.5 | fee_below_valuation=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> second_division | 80 | 4 | 157205350 | 192550286.5 | 273849491 | fee_below_valuation=56, player_unwilling=13, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00001` | second_division -> third_division | 16 | 2 | 35694400 | 40156200 | 16188686.5 | fee_below_valuation=10, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00001` | third_division -> first_division | 3 | 1 | 50734300 | 75847779 | 73951540 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00001` | third_division -> third_division | 34 | 6 | 13317700 | 16985400 | 9219366 | player_unwilling=6, unaffordable=2, fee_below_valuation=17 |
| `phase80a-prechange-baseline-world-00002` | first_division -> first_division | 80 | 7 | 1050004000 | 1417505400 | 485771200 | fee_below_valuation=59, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00002` | second_division -> second_division | 86 | 4 | 156368600 | 194070960 | 170705384 | fee_below_valuation=63, player_unwilling=17, unaffordable=1 |
| `phase80a-prechange-baseline-world-00002` | second_division -> third_division | 15 | 0 | 31079000 | 34963875 | 0 | fee_below_valuation=11, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00002` | third_division -> second_division | 6 | 3 | 23083200 | 27699840 | 38972980 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00002` | third_division -> third_division | 23 | 2 | 18580000 | 22894763 | 15081178 | player_unwilling=3, fee_below_valuation=16, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | first_division -> first_division | 63 | 10 | 522147700 | 661432770 | 103005965 | fee_below_valuation=34, player_unwilling=10, stale_ownership=3, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | first_division -> second_division | 4 | 2 | 23456050 | 30101076 | 28232325 | unaffordable=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> first_division | 11 | 4 | 129992200 | 170840468 | 201576109 | stale_ownership=3, fee_below_valuation=3, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> second_division | 68 | 3 | 161753400 | 236792632.5 | 40870000 | fee_below_valuation=47, player_unwilling=11, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> third_division | 15 | 4 | 23362500 | 23362500 | 33953089 | fee_below_valuation=8, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00003` | third_division -> second_division | 10 | 3 | 9891400 | 12122019 | 51975955 | fee_below_valuation=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | third_division -> third_division | 44 | 8 | 11428250 | 12909938 | 9448025 | fee_below_valuation=21, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00004` | first_division -> first_division | 80 | 9 | 995975900 | 1392975099 | 792426200 | stale_ownership=4, fee_below_valuation=46, player_unwilling=17, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00004` | first_division -> second_division | 5 | 1 | 17141100 | 17741039 | 10810161 | stale_ownership=2, fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | second_division -> second_division | 83 | 8 | 152006900 | 217725480 | 174440799.5 | fee_below_valuation=62, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00004` | second_division -> third_division | 11 | 3 | 21687400 | 24398325 | 10403450 | fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> second_division | 5 | 4 | 62357500 | 87300500 | 52579553.5 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> third_division | 55 | 7 | 9240700 | 11367720 | 10416850 | fee_below_valuation=29, player_unwilling=15, unaffordable=2 |
| `phase80a-prechange-baseline-world-00005` | first_division -> first_division | 84 | 11 | 1225315200 | 1491696900 | 857639250 | fee_below_valuation=61, player_unwilling=8 |
| `phase80a-prechange-baseline-world-00005` | first_division -> second_division | 2 | 1 | 39864900 | 55013562 | 15339652 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00005` | second_division -> second_division | 73 | 7 | 139074800 | 183320280 | 68684700 | player_unwilling=9, fee_below_valuation=52, unaffordable=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> second_division | 5 | 1 | 42952300 | 51542760 | 91579600 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00005` | third_division -> third_division | 20 | 5 | 11654450 | 12081825.5 | 10802500 | fee_below_valuation=7, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00006` | first_division -> first_division | 68 | 11 | 570171500 | 749562978.5 | 134004203 | fee_below_valuation=39, player_unwilling=13, stale_ownership=1, player_not_for_sale=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00006` | first_division -> second_division | 1 | 0 | 7529900 | 8313010 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | second_division -> first_division | 6 | 1 | 85881200 | 88887042 | 195981184 | fee_below_valuation=3, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | second_division -> second_division | 87 | 7 | 127557500 | 162526905 | 170402525 | player_unwilling=14, fee_below_valuation=62 |
| `phase80a-prechange-baseline-world-00006` | second_division -> third_division | 2 | 1 | 25197800 | 30109690 | 17165521 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> first_division | 4 | 1 | 9563700 | 12373515 | 15098964 | fee_below_valuation=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | third_division -> second_division | 1 | 0 | 9266100 | 11119320 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> third_division | 23 | 2 | 12151200 | 11682048 | 5949894 | fee_below_valuation=13, player_unwilling=5, unaffordable=2 |
| `phase80a-prechange-baseline-world-00007` | first_division -> first_division | 75 | 5 | 888982400 | 1066778880 | 49641305 | fee_below_valuation=54, player_unwilling=8, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00007` | first_division -> second_division | 3 | 2 | 32980400 | 39576480 | 33837814 | player_unwilling=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> first_division | 6 | 1 | 182377500 | 245622009.5 | 26364405 | fee_below_valuation=2, stale_ownership=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> second_division | 85 | 5 | 157697100 | 212891085 | 72371157 | fee_below_valuation=68, player_unwilling=8 |
| `phase80a-prechange-baseline-world-00007` | second_division -> third_division | 11 | 4 | 45321100 | 45321100 | 27069383 | player_unwilling=1, fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00007` | third_division -> first_division | 3 | 2 | 81275900 | 136543512 | 133666408 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> second_division | 9 | 3 | 49408600 | 66701610 | 62313095 | fee_below_valuation=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> third_division | 32 | 8 | 9739700 | 9602256 | 11970341 | fee_below_valuation=8, player_unwilling=10, unaffordable=3 |
| `phase80a-prechange-baseline-world-00008` | first_division -> first_division | 60 | 4 | 925209800 | 1063608638 | 318942884.5 | fee_below_valuation=40, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00008` | second_division -> second_division | 88 | 8 | 158766200 | 199051560 | 196018612.5 | fee_below_valuation=62, player_unwilling=14, unaffordable=1 |
| `phase80a-prechange-baseline-world-00008` | second_division -> third_division | 4 | 1 | 9792100 | 11755579 | 8930358 | fee_below_valuation=1, unaffordable=2 |
| `phase80a-prechange-baseline-world-00008` | third_division -> second_division | 8 | 1 | 44364400 | 53237280 | 6052816 | fee_below_valuation=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00008` | third_division -> third_division | 27 | 9 | 10801800 | 13970568 | 13312310 | fee_below_valuation=8, player_unwilling=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | first_division -> first_division | 86 | 17 | 736871300 | 958681440 | 199944450 | fee_below_valuation=46, player_unwilling=15, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00009` | first_division -> second_division | 4 | 1 | 28155250 | 28182645 | 14653268 | fee_below_valuation=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> first_division | 1 | 1 | 9380500 | 12945090 | 11650545 | none |
| `phase80a-prechange-baseline-world-00009` | second_division -> second_division | 85 | 6 | 161393300 | 225950620 | 135485766.5 | fee_below_valuation=63, player_unwilling=12, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> third_division | 6 | 0 | 61267100 | 77755882.5 | 0 | fee_below_valuation=5, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> first_division | 2 | 0 | 10220100 | 14103738 | 0 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> second_division | 1 | 1 | 34886400 | 41863680 | 40817040 | none |
| `phase80a-prechange-baseline-world-00009` | third_division -> third_division | 26 | 4 | 11111850 | 12975720 | 11808266 | fee_below_valuation=14, player_unwilling=4, unaffordable=2 |
| `phase80a-prechange-baseline-world-00010` | first_division -> first_division | 78 | 16 | 757582600 | 816910586.5 | 419905209.5 | fee_below_valuation=42, player_unwilling=11, stale_ownership=4, player_not_for_sale=3 |
| `phase80a-prechange-baseline-world-00010` | first_division -> second_division | 8 | 4 | 15469200 | 16390016.5 | 15488254 | fee_below_valuation=2, player_unwilling=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00010` | second_division -> first_division | 8 | 3 | 136709100 | 158354280 | 67686978 | stale_ownership=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00010` | second_division -> second_division | 54 | 11 | 167557200 | 226202220 | 179550240 | fee_below_valuation=31, stale_ownership=1, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00010` | second_division -> third_division | 13 | 3 | 40370600 | 45416925 | 22512050 | fee_below_valuation=7, player_unwilling=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | third_division -> second_division | 11 | 3 | 32794100 | 51650708 | 46485604 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00010` | third_division -> third_division | 54 | 13 | 10104300 | 11527885 | 9828610 | player_unwilling=12, fee_below_valuation=23, unaffordable=1 |
| `phase80a-prechange-baseline-world-00011` | first_division -> first_division | 81 | 8 | 780728400 | 940235963 | 127597554 | fee_below_valuation=46, player_unwilling=15, stale_ownership=4, player_not_for_sale=4 |
| `phase80a-prechange-baseline-world-00011` | first_division -> second_division | 4 | 2 | 17280100 | 22115328 | 9652261 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00011` | second_division -> first_division | 6 | 2 | 65265400 | 86436671.5 | 125120833.5 | stale_ownership=3, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00011` | second_division -> second_division | 81 | 11 | 136017700 | 180894600 | 167327500 | fee_below_valuation=44, player_unwilling=20, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00011` | second_division -> third_division | 7 | 0 | 17162900 | 17312100 | 0 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00011` | third_division -> first_division | 3 | 1 | 15135700 | 20887266 | 16879250 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00011` | third_division -> second_division | 9 | 1 | 38345900 | 45702480 | 42274790 | fee_below_valuation=5, stale_ownership=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> third_division | 50 | 7 | 12103600 | 13616550 | 11081700 | fee_below_valuation=26, player_unwilling=13, unaffordable=2 |
| `phase80a-prechange-baseline-world-00012` | first_division -> first_division | 75 | 12 | 895060800 | 1367910225 | 975820520 | player_unwilling=8, stale_ownership=2, fee_below_valuation=48, unaffordable=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00012` | first_division -> second_division | 3 | 2 | 12010100 | 13259150 | 46067184 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> second_division | 68 | 3 | 171092200 | 230974470 | 104754513 | player_unwilling=14, fee_below_valuation=46, unaffordable=2 |
| `phase80a-prechange-baseline-world-00012` | second_division -> third_division | 6 | 1 | 19093350 | 19560116.5 | 14591210 | fee_below_valuation=3, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00012` | third_division -> second_division | 11 | 3 | 11686800 | 14654220 | 11102450 | fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | third_division -> third_division | 25 | 8 | 10184500 | 11457563 | 8592120 | player_unwilling=6, fee_below_valuation=10, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | first_division -> first_division | 90 | 3 | 1223373400 | 1749010455 | 1800851738 | player_unwilling=18, fee_below_valuation=62, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | first_division -> second_division | 1 | 1 | 23907300 | 32992074 | 29692837 | none |
| `phase80a-prechange-baseline-world-00013` | second_division -> second_division | 80 | 10 | 136821900 | 170709280 | 139176360 | fee_below_valuation=54, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00013` | second_division -> third_division | 7 | 1 | 53673500 | 72459225 | 6136350 | fee_below_valuation=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | third_division -> second_division | 7 | 2 | 13230600 | 15876720 | 34498803 | fee_below_valuation=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | third_division -> third_division | 29 | 5 | 13817900 | 15117120 | 11841750 | player_unwilling=3, fee_below_valuation=17, unaffordable=2 |
| `phase80a-prechange-baseline-world-00014` | first_division -> first_division | 62 | 7 | 843497100 | 991731317.5 | 18972532 | fee_below_valuation=36, player_unwilling=11, stale_ownership=6 |
| `phase80a-prechange-baseline-world-00014` | first_division -> second_division | 8 | 2 | 12322450 | 16878856 | 8924612 | fee_below_valuation=2, stale_ownership=2, player_unwilling=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> first_division | 4 | 1 | 55613200 | 74271305 | 225384104 | stale_ownership=2 |
| `phase80a-prechange-baseline-world-00014` | second_division -> second_division | 80 | 6 | 169920400 | 229392540 | 122863041.5 | fee_below_valuation=54, player_unwilling=15, unaffordable=2 |
| `phase80a-prechange-baseline-world-00014` | second_division -> third_division | 6 | 3 | 23389900 | 30147863 | 24943427 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00014` | third_division -> second_division | 8 | 3 | 41608500 | 53453767.5 | 45584468 | fee_below_valuation=3, unaffordable=2 |
| `phase80a-prechange-baseline-world-00014` | third_division -> third_division | 34 | 5 | 10372400 | 12224925 | 9359002 | fee_below_valuation=20, player_unwilling=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00015` | first_division -> first_division | 59 | 5 | 1049214100 | 1259056920 | 1164627610 | fee_below_valuation=39, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00015` | second_division -> second_division | 82 | 6 | 154931450 | 222577583 | 196493774 | fee_below_valuation=58, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00015` | second_division -> third_division | 2 | 0 | 17369900 | 19541138 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00015` | third_division -> second_division | 2 | 1 | 40303300 | 48363960 | 44736630 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> third_division | 40 | 1 | 17384350 | 22021897.5 | 16065865 | fee_below_valuation=30, player_unwilling=5 |
| `phase80a-prechange-baseline-world-00016` | first_division -> first_division | 55 | 9 | 668001000 | 751501125 | 599859895 | player_unwilling=15, fee_below_valuation=23, player_not_for_sale=2, stale_ownership=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00016` | first_division -> second_division | 4 | 2 | 50290200 | 50185883 | 52401343.5 | stale_ownership=2 |
| `phase80a-prechange-baseline-world-00016` | second_division -> first_division | 11 | 2 | 83023100 | 128893363 | 16671051.5 | stale_ownership=4, fee_below_valuation=3, unaffordable=1 |
| `phase80a-prechange-baseline-world-00016` | second_division -> second_division | 69 | 7 | 122050900 | 170246610 | 103905700 | fee_below_valuation=40, player_unwilling=18, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00016` | second_division -> third_division | 17 | 2 | 20962300 | 23142379 | 21284669 | fee_below_valuation=8, stale_ownership=2, player_unwilling=2, unaffordable=2 |
| `phase80a-prechange-baseline-world-00016` | third_division -> first_division | 3 | 2 | 1837884900 | 2472874133 | 1244547188.5 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> second_division | 6 | 3 | 22959700 | 27358909 | 15369219 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> third_division | 39 | 7 | 11546600 | 12938052 | 11257900 | fee_below_valuation=18, player_unwilling=12, unaffordable=1 |
| `phase80a-prechange-baseline-world-00017` | first_division -> first_division | 62 | 5 | 947416600 | 1277350436.5 | 453318079 | player_unwilling=12, fee_below_valuation=37, stale_ownership=4 |
| `phase80a-prechange-baseline-world-00017` | first_division -> second_division | 3 | 1 | 16753500 | 21675678 | 15469050 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> first_division | 1 | 0 | 138987400 | 179821898 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> second_division | 81 | 2 | 138987400 | 172433070 | 288949240.5 | fee_below_valuation=64, player_unwilling=13, unaffordable=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> third_division | 6 | 1 | 38780300 | 43627838 | 13784735 | player_unwilling=2, fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00017` | third_division -> first_division | 3 | 2 | 14542000 | 18814440 | 39125280 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> second_division | 4 | 1 | 11421800 | 13706160 | 13706160 | stale_ownership=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00017` | third_division -> third_division | 40 | 4 | 14777300 | 17578577.5 | 7173650 | player_unwilling=6, fee_below_valuation=27 |
| `phase80a-prechange-baseline-world-00018` | first_division -> first_division | 78 | 13 | 823888900 | 980427791 | 955917096 | fee_below_valuation=52, player_unwilling=8, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00018` | first_division -> second_division | 1 | 1 | 8272400 | 9132730 | 8447765 | none |
| `phase80a-prechange-baseline-world-00018` | second_division -> first_division | 3 | 1 | 11532900 | 19828515 | 9132730 | fee_below_valuation=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00018` | second_division -> second_division | 78 | 7 | 135740600 | 178502272.5 | 163568900 | fee_below_valuation=64, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00018` | second_division -> third_division | 13 | 3 | 30690600 | 35458261 | 34571781 | fee_below_valuation=8 |
| `phase80a-prechange-baseline-world-00018` | third_division -> second_division | 6 | 3 | 44565250 | 66482001.5 | 56365640 | unaffordable=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00018` | third_division -> third_division | 30 | 5 | 12568000 | 14430037.5 | 12551740 | fee_below_valuation=18, unaffordable=1, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00019` | first_division -> first_division | 72 | 3 | 1008499450 | 1313115300 | 1003916082 | fee_below_valuation=50, player_unwilling=19 |
| `phase80a-prechange-baseline-world-00019` | second_division -> second_division | 79 | 4 | 158853500 | 238958775 | 212637925 | fee_below_valuation=58, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00019` | second_division -> third_division | 6 | 2 | 12922750 | 13995285 | 12595742.5 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00019` | third_division -> second_division | 5 | 1 | 50124800 | 67668480 | 46986450 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00019` | third_division -> third_division | 24 | 3 | 12526900 | 16911315 | 8432332 | fee_below_valuation=12, player_unwilling=9 |
| `phase80a-prechange-baseline-world-00020` | first_division -> first_division | 68 | 12 | 580883750 | 658347412.5 | 255984876 | fee_below_valuation=37, stale_ownership=1, player_unwilling=15, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | first_division -> second_division | 6 | 1 | 16781800 | 20505254.5 | 19106119 | fee_below_valuation=2, player_unwilling=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> first_division | 9 | 4 | 55381400 | 57319749 | 262804128.5 | stale_ownership=4, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> second_division | 76 | 4 | 166188900 | 260267963 | 259268084 | fee_below_valuation=56, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00020` | second_division -> third_division | 11 | 1 | 52750300 | 59344088 | 10416860 | fee_below_valuation=8, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00020` | third_division -> first_division | 3 | 2 | 231666000 | 275682540 | 212230256 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | third_division -> second_division | 4 | 1 | 53929900 | 72805365 | 58788715 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00020` | third_division -> third_division | 33 | 4 | 12164600 | 13685175 | 7193525 | fee_below_valuation=24, player_unwilling=3, unaffordable=1 |

## Year-10 Exceptional Stock Locations

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | FAIL | 18 | 11 | senior 1224..1280; youth 594..594; total 1818..1874 | 0 | 0 | 0 | structural 0; cash 755000000; wage 1.0000; free agents 0.0301; values 4165200..12298000000; renew/release/expiry 271/3/2 | 12 | avg 28.00; min 26; max 30; low season 2; champion pts 61..63; last pts 31..37; ability spread 6.57->5.50; draw rate avg/max 0.250/0.270 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.44; top assist Matteo Basiletti; top scorer Nico Sorrentino:13 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00010` | FAIL | 20 | 11 | senior 1230..1290; youth 594..594; total 1824..1884 | 0 | 0 | 0 | structural 0; cash 736673075; wage 0.9998; free agents 0.0324; values 4054300..13495000000; renew/release/expiry 281/0/0 | 12 | avg 27.00; min 24; max 30; low season 1; champion pts 59..60; last pts 29..36; ability spread 6.58->5.87; draw rate avg/max 0.260/0.270 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00019` | WARN | 18 | 11 | senior 1223..1288; youth 594..594; total 1817..1882 | 0 | 0 | 0 | structural 0; cash 764915454; wage 1.0000; free agents 0.0402; values 3919700..12760000000; renew/release/expiry 300/0/0 | 9 | avg 36.00; min 31; max 41; low season 2; champion pts 63..65; last pts 24..32; ability spread 6.29->5.56; draw rate avg/max 0.240/0.240 | season 2; Virtus Trieste; Matteo Bonacina; assists 9; team goals 49; top1 0.18; top3 0.41; top assist Giorgio Bonetti; top scorer Luca Cambi:18 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00006` | WARN | 19 | 11 | senior 1230..1302; youth 594..594; total 1824..1896 | 0 | 0 | 0 | structural 0; cash 808808150; wage 1.0000; free agents 0.0378; values 3929700..13684000000; renew/release/expiry 280/1/2 | 11 | avg 35.50; min 35; max 36; low season 1; champion pts 63..66; last pts 28..30; ability spread 6.42->5.55; draw rate avg/max 0.270/0.290 | season 2; A.S. Genoa; Luca Basile; assists 11; team goals 53; top1 0.21; top3 0.40; top assist Luca Basile; top scorer Marko Jovanovic:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00002` | WARN | 19 | 11 | senior 1227..1299; youth 594..594; total 1821..1893 | 0 | 0 | 0 | structural 0; cash 768869489; wage 1.0000; free agents 0.0366; values 4007800..12760000000; renew/release/expiry 275/1/1 | 11 | avg 42.00; min 38; max 46; low season 2; champion pts 70..73; last pts 27..32; ability spread 6.17->5.07; draw rate avg/max 0.250/0.260 | season 1; Virtus Parma; Sergio Molina; assists 10; team goals 50; top1 0.20; top3 0.42; top assist Logan Morgan; top scorer Enrico Bortolotti:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00013` | WARN | 18 | 11 | senior 1215..1293; youth 594..594; total 1809..1887 | 0 | 0 | 0 | structural 0; cash 812416780; wage 1.0000; free agents 0.0348; values 3484100..15000000000; renew/release/expiry 254/0/1 | 11 | avg 34.00; min 28; max 40; low season 2; champion pts 57..72; last pts 29..32; ability spread 5.91->4.83; draw rate avg/max 0.250/0.270 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Enrico Bruni; top scorer Dario Milosevic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00009` | WARN | 18 | 11 | senior 1218..1279; youth 594..594; total 1812..1873 | 0 | 0 | 0 | structural 0; cash 835615479; wage 1.0000; free agents 0.0330; values 3552400..14020000000; renew/release/expiry 260/0/3 | 10 | avg 30.50; min 24; max 37; low season 2; champion pts 60..63; last pts 26..36; ability spread 6.32->5.33; draw rate avg/max 0.230/0.250 | season 1; Parma Calcio; Oumar Traore; assists 8; team goals 46; top1 0.17; top3 0.43; top assist Diego Herrera; top scorer Giorgio Taddei:14 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00018` | WARN | 19 | 11 | senior 1219..1291; youth 594..594; total 1813..1885 | 0 | 0 | 0 | structural 0; cash 743778250; wage 1.0000; free agents 0.0329; values 3762800..12298000000; renew/release/expiry 271/2/1 | 10 | avg 31.50; min 28; max 35; low season 1; champion pts 60..64; last pts 29..32; ability spread 6.06->5.04; draw rate avg/max 0.250/0.260 | season 1; U.S. Trieste; Sekou Keita; assists 8; team goals 41; top1 0.20; top3 0.41; top assist Davide Spinelli; top scorer Davide Mazzi:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00007` | WARN | 19 | 11 | senior 1224..1287; youth 594..594; total 1818..1881 | 0 | 0 | 0 | structural 0; cash 760926706; wage 1.0000; free agents 0.0329; values 3786500..13495000000; renew/release/expiry 289/0/0 | 10 | avg 33.50; min 32; max 35; low season 1; champion pts 63..64; last pts 29..31; ability spread 5.78->5.17; draw rate avg/max 0.230/0.250 | season 1; U.S. Matera; Enrico Rossetti; assists 9; team goals 44; top1 0.20; top3 0.46; top assist Matteo Cantini; top scorer Nico Corsi:16 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00005` | WARN | 19 | 11 | senior 1225..1290; youth 594..594; total 1819..1884 | 0 | 0 | 0 | structural 0; cash 817765560; wage 1.0000; free agents 0.0329; values 3812100..12760000000; renew/release/expiry 250/0/1 | 10 | avg 31.00; min 28; max 34; low season 1; champion pts 64..65; last pts 31..36; ability spread 5.86->5.05; draw rate avg/max 0.210/0.220 | season 1; A.C. Catania; Davide Corsi; assists 10; team goals 51; top1 0.20; top3 0.39; top assist Davide Corsi; top scorer Giorgio Pagano:18 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase80a-prechange-baseline-world-00003` | 13 | season 1; A.S. Pescara; Luca Silvestri; assists 9; team goals 46; top1 0.20; top3 0.40; top assist Luca Silvestri; top scorer Enrico Cambi:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 13 | season 2; A.C. Lecco; Enrico Capra; assists 13; team goals 69; top1 0.19; top3 0.35; top assist Enrico Capra; top scorer Luca Pagano:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 12 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.44; top assist Matteo Basiletti; top scorer Nico Sorrentino:13 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00010` | 12 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 11 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Enrico Bruni; top scorer Dario Milosevic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 11 | season 2; A.S. Genoa; Luca Basile; assists 11; team goals 53; top1 0.21; top3 0.40; top assist Luca Basile; top scorer Marko Jovanovic:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 11 | season 1; A.S. Milan; Tomasz Horak; assists 11; team goals 54; top1 0.20; top3 0.42; top assist Tomasz Horak; top scorer Davide Ceccarelli:19 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00017` | 11 | season 2; F.C. Lecco; Matteo Orlando; assists 11; team goals 54; top1 0.20; top3 0.38; top assist Matteo Orlando; top scorer Nolan Rousseau:13 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 11 | season 1; Virtus Parma; Sergio Molina; assists 10; team goals 50; top1 0.20; top3 0.42; top assist Logan Morgan; top scorer Enrico Bortolotti:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 11 | season 1; U.S. Catania; Nico Capra; assists 11; team goals 59; top1 0.19; top3 0.39; top assist Nico Capra; top scorer Luca Rosati:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00017` | 2 | Pro Trento | 67..67 | 41.50 | 1 | transfer=64; squad=105 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 2 | A.S.D. Lecco | 63..66 | 35.50 | 1 | transfer=77; squad=117 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 2 | Pro Brescia | 62..68 | 34.50 | 1 | transfer=83; squad=122 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 1 | A.C. Terni | 73..73 | 46.00 | 2 | transfer=62; squad=107 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 1 | A.C. Taranto | 69..69 | 43.00 | 2 | transfer=90; squad=133 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 1 | U.S. Florence | 65..65 | 43.00 | 2 | transfer=61; squad=97 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00016` | 1 | A.S. Florence | 74..74 | 42.00 | 2 | transfer=82; squad=118 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 1 | S.S. Lecco | 69..69 | 42.00 | 2 | transfer=76; squad=113 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00019` | 1 | A.S. Pisa | 65..65 | 41.00 | 2 | transfer=61; squad=93 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 1 | A.C. Matera | 74..74 | 40.00 | 2 | transfer=87; squad=124 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00010` | 27.00 | 24..30 | 59..60 | 29..36 | avg 0.260 max 0.270 | 6.58->5.87 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 28.00 | 26..30 | 61..63 | 31..37 | avg 0.250 max 0.270 | 6.57->5.50 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00009` | 30.50 | 24..37 | 60..63 | 26..36 | avg 0.230 max 0.250 | 6.32->5.33 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 30.50 | 26..35 | 59..63 | 28..33 | avg 0.280 max 0.280 | 6.52->5.09 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00005` | 31.00 | 28..34 | 64..65 | 31..36 | avg 0.210 max 0.220 | 5.86->5.05 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00018` | 31.50 | 28..35 | 60..64 | 29..32 | avg 0.250 max 0.260 | 6.06->5.04 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00007` | 33.50 | 32..35 | 63..64 | 29..31 | avg 0.230 max 0.250 | 5.78->5.17 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00004` | 33.50 | 32..35 | 66..66 | 31..34 | avg 0.240 max 0.240 | 6.02->5.09 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 34.00 | 28..40 | 57..72 | 29..32 | avg 0.250 max 0.270 | 5.91->4.83 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 34.50 | 30..39 | 62..68 | 29..32 | avg 0.260 max 0.280 | 6.67->5.80 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Market And Economy Diagnostic Worlds

### Zero Permanent Completions Despite Recruitment Needs

| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |
|---|---:|---:|---:|---:|---:|---|

### Highest Useful Free-Agent Stock

| Seed | Useful stock max | Free-agent share max |
|---|---:|---:|
| `phase80a-prechange-baseline-world-00019` | 0 | 0.0402 |
| `phase80a-prechange-baseline-world-00006` | 0 | 0.0378 |
| `phase80a-prechange-baseline-world-00002` | 0 | 0.0366 |
| `phase80a-prechange-baseline-world-00013` | 0 | 0.0348 |
| `phase80a-prechange-baseline-world-00009` | 0 | 0.0330 |
| `phase80a-prechange-baseline-world-00005` | 0 | 0.0329 |
| `phase80a-prechange-baseline-world-00007` | 0 | 0.0329 |
| `phase80a-prechange-baseline-world-00018` | 0 | 0.0329 |
| `phase80a-prechange-baseline-world-00012` | 0 | 0.0326 |
| `phase80a-prechange-baseline-world-00017` | 0 | 0.0326 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase80a-prechange-baseline-world-00014` | 0.3611 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00012` | 0.3611 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00008` | 0.3611 | 0.0000 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00019` | 0.3519 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00003` | 0.3519 | 0.0000 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00007` | 0.3426 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00013` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00009` | 0.3241 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00020` | 0.3241 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00010` | 0.3241 | 0.0000 | 0.0000 | 0.9998 |

## Reproduction

Run the same gate with:

```bash
nvm use 24
pnpm cli ten-season-report --seed-prefix=phase80a-prechange-baseline --worlds=20 --seasons=2 --checkpoint-dir=<checkpoint-directory> --shards=20 --workers=7 --report-output=artifacts/phase80a-step08-v5-report.md
```
