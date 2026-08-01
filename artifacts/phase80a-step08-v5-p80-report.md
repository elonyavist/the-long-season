# Phase 80A Prospect And Player-Economy Bounded Gates Report

Date: 2026-08-01
Seed prefix: `phase80a-prechange-baseline`
Worlds: 20
Seasons per world: 2
Total seasons: 40
Execution: sharded; workers=7; shards=20; resumed=0; partition_hashes=3679e679f2c8afca,e061b8dfd6d66f82,c3bcc53672eed77e,7f5c3fb89ad69612,bff8eb5582c02e75,312d148c50a273b4,3b1064fe5da6f99f,71e47a582afb53dd,5a4b3a91f56e3abc,474e3835841f8b84,f7a3f7e55d077c77,29ecf26ec6e8edd0,4ba784213cf5b6f9,91065c39a8aa6772,5462db9f57e8c59e,c4937caf165f2bd3,8a7b4580c4e2d598,94c66a88e3dedbe9,0484bc4f6fe02a49,822c6a6e1cd7dde0
Status: FAIL

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 18
- Player-economy gate violations: 0
- Closing division-value fit: FAIL
- Closing checkpoint season start year: 2028
- Closing division-value observations: 25770
- Closing division-value violations: 1
- Year-10 rating-stock observations: 0/20
- Year-10 current-six maximum observed: n/a
- Year-10 stored-ceiling-six maximum observed: n/a
- Year-10 lower-tier stored-ceiling-six maximum observed: n/a
- Goals per match average: 2.910
- Goals per match p95: 3.030
- Table spread average: 34.92
- Table spread minimum world average: 27.00
- Draw rate average: 0.240
- Draw rate maximum world average: 0.280
- Champion streak max observed: 2
- Top assist max p95: 13
- Production warning max: assists=14 top1=0.24 top3=0.48
- Age 30+ share p95: 0.16
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 1786
- Role coverage warnings p95: 93
- Youth roster max observed: 11
- Active player count min/max: senior=1215..1302 youth=594..594 total=1809..1896
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 722287931
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.8700; p90=0.9800; p95=1.0000; p99=1.0000; pressure share=0.3200; exact ceiling share=0.0200; above budget share=0.0000; reallocation exact ceiling count=2
- Annual wage headroom (minor): p10=6810000; p50=215280000
- Maximum free-agent share: 0.0402
- Maximum useful free-agent stock: 0
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=1621/0/3/0; ability <8/8-9/10-11/12+=920/703/0/1; unattached <1/1-2/3+ seasons=1275/349/0
- Permanent-transfer funnel: needs=410628; recruitable=310318; targets=10122; unavailable=400506; offers=10122; seller rejected/countered/accepted/expired/withdrawn=6825/2738/2915/340/43; player started/countered/rejected/counter-accepted=2914/0/1072/0; unaffordable=43; completed=1580; lost reasons=active_talk_limit_reached=756, club_already_handled=11288, club_cannot_recruit=88266, counter_exceeds_capacity=43, implausible_downward_move=491, permanent_start_limit_reached=90664, seller_department_floor=18477, transfer_terms_unaffordable=5549, transfer_window_closed=185015
- Preliminary-agreement funnel: candidates=2140; unavailable=216362; offers=2140; rejected/countered/counter-accepted/counter-rejected=669/0/0/0; agreements=459; expired=945; activations=21; activation failures=7; lost reasons=active_talk_limit_reached=14114, club_terms_unaffordable=70, contract_overlap=7, current_contract_expired=5, negotiation_deadline=940, player_unwilling=599, preliminary_start_limit_reached=184, preliminary_target_unavailable=202064
- Permanent-transfer public values: count=1580; p50=112621600; p90=1354982000; p99=2623610500; max=3721706800
- Permanent-transfer asking prices: count=1580; p50=131078475; p90=1634046400; p99=3379869180; max=5777949807
- Permanent-transfer completed fees: count=1580; p50=121247588; p90=1516624763; p99=3092771918; max=5777949807
- Free-agent public values: count=703; p50=11229600; p90=15410000; p99=31605800; max=51723000
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 3364500..15000000000
- Contract lifecycle: renewals=5451; releases=16; expiries=24; selected expiry decisions=3
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
| `free_agent_zero_fee_and_value` | 703 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent |
| `hard_cap_eligibility_and_display` | 8 | 0 | 0 | 12 | matching=3 share_bps=3750 cohort_evidence=n/a cohort_minimum=n/a | positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points |
| `initial_established_current_six_stock` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs |
| `initial_exceptional_allocation` | 35640 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | established current-six 2..3; young stored-ceiling-six 4..5; lower-tier young stored-ceiling-six <=1; allocated/effective identity |
| `initial_young_stored_ceiling_six_stock` | 88 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail |
| `intrinsic_public_value_invariance_contract_expiry` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_free_agent` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_owner_category` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_promotion_relegation` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_transfer` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `negotiation_counter_path` | 2738 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required counter observations and at least one completed-after-counter path |
| `negotiation_offer_spread` | 10122 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required offers; not structural 100% asking/offer equality |
| `negotiation_seller_outcomes` | 10122 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required accepted, rejected, and countered observations |
| `public_potential_range_ordering` | 75210 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | current <= P50 <= public upper <= stored ceiling |
| `stored_ceiling_six_joint_profile` | 288 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every stored-ceiling-six observation has positive public value; asking is measured separately |
| `stored_ceiling_six_prospect_value_observations` | 188 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required positive-valued stored-ceiling-six prospect population |
| `young_stored_ceiling_prospect_share_first_division` | 4125 | 0 | 0 | 0 | matching=855 share_bps=2073 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points |
| `young_stored_ceiling_prospect_share_second_division` | 3646 | 0 | 0 | 0 | matching=489 share_bps=1341 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 800..1500 basis points |
| `young_stored_ceiling_prospect_share_third_division` | 3272 | 0 | 0 | 0 | matching=219 share_bps=669 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 400..800 basis points |
| `young_stored_ceiling_six_active_stock` | 60 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (4 or 5) |
| `young_stored_ceiling_six_no_inflation` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target |
| `young_stored_ceiling_six_stock_arrival_category_placement` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals; outside First Division <=1; every introduced First Division placement is title_contender or playoff_contender |
| `young_stored_ceiling_six_stock_arrival_club_uniqueness` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals introduce <=1 associated player per club; later market concentration remains descriptive |
| `young_stored_ceiling_six_vacancy_replacement` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=12 cohort_minimum=1 | adjacent-season vacancies are replenished to the closing snapshot's deterministic target |

## Closing Checkpoint Division Public Values

This cohort is the active senior stock at the explicitly named closing season checkpoint; it is not a year-ten proxy.

| Division | Observations | Median | P90 | P99 | Maximum | Fit |
|---|---:|---:|---:|---:|---:|---|
| first_division | 9308 | 256272200 | 1984213640 | 4810592535 | 13684000000 | fail |
| second_division | 8363 | 47399900 | 211983100 | 450027446 | 1170279800 | pass |
| third_division | 8099 | 11812400 | 43269620 | 92442222 | 462391300 | pass |

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
| `phase80a-prechange-baseline-world-00001` | first_division | 18 | 458 | 176665000/825245000/1789571600 | 7215495000/12817150000/13952482900 | 0.8880/0.9822/0.9977 | 151308000/1334375000 |
| `phase80a-prechange-baseline-world-00001` | second_division | 18 | 413 | 51570000/143172000/226677200 | 1402120000/2183787000/2462424200 | 0.8014/0.9710/0.9850 | 64213000/287210000 |
| `phase80a-prechange-baseline-world-00001` | third_division | 18 | 406 | 11650000/27865000/39248000 | 289130000/446103000/449192700 | 0.9769/0.9991/0.9999 | 328000/6705000 |
| `phase80a-prechange-baseline-world-00002` | first_division | 18 | 472 | 162355000/802324000/1652055100 | 7795360000/12996770000/13783985300 | 0.8455/0.9671/0.9872 | 329492000/1356355000 |
| `phase80a-prechange-baseline-world-00002` | second_division | 18 | 421 | 51770000/132680000/250982000 | 1285055000/2316082000/2471486800 | 0.8296/0.9797/0.9886 | 48667000/234345000 |
| `phase80a-prechange-baseline-world-00002` | third_division | 18 | 406 | 11225000/27550000/38312500 | 286305000/445199000/448304600 | 0.9797/0.9977/0.9998 | 998000/6145000 |
| `phase80a-prechange-baseline-world-00003` | first_division | 18 | 470 | 157870000/802069000/2231700500 | 7590880000/13280561000/13952146800 | 0.8746/0.9859/0.9997 | 168190000/1004705000 |
| `phase80a-prechange-baseline-world-00003` | second_division | 18 | 424 | 52420000/138966000/245045200 | 1359205000/2444893000/2488111700 | 0.8596/0.9809/0.9958 | 39151000/222340000 |
| `phase80a-prechange-baseline-world-00003` | third_division | 18 | 403 | 11800000/28114000/38553000 | 288015000/444724000/450782900 | 0.9738/0.9978/0.9993 | 971000/8660000 |
| `phase80a-prechange-baseline-world-00004` | first_division | 18 | 469 | 155490000/888238000/2089090800 | 7400635000/13559626000/14022414400 | 0.8622/0.9685/0.9986 | 440374000/1043460000 |
| `phase80a-prechange-baseline-world-00004` | second_division | 18 | 415 | 48360000/146030000/229890800 | 1294635000/2264058000/2446510300 | 0.8711/0.9807/0.9904 | 39379000/248025000 |
| `phase80a-prechange-baseline-world-00004` | third_division | 18 | 402 | 11300000/29113000/39969100 | 304380000/443487000/450869500 | 0.9624/0.9992/1.0000 | 350000/12020000 |
| `phase80a-prechange-baseline-world-00005` | first_division | 18 | 461 | 193470000/879570000/1810758000 | 7739775000/13472656000/13771678700 | 0.8644/0.9623/0.9837 | 341956000/1266190000 |
| `phase80a-prechange-baseline-world-00005` | second_division | 18 | 418 | 53595000/145110000/228992400 | 1387595000/2401415000/2512455700 | 0.9108/0.9840/0.9982 | 33632000/167575000 |
| `phase80a-prechange-baseline-world-00005` | third_division | 18 | 411 | 11080000/28870000/41572000 | 280545000/444705000/447009500 | 0.9868/0.9959/0.9999 | 1234000/4825000 |
| `phase80a-prechange-baseline-world-00006` | first_division | 18 | 473 | 157120000/840386000/2131078800 | 7402215000/13256798000/13932577200 | 0.8747/0.9640/0.9945 | 404346000/1123060000 |
| `phase80a-prechange-baseline-world-00006` | second_division | 18 | 421 | 53210000/129740000/231720000 | 1359985000/2380231000/2479403000 | 0.8460/0.9781/0.9918 | 47488000/242145000 |
| `phase80a-prechange-baseline-world-00006` | third_division | 18 | 408 | 10975000/28503000/41366700 | 283480000/447639000/449760500 | 0.9862/1.0000/1.0000 | 7000/3865000 |
| `phase80a-prechange-baseline-world-00007` | first_division | 18 | 462 | 155515000/802656000/2281910100 | 8234135000/13733707000/13864217800 | 0.8928/0.9844/0.9954 | 119125000/1162775000 |
| `phase80a-prechange-baseline-world-00007` | second_division | 18 | 419 | 53170000/139786000/234569000 | 1417195000/2317391000/2486192500 | 0.9063/0.9799/0.9945 | 45491000/208195000 |
| `phase80a-prechange-baseline-world-00007` | third_division | 18 | 407 | 11310000/28552000/47984400 | 296760000/447873000/448410100 | 0.9793/0.9993/1.0000 | 166000/5715000 |
| `phase80a-prechange-baseline-world-00008` | first_division | 18 | 468 | 180225000/827116000/1872825700 | 8024115000/13944574000/14001382500 | 0.8727/0.9993/1.0000 | 9149000/1224980000 |
| `phase80a-prechange-baseline-world-00008` | second_division | 18 | 419 | 53590000/145938000/221289200 | 1418485000/2458652000/2511691300 | 0.8698/0.9831/0.9998 | 38160000/211515000 |
| `phase80a-prechange-baseline-world-00008` | third_division | 18 | 403 | 10160000/29788000/44646000 | 287310000/438767000/440914500 | 0.9770/0.9975/0.9993 | 744000/9135000 |
| `phase80a-prechange-baseline-world-00009` | first_division | 18 | 458 | 152725000/880708000/1973471100 | 7929000000/13723429000/13973844000 | 0.8762/0.9802/0.9967 | 277693000/1200580000 |
| `phase80a-prechange-baseline-world-00009` | second_division | 18 | 419 | 56930000/133880000/214771200 | 1277165000/2444392000/2507773000 | 0.8268/0.9854/0.9997 | 26460000/219515000 |
| `phase80a-prechange-baseline-world-00009` | third_division | 18 | 402 | 11375000/28596000/41094000 | 268415000/443321000/449157300 | 0.9791/0.9988/1.0000 | 553000/6765000 |
| `phase80a-prechange-baseline-world-00010` | first_division | 18 | 460 | 168625000/829514000/1922163700 | 8062815000/13708316000/13929374600 | 0.8775/0.9792/0.9950 | 291684000/1275315000 |
| `phase80a-prechange-baseline-world-00010` | second_division | 18 | 424 | 52405000/135635000/217473600 | 1483835000/2431836000/2493236200 | 0.8702/0.9941/0.9978 | 13912000/206245000 |
| `phase80a-prechange-baseline-world-00010` | third_division | 18 | 405 | 10920000/28394000/41215200 | 283005000/405154000/448400200 | 0.9754/0.9887/0.9998 | 3490000/8605000 |
| `phase80a-prechange-baseline-world-00011` | first_division | 18 | 461 | 163900000/738600000/2089800000 | 6988760000/13733586000/13970923600 | 0.8762/0.9837/0.9979 | 201671000/1008260000 |
| `phase80a-prechange-baseline-world-00011` | second_division | 18 | 411 | 56920000/134360000/205102000 | 1361495000/2202130000/2476760300 | 0.8478/0.9796/0.9907 | 48310000/216900000 |
| `phase80a-prechange-baseline-world-00011` | third_division | 18 | 409 | 11220000/28068000/41604400 | 271855000/449563000/452859700 | 0.9760/0.9977/1.0000 | 613000/7265000 |
| `phase80a-prechange-baseline-world-00012` | first_division | 18 | 463 | 167030000/846724000/1972728000 | 7933490000/13700466000/13853579600 | 0.8884/0.9819/0.9907 | 232874000/1147060000 |
| `phase80a-prechange-baseline-world-00012` | second_division | 18 | 410 | 57565000/141984000/224247000 | 1468265000/2237302000/2449879300 | 0.8623/0.9798/0.9899 | 44078000/192950000 |
| `phase80a-prechange-baseline-world-00012` | third_division | 18 | 408 | 11160000/29577000/40509000 | 325605000/439217000/448905600 | 0.9873/1.0000/1.0000 | 0/3620000 |
| `phase80a-prechange-baseline-world-00013` | first_division | 18 | 465 | 165390000/777228000/1956069600 | 7603695000/13502743000/13987813400 | 0.8268/0.9855/0.9991 | 176727000/1398925000 |
| `phase80a-prechange-baseline-world-00013` | second_division | 18 | 424 | 52310000/135281000/233321400 | 1304310000/2454099000/2489372700 | 0.8649/0.9873/0.9958 | 30321000/180080000 |
| `phase80a-prechange-baseline-world-00013` | third_division | 18 | 404 | 11345000/27834000/39648600 | 310410000/442747000/449412900 | 0.9788/0.9998/1.0000 | 82000/5440000 |
| `phase80a-prechange-baseline-world-00014` | first_division | 18 | 471 | 157150000/863020000/2041107000 | 8046425000/13740979000/13950802900 | 0.8549/0.9833/0.9973 | 217845000/1064470000 |
| `phase80a-prechange-baseline-world-00014` | second_division | 18 | 414 | 52520000/138617000/218112800 | 1357780000/2474468000/2492389200 | 0.8351/0.9932/0.9970 | 14948000/215195000 |
| `phase80a-prechange-baseline-world-00014` | third_division | 18 | 402 | 10795000/29139000/41709400 | 279925000/440082000/448515700 | 0.9763/0.9994/0.9999 | 254000/9355000 |
| `phase80a-prechange-baseline-world-00015` | first_division | 18 | 465 | 168860000/815408000/2095943200 | 7912965000/13809168000/13964782300 | 0.8595/0.9864/0.9975 | 190832000/1309175000 |
| `phase80a-prechange-baseline-world-00015` | second_division | 18 | 423 | 53930000/141712000/224792400 | 1377615000/2382917000/2495908800 | 0.8460/0.9924/0.9984 | 16416000/224745000 |
| `phase80a-prechange-baseline-world-00015` | third_division | 18 | 396 | 11100000/29065000/41010000 | 288275000/443970000/447454200 | 0.9779/1.0000/1.0000 | 0/7945000 |
| `phase80a-prechange-baseline-world-00016` | first_division | 18 | 471 | 174300000/807620000/2070773000 | 7823685000/13889254000/13981266100 | 0.8606/0.9921/0.9987 | 110746000/1394110000 |
| `phase80a-prechange-baseline-world-00016` | second_division | 18 | 417 | 53520000/139148000/251172400 | 1256990000/2467739000/2480321900 | 0.8116/0.9896/0.9986 | 26001000/231005000 |
| `phase80a-prechange-baseline-world-00016` | third_division | 18 | 401 | 11540000/28410000/39830000 | 271770000/443060000/448796400 | 0.9735/0.9972/0.9978 | 1246000/8950000 |
| `phase80a-prechange-baseline-world-00017` | first_division | 18 | 471 | 138560000/822000000/2078649000 | 8433720000/13705268000/13963121000 | 0.8494/0.9896/1.0000 | 97320000/1376415000 |
| `phase80a-prechange-baseline-world-00017` | second_division | 18 | 420 | 56315000/137991000/205228100 | 1425205000/2360796000/2502520800 | 0.8776/0.9819/0.9979 | 39979000/203995000 |
| `phase80a-prechange-baseline-world-00017` | third_division | 18 | 405 | 11470000/27562000/40266400 | 282615000/403937000/449395100 | 0.9688/0.9975/0.9998 | 615000/9020000 |
| `phase80a-prechange-baseline-world-00018` | first_division | 18 | 470 | 164875000/828636000/2045492700 | 8024140000/13499470000/13839888300 | 0.8695/0.9644/0.9886 | 365264000/1081740000 |
| `phase80a-prechange-baseline-world-00018` | second_division | 18 | 419 | 51420000/144996000/222628200 | 1401425000/2462132000/2501152400 | 0.8467/0.9849/0.9996 | 37868000/249985000 |
| `phase80a-prechange-baseline-world-00018` | third_division | 18 | 402 | 10835000/28432000/42055000 | 297700000/432076000/444258500 | 0.9798/0.9991/1.0000 | 302000/8480000 |
| `phase80a-prechange-baseline-world-00019` | first_division | 18 | 461 | 152690000/832550000/2638412000 | 7861430000/13957959000/14017404800 | 0.8540/0.9970/0.9996 | 42041000/1219730000 |
| `phase80a-prechange-baseline-world-00019` | second_division | 18 | 416 | 52875000/142905000/224754000 | 1433115000/2461911000/2495348400 | 0.8511/0.9914/0.9993 | 20684000/215545000 |
| `phase80a-prechange-baseline-world-00019` | third_division | 18 | 410 | 10925000/28643000/40471200 | 289560000/431441000/450433600 | 0.9784/0.9980/0.9991 | 831000/5485000 |
| `phase80a-prechange-baseline-world-00020` | first_division | 18 | 459 | 171040000/799406000/2310994800 | 8727060000/12890648000/14033382200 | 0.8898/0.9942/0.9991 | 65771000/1217770000 |
| `phase80a-prechange-baseline-world-00020` | second_division | 18 | 416 | 53585000/136485000/216882500 | 1243575000/2470736000/2494986600 | 0.8251/0.9883/0.9980 | 29264000/243120000 |
| `phase80a-prechange-baseline-world-00020` | third_division | 18 | 409 | 11040000/29368000/40968800 | 277880000/442758000/447200300 | 0.9780/1.0000/1.0000 | 0/6065000 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 30441356464/32822428521.5/36682023636.76 | 6082175764/12000000000/16316670703.91 | 0/125371700/315599160 | 0/949593000/2322121500 | 65/14/17 |
| `phase80a-prechange-baseline-world-00001` | second_division | 6185052465.5/7464290176.9/7790893608.08 | 1234292564/1777322676.9/2535379098.08 | 0/1879900/3375620 | 0/31343000/56258700 | 89/9/0 |
| `phase80a-prechange-baseline-world-00001` | third_division | 1308289273.5/1446348475.3/1569697346.34 | 140000000/300000000/300000000 | 0/0/2963100 | 0/0/21165000 | 44/6/0 |
| `phase80a-prechange-baseline-world-00002` | first_division | 31349349186.5/34934340293.2/40277266863.5 | 6860220714/12636406588.9/13398017158.45 | 2923000/37164000/153110650 | 48715000/448715000/1675200900 | 80/7/27 |
| `phase80a-prechange-baseline-world-00002` | second_division | 6091973404.5/7150632215.5/7235487817.3 | 1020000000/1565546351.1/1739578678.99 | 0/1882000/8367200 | 0/31365000/139457800 | 94/6/2 |
| `phase80a-prechange-baseline-world-00002` | third_division | 1313285011.5/1520671456.7/1553195016.25 | 140000000/300000000/300000000 | 0/0/5283780 | 0/0/37740100 | 44/6/0 |
| `phase80a-prechange-baseline-world-00003` | first_division | 31255464745/33874260282.5/35252543214.19 | 6800000000/12000000000/12514826656.4 | 3795500/92471700/301780880 | 63260000/807757000/2158390000 | 72/15/27 |
| `phase80a-prechange-baseline-world-00003` | second_division | 6033648010.5/6919462205.1/7439216150.04 | 1100179464.5/1500786534.9/1531904090.04 | 0/3557700/8783160 | 0/53628000/107865300 | 79/9/0 |
| `phase80a-prechange-baseline-world-00003` | third_division | 1294209671/1581100321.1/3219102190.36 | 133040313.5/356517611.3/2208172060.36 | 0/0/278050 | 0/0/4631400 | 64/10/0 |
| `phase80a-prechange-baseline-world-00004` | first_division | 30066285224/34773621100.9/37031171754.37 | 6800000000/12000000000/12023356220.75 | 0/48752600/164111570 | 0/812546000/1289041200 | 80/10/30 |
| `phase80a-prechange-baseline-world-00004` | second_division | 6089298076/7179423269/7432074932.87 | 1180000000/1532123439.4/1720180736.36 | 0/1418100/23167110 | 0/16710000/257149300 | 94/13/3 |
| `phase80a-prechange-baseline-world-00004` | third_division | 1346910046.5/1414559085.5/1599025426.8 | 128773127/299195000/300000000 | 0/0/0 | 0/0/0 | 65/9/0 |
| `phase80a-prechange-baseline-world-00005` | first_division | 31537287750/33809795643.2/36276606774.6 | 6935210152/12000000000/12000000000 | 2548500/34185300/89282150 | 42480000/377169000/810716200 | 84/11/22 |
| `phase80a-prechange-baseline-world-00005` | second_division | 6194062305.5/6816664260/7303918731.99 | 927187116.5/1500000000/1654569891.55 | 0/859000/1463540 | 0/14318000/24389000 | 80/9/0 |
| `phase80a-prechange-baseline-world-00005` | third_division | 1299298996.5/1460361095.9/1492891882.03 | 143320720/300000000/300000000 | 0/0/0 | 0/0/0 | 20/5/0 |
| `phase80a-prechange-baseline-world-00006` | first_division | 30926755060/35165408526.7/37911204851.81 | 7196904827.5/12013626990.3/12290353544.57 | 2410000/46160000/225639740 | 40165000/431457000/1991111700 | 78/13/27 |
| `phase80a-prechange-baseline-world-00006` | second_division | 6173672182.5/6769137110.6/7258421304.6 | 860000000/1524470513.1/1611969441.04 | 0/9571700/27864950 | 0/111430000/228727000 | 89/7/0 |
| `phase80a-prechange-baseline-world-00006` | third_division | 1316096602.5/1404050429.6/1412779672.94 | 113000000/300000000/300000000 | 0/0/0 | 0/0/0 | 25/3/0 |
| `phase80a-prechange-baseline-world-00007` | first_division | 31297262248/33042005605.2/36015951242.15 | 6800000000/12000000000/12000000000 | 0/35112600/245928490 | 0/353238000/1851004400 | 87/12/27 |
| `phase80a-prechange-baseline-world-00007` | second_division | 6060855471.5/7161297859.8/7491760515.51 | 1180000000/1540732712/2095705522.31 | 0/7564700/10431310 | 0/113914000/131282300 | 96/12/0 |
| `phase80a-prechange-baseline-world-00007` | third_division | 1287372737.5/1519718545.8/1648498914.34 | 140000000/300000000/300000000 | 0/233100/2271830 | 0/3885000/23598900 | 37/8/0 |
| `phase80a-prechange-baseline-world-00008` | first_division | 30272174327.5/35674266968/38080495898.09 | 7379183349/11989696000/12704008199.5 | 5202500/98498200/257493660 | 66540000/983517000/2053881300 | 64/7/23 |
| `phase80a-prechange-baseline-world-00008` | second_division | 6201146622.5/6980395242.4/8199467353.2 | 861086519/1500000000/2850289034.97 | 0/3906200/11396470 | 0/65100000/189940600 | 96/12/0 |
| `phase80a-prechange-baseline-world-00008` | third_division | 1305737714/1468919930.8/1526366592.14 | 164730537.5/300000000/300000000 | 0/0/761110 | 0/0/12682400 | 34/10/0 |
| `phase80a-prechange-baseline-world-00009` | first_division | 31379665725/33865485919.5/39392884803.16 | 6800000000/11997382000/14233696245.68 | 1882000/98374200/112826010 | 31360000/1047334000/1155906400 | 89/18/20 |
| `phase80a-prechange-baseline-world-00009` | second_division | 6106327065/6778065577.8/7259942122.33 | 926639070/1500000000/1545907851.12 | 0/1474600/2888710 | 0/24570000/48138500 | 90/8/0 |
| `phase80a-prechange-baseline-world-00009` | third_division | 1306555541/1556893345.5/1849304531.13 | 140000000/353890753.8/506148205.87 | 0/0/0 | 0/0/0 | 32/4/0 |
| `phase80a-prechange-baseline-world-00010` | first_division | 31098769705/34315654964.9/36590904990.27 | 7337854509/12000000000/12000000000 | 0/38471800/91103170 | 0/545237000/1518389500 | 86/19/23 |
| `phase80a-prechange-baseline-world-00010` | second_division | 6094990601.5/6905897039.7/7349492729.71 | 860000000/1562584126.5/1572694541.14 | 0/5336400/20726780 | 0/68687000/238173800 | 79/18/0 |
| `phase80a-prechange-baseline-world-00010` | third_division | 1309704420/1426940016.9/1655605469.48 | 137170436.5/300000000/343713647.35 | 0/0/0 | 0/0/0 | 72/19/0 |
| `phase80a-prechange-baseline-world-00011` | first_division | 30765561218/34990031341.5/38575348918.99 | 8023815797.5/12000000000/12000000000 | 1208000/48590400/258403460 | 20135000/577712000/2023826700 | 89/13/23 |
| `phase80a-prechange-baseline-world-00011` | second_division | 6181023739/6743337477.9/7008904718.31 | 1000082253/1500000000/1552408361.32 | 0/2911500/10088460 | 0/21786000/102026900 | 91/13/0 |
| `phase80a-prechange-baseline-world-00011` | third_division | 1280317694/1519067315.4/1572320995.37 | 132872933/329774829/428711764.87 | 0/0/0 | 0/0/0 | 35/8/0 |
| `phase80a-prechange-baseline-world-00012` | first_division | 31093167088.5/34708058015.7/39832884199.56 | 6800000000/12095365519.2/12794966454.48 | 0/43737000/236814840 | 0/507779000/1795560100 | 84/12/22 |
| `phase80a-prechange-baseline-world-00012` | second_division | 6204602396/6658187870.9/7029085756.95 | 860000000/1500000000/1721319070.89 | 0/617400/3100480 | 0/10293000/51681900 | 88/8/0 |
| `phase80a-prechange-baseline-world-00012` | third_division | 1263463001/1462039123.6/1467916706.4 | 113376061/300000000/300000000 | 0/0/0 | 0/0/0 | 25/6/0 |
| `phase80a-prechange-baseline-world-00013` | first_division | 30121307250.5/36436809408.6/37227849698.93 | 8005421050/12000000000/12000000000 | 6436000/37709500/60122340 | 107260000/482759000/1002043400 | 90/3/26 |
| `phase80a-prechange-baseline-world-00013` | second_division | 5966599060/6941278469.5/7553929590.03 | 1005180447/1520137023/1658535729.75 | 0/3439300/7250510 | 0/51012000/117839000 | 88/13/1 |
| `phase80a-prechange-baseline-world-00013` | third_division | 1320598662.5/1516681829.4/2855579696.68 | 152371994/300000000/1583224308.72 | 0/312600/4250780 | 0/5208000/32051000 | 30/5/0 |
| `phase80a-prechange-baseline-world-00014` | first_division | 30658151582.5/35085731188.5/37404751670.42 | 7590140437/12000000000/12000000000 | 295000/22186100/74284270 | 4915000/369773000/1238068400 | 63/9/27 |
| `phase80a-prechange-baseline-world-00014` | second_division | 6024518263/7111442906.7/7175225378.57 | 1105904100/1489859965.9/1500000000 | 0/3053000/8503770 | 0/50881000/80168400 | 78/11/0 |
| `phase80a-prechange-baseline-world-00014` | third_division | 1298699242/1640892084.8/3321777608 | 190651417.5/309886274.3/2121110578 | 0/0/0 | 0/0/0 | 60/11/0 |
| `phase80a-prechange-baseline-world-00015` | first_division | 30759090323.5/33845171080.8/35251371907.8 | 6800000000/12000000000/12000000000 | 0/45169100/113154160 | 0/477726000/1112006900 | 60/4/25 |
| `phase80a-prechange-baseline-world-00015` | second_division | 6198846315.5/6817866368.4/6878768171.12 | 1072705042/1500000000/1544836649.8 | 0/3662300/7727800 | 0/60272000/94336500 | 83/4/0 |
| `phase80a-prechange-baseline-world-00015` | third_division | 1340780834/1459238466.9/3347288587.94 | 137424016/300000000/2226437425.18 | 0/0/0 | 0/0/0 | 39/5/0 |
| `phase80a-prechange-baseline-world-00016` | first_division | 30654010290.5/34703282640.9/38395001404.04 | 6800000000/12000000000/12000000000 | 674000/46752100/96028590 | 11235000/539626000/706157700 | 73/16/26 |
| `phase80a-prechange-baseline-world-00016` | second_division | 6164740273/6803482290.6/7245869783.63 | 892339316/1500000000/1562337029.65 | 0/6685400/35464650 | 0/93136000/295759200 | 84/12/0 |
| `phase80a-prechange-baseline-world-00016` | third_division | 1326894154.5/1571430761.5/3372508522.52 | 148377082.5/313313541.9/2341168381.42 | 0/0/0 | 0/0/0 | 52/9/1 |
| `phase80a-prechange-baseline-world-00017` | first_division | 31112116891/33393977317.9/36396127081.31 | 6483827423/12000000000/12688793857.11 | 885000/112462000/345864020 | 14750000/1064710000/2520007800 | 66/9/30 |
| `phase80a-prechange-baseline-world-00017` | second_division | 6211373448.5/6504207891.3/7011319752.06 | 860000000/1493504000/1500000000 | 0/5440800/13278410 | 0/74620000/147236500 | 88/3/1 |
| `phase80a-prechange-baseline-world-00017` | third_division | 1301802115/1509576285.4/1578331719.23 | 151426726/300000000/304095054 | 0/120600/3603310 | 0/2010000/36488700 | 46/4/0 |
| `phase80a-prechange-baseline-world-00018` | first_division | 30834276460.5/33976417034.5/35618651365.11 | 7165328512.5/12000000000/12420046247.28 | 2096500/17554200/76247380 | 34945000/230866000/570986500 | 82/13/27 |
| `phase80a-prechange-baseline-world-00018` | second_division | 6196950658/6836511796.2/7680696792.82 | 907222334.5/1500000000/2200243317.01 | 0/12306300/35508950 | 0/138910000/266421400 | 85/11/0 |
| `phase80a-prechange-baseline-world-00018` | third_division | 1346261090/1530041935/1616498860.6 | 135642869/304137434.4/378398682.86 | 0/0/354410 | 0/0/5901300 | 43/8/0 |
| `phase80a-prechange-baseline-world-00019` | first_division | 30521033600.5/35048842957.1/36045930710.95 | 6876431446/11980491000/12000000000 | 1162000/8572600/16951460 | 19370000/142875000/181708700 | 72/3/25 |
| `phase80a-prechange-baseline-world-00019` | second_division | 6166019740.5/6989015192.6/7791899517.66 | 965161187.5/1500000000/2767224464.29 | 0/6906400/36112220 | 0/86810000/277426800 | 83/3/0 |
| `phase80a-prechange-baseline-world-00019` | third_division | 1297367212/1464775530.6/1487868762.61 | 140000000/298656000/300000000 | 0/604800/2061500 | 0/10080000/15711000 | 34/2/0 |
| `phase80a-prechange-baseline-world-00020` | first_division | 31003289153/34108854178.8/37805046817.11 | 6800000000/11938967000/13305653856.05 | 5704500/167641200/263381010 | 95075000/1206998000/1913199500 | 80/18/24 |
| `phase80a-prechange-baseline-world-00020` | second_division | 6202107325/6909248150.8/7029016326.11 | 1136218884.5/1500000000/1735424005.4 | 0/10133000/12536690 | 0/118555000/150061200 | 86/6/0 |
| `phase80a-prechange-baseline-world-00020` | third_division | 1327357945/1473360036.5/1492513897.14 | 156334357.5/304903872.6/330215699.7 | 0/92400/4276230 | 0/1539000/34304500 | 44/5/0 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00001` | first_division -> first_division | 55 | 10 | 855797200 | 1036758555 | 901225989 | fee_below_valuation=30, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00001` | first_division -> second_division | 6 | 4 | 18690150 | 16965389 | 16029945 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> first_division | 7 | 3 | 67496900 | 87327489 | 80777895 | fee_below_valuation=2, player_not_for_sale=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> second_division | 83 | 5 | 157455200 | 192331800 | 121255457 | fee_below_valuation=58, player_unwilling=17, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00001` | second_division -> third_division | 11 | 1 | 28672600 | 32256675 | 20986150 | fee_below_valuation=7, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00001` | third_division -> first_division | 3 | 1 | 51161400 | 76486293 | 74574097 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00001` | third_division -> third_division | 33 | 5 | 12663200 | 14246100 | 9619896 | fee_below_valuation=24, unaffordable=2, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00002` | first_division -> first_division | 80 | 7 | 1050004000 | 1401887137.5 | 485771200 | fee_below_valuation=59, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00002` | second_division -> second_division | 87 | 3 | 156368600 | 194070960 | 183087580 | fee_below_valuation=62, player_unwilling=17, unaffordable=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00002` | second_division -> third_division | 15 | 2 | 31079000 | 34963875 | 20646853.5 | fee_below_valuation=8, player_unwilling=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00002` | third_division -> second_division | 7 | 3 | 35110800 | 42132960 | 38972980 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00002` | third_division -> third_division | 29 | 4 | 16070000 | 20435153 | 12191623 | player_unwilling=7, fee_below_valuation=17 |
| `phase80a-prechange-baseline-world-00003` | first_division -> first_division | 60 | 11 | 653238000 | 825588200 | 628361085 | fee_below_valuation=35, player_unwilling=7, stale_ownership=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | first_division -> second_division | 4 | 2 | 24980350 | 32125881 | 30118778.5 | unaffordable=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> first_division | 12 | 4 | 131018850 | 170840468 | 201576109 | stale_ownership=3, fee_below_valuation=3, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> second_division | 65 | 3 | 161753400 | 254761605 | 40870000 | fee_below_valuation=42, player_unwilling=13, unaffordable=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> third_division | 12 | 1 | 30567600 | 34388550 | 94504888 | fee_below_valuation=9, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00003` | third_division -> second_division | 10 | 4 | 8042700 | 8042700 | 29808252.5 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00003` | third_division -> third_division | 52 | 9 | 10077900 | 12264210 | 6633949 | fee_below_valuation=25, player_unwilling=16, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | first_division -> first_division | 79 | 9 | 933749900 | 1068797835 | 792426200 | stale_ownership=4, fee_below_valuation=48, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00004` | first_division -> second_division | 4 | 1 | 14919550 | 15441734.5 | 11121075 | stale_ownership=2, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00004` | second_division -> first_division | 1 | 1 | 380081700 | 611931537 | 596633219 | none |
| `phase80a-prechange-baseline-world-00004` | second_division -> second_division | 85 | 10 | 150483900 | 192296071 | 172569284 | fee_below_valuation=59, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00004` | second_division -> third_division | 10 | 3 | 21687400 | 24398325 | 10784227 | fee_below_valuation=7 |
| `phase80a-prechange-baseline-world-00004` | third_division -> second_division | 5 | 2 | 62357500 | 87300500 | 56108127 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> third_division | 55 | 6 | 9794800 | 11574300 | 11152375.5 | fee_below_valuation=30, player_unwilling=16, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | first_division -> first_division | 84 | 11 | 1225315200 | 1491696900 | 857639250 | fee_below_valuation=61, player_unwilling=8 |
| `phase80a-prechange-baseline-world-00005` | first_division -> second_division | 2 | 1 | 41494600 | 57262548 | 15774878 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00005` | second_division -> second_division | 73 | 7 | 139074800 | 183320280 | 68684700 | player_unwilling=9, fee_below_valuation=52, unaffordable=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> second_division | 5 | 1 | 42952300 | 51542760 | 91579600 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00005` | third_division -> third_division | 20 | 5 | 11654450 | 12081825.5 | 10802500 | fee_below_valuation=7, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00006` | first_division -> first_division | 68 | 11 | 570171500 | 755064195 | 134004203 | fee_below_valuation=40, player_unwilling=13, stale_ownership=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00006` | first_division -> second_division | 1 | 0 | 7824900 | 8638690 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | second_division -> first_division | 6 | 1 | 86308000 | 89328780 | 195981184 | fee_below_valuation=3, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | second_division -> second_division | 87 | 7 | 127557500 | 162526905 | 170402525 | player_unwilling=14, fee_below_valuation=62 |
| `phase80a-prechange-baseline-world-00006` | second_division -> third_division | 2 | 1 | 25498400 | 30524518 | 17912199 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> first_division | 4 | 1 | 9563700 | 12373515 | 15154595 | fee_below_valuation=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | third_division -> second_division | 1 | 0 | 9266100 | 11119320 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> third_division | 23 | 2 | 10519000 | 11833875 | 6126276 | fee_below_valuation=14, player_unwilling=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00007` | first_division -> first_division | 76 | 8 | 888982400 | 1066778880 | 625717100 | player_unwilling=8, fee_below_valuation=56, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00007` | first_division -> second_division | 5 | 2 | 35631900 | 40639896 | 36438811.5 | player_unwilling=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00007` | second_division -> first_division | 7 | 2 | 182377500 | 283141069 | 184807583 | fee_below_valuation=3, stale_ownership=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> second_division | 83 | 7 | 183233300 | 212891085 | 113154657 | fee_below_valuation=65, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00007` | second_division -> third_division | 13 | 2 | 47341400 | 56809680 | 47966925 | player_unwilling=1, fee_below_valuation=9 |
| `phase80a-prechange-baseline-world-00007` | third_division -> first_division | 4 | 2 | 81527200 | 135604387 | 133926342.5 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00007` | third_division -> second_division | 8 | 3 | 48375000 | 65306250 | 62313095 | fee_below_valuation=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> third_division | 24 | 6 | 10497900 | 12161100 | 11732875 | fee_below_valuation=9, player_unwilling=5, unaffordable=3 |
| `phase80a-prechange-baseline-world-00008` | first_division -> first_division | 64 | 7 | 925209800 | 1052234831.5 | 641663833 | fee_below_valuation=44, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00008` | second_division -> second_division | 84 | 9 | 158766200 | 201343230 | 114020390 | fee_below_valuation=56, player_unwilling=16, unaffordable=1 |
| `phase80a-prechange-baseline-world-00008` | second_division -> third_division | 4 | 2 | 40188150 | 45211669 | 23235051 | player_unwilling=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00008` | third_division -> second_division | 12 | 3 | 44364400 | 55164795 | 55664955 | fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00008` | third_division -> third_division | 30 | 8 | 10829100 | 10727840 | 12433659.5 | player_unwilling=4, fee_below_valuation=14, unaffordable=2 |
| `phase80a-prechange-baseline-world-00009` | first_division -> first_division | 86 | 17 | 736871300 | 958681440 | 199944450 | fee_below_valuation=46, player_unwilling=15, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00009` | first_division -> second_division | 4 | 1 | 30251150 | 30162939 | 15084628 | fee_below_valuation=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> first_division | 1 | 1 | 9773600 | 13487568 | 12138784 | none |
| `phase80a-prechange-baseline-world-00009` | second_division -> second_division | 85 | 6 | 161393300 | 225950620 | 135485766.5 | fee_below_valuation=63, player_unwilling=12, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> third_division | 6 | 0 | 61267100 | 77755882.5 | 0 | fee_below_valuation=5, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> first_division | 2 | 0 | 10578500 | 14598330 | 0 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> second_division | 1 | 1 | 34886400 | 41863680 | 40817040 | none |
| `phase80a-prechange-baseline-world-00009` | third_division -> third_division | 26 | 4 | 11117900 | 12982980 | 11808266 | fee_below_valuation=14, player_unwilling=4, unaffordable=2 |
| `phase80a-prechange-baseline-world-00010` | first_division -> first_division | 78 | 15 | 757582600 | 816910586.5 | 521615150 | fee_below_valuation=42, player_unwilling=10, stale_ownership=4, player_not_for_sale=3 |
| `phase80a-prechange-baseline-world-00010` | first_division -> second_division | 9 | 5 | 21501200 | 23737325 | 17459249 | fee_below_valuation=3, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00010` | second_division -> first_division | 8 | 4 | 137666900 | 158883864 | 71526961 | stale_ownership=2, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00010` | second_division -> second_division | 60 | 10 | 150491500 | 183718380.5 | 189176546.5 | fee_below_valuation=36, stale_ownership=2, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00010` | second_division -> third_division | 11 | 3 | 25859300 | 25859300 | 8503982 | fee_below_valuation=5, player_unwilling=1, unaffordable=2 |
| `phase80a-prechange-baseline-world-00010` | third_division -> second_division | 10 | 3 | 41719200 | 60010256.5 | 46485604 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00010` | third_division -> third_division | 61 | 16 | 10461500 | 10963688 | 9747692 | player_unwilling=11, fee_below_valuation=29, unaffordable=2 |
| `phase80a-prechange-baseline-world-00011` | first_division -> first_division | 79 | 10 | 780728400 | 1078728980 | 515534872.5 | fee_below_valuation=47, player_unwilling=12, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00011` | first_division -> second_division | 6 | 1 | 18031500 | 23091360.5 | 13619988 | stale_ownership=2, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00011` | second_division -> first_division | 7 | 2 | 17612800 | 22787441 | 59138140.5 | stale_ownership=3, fee_below_valuation=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00011` | second_division -> second_division | 79 | 11 | 136017700 | 183623895 | 176372200 | fee_below_valuation=54, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00011` | second_division -> third_division | 6 | 1 | 38085400 | 38085400 | 34276850 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00011` | third_division -> first_division | 3 | 1 | 15267100 | 21068598 | 17473047 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00011` | third_division -> second_division | 6 | 1 | 39879300 | 50550270 | 42274790 | fee_below_valuation=4, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> third_division | 29 | 7 | 14419600 | 16259625 | 7601100 | player_unwilling=10, fee_below_valuation=12 |
| `phase80a-prechange-baseline-world-00012` | first_division -> first_division | 83 | 12 | 893171800 | 1174577040 | 975820520 | player_unwilling=8, stale_ownership=5, fee_below_valuation=53, unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | first_division -> second_division | 2 | 2 | 51318400 | 60915063.5 | 56346407 | none |
| `phase80a-prechange-baseline-world-00012` | second_division -> first_division | 1 | 0 | 55612000 | 62563500 | 0 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> second_division | 74 | 4 | 171092200 | 230974470 | 145443270.5 | player_unwilling=11, fee_below_valuation=56, unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> third_division | 4 | 1 | 21357650 | 25757733 | 15128680 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00012` | third_division -> second_division | 12 | 2 | 17794850 | 24666934 | 8880217 | fee_below_valuation=8, unaffordable=2 |
| `phase80a-prechange-baseline-world-00012` | third_division -> third_division | 21 | 5 | 12384500 | 13595400 | 8592120 | fee_below_valuation=9, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00013` | first_division -> first_division | 90 | 3 | 1223373400 | 1749010455 | 1800851738 | player_unwilling=18, fee_below_valuation=65, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | first_division -> second_division | 1 | 1 | 24940100 | 34417338 | 30975569 | none |
| `phase80a-prechange-baseline-world-00013` | second_division -> second_division | 80 | 10 | 136821900 | 170709280 | 139176360 | fee_below_valuation=52, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00013` | second_division -> third_division | 6 | 1 | 53673500 | 72459225 | 6524815 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00013` | third_division -> second_division | 7 | 2 | 13230600 | 15876720 | 34717155 | fee_below_valuation=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | third_division -> third_division | 24 | 4 | 13817900 | 15331129 | 12896682.5 | player_unwilling=4, fee_below_valuation=14, unaffordable=1 |
| `phase80a-prechange-baseline-world-00014` | first_division -> first_division | 55 | 4 | 1002674300 | 1128008588 | 234217537 | fee_below_valuation=36, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00014` | first_division -> second_division | 5 | 2 | 30210000 | 33351840 | 16039340 | fee_below_valuation=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> first_division | 6 | 4 | 120401750 | 162538254 | 152377002.5 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> second_division | 67 | 6 | 158730100 | 203817465 | 54261850 | fee_below_valuation=47, stale_ownership=1, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00014` | second_division -> third_division | 6 | 2 | 15113250 | 15550164 | 11159437 | player_unwilling=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00014` | third_division -> first_division | 2 | 1 | 9657500 | 11404360 | 15753510 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00014` | third_division -> second_division | 6 | 3 | 48511750 | 64544895 | 55642600 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00014` | third_division -> third_division | 54 | 9 | 10956200 | 13962780 | 13002390 | fee_below_valuation=25, player_unwilling=15, unaffordable=1 |
| `phase80a-prechange-baseline-world-00015` | first_division -> first_division | 60 | 4 | 1049214100 | 1259056920 | 1258977359.5 | fee_below_valuation=42, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00015` | second_division -> second_division | 82 | 4 | 163109200 | 224572200 | 167464425 | fee_below_valuation=60, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00015` | second_division -> third_division | 3 | 0 | 15835300 | 17814713 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00015` | third_division -> second_division | 1 | 0 | 40303300 | 48363960 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> third_division | 36 | 5 | 14640800 | 19765080 | 7374116 | fee_below_valuation=28, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00016` | first_division -> first_division | 63 | 11 | 668001000 | 751501125 | 676599220 | player_unwilling=16, fee_below_valuation=27, stale_ownership=3, player_not_for_sale=3, unaffordable=2 |
| `phase80a-prechange-baseline-world-00016` | first_division -> second_division | 5 | 3 | 11026200 | 14484232 | 14484232 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00016` | second_division -> first_division | 7 | 3 | 123850500 | 192277901 | 182664001 | fee_below_valuation=1, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00016` | second_division -> second_division | 76 | 7 | 124957300 | 170246610 | 112564500 | fee_below_valuation=52, player_unwilling=11, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00016` | second_division -> third_division | 13 | 3 | 14568300 | 13985568 | 29508615 | fee_below_valuation=6, stale_ownership=1, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> first_division | 3 | 2 | 1890353000 | 2543469962 | 1285712738.5 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> second_division | 3 | 2 | 9700100 | 10039604 | 24245454.5 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> third_division | 39 | 6 | 12202400 | 15327563 | 11804491 | fee_below_valuation=23, player_unwilling=8, unaffordable=1 |
| `phase80a-prechange-baseline-world-00017` | first_division -> first_division | 62 | 6 | 910068100 | 1156514917.5 | 438509463.5 | player_unwilling=13, fee_below_valuation=38, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00017` | first_division -> second_division | 5 | 1 | 14542000 | 19044476 | 16305200 | stale_ownership=3, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> second_division | 79 | 1 | 138987400 | 172433070 | 296343703 | fee_below_valuation=59, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00017` | second_division -> third_division | 8 | 0 | 38780300 | 43627838 | 0 | player_unwilling=2, fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00017` | third_division -> first_division | 4 | 3 | 34368100 | 41942818.5 | 61317590 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> second_division | 4 | 1 | 11569400 | 13883280 | 13883280 | stale_ownership=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00017` | third_division -> third_division | 38 | 4 | 14401300 | 14332230 | 7173650 | player_unwilling=7, fee_below_valuation=25 |
| `phase80a-prechange-baseline-world-00018` | first_division -> first_division | 79 | 12 | 852976800 | 980427791 | 968172443.5 | fee_below_valuation=52, player_unwilling=10, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00018` | first_division -> second_division | 1 | 1 | 8459700 | 9339509 | 8639005 | none |
| `phase80a-prechange-baseline-world-00018` | second_division -> first_division | 3 | 1 | 12569100 | 21610054 | 9339509 | fee_below_valuation=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00018` | second_division -> second_division | 78 | 7 | 135740600 | 178502272.5 | 163568900 | fee_below_valuation=64, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00018` | second_division -> third_division | 13 | 3 | 30690600 | 36159117 | 35255109 | fee_below_valuation=8 |
| `phase80a-prechange-baseline-world-00018` | third_division -> second_division | 6 | 3 | 44565250 | 66482001.5 | 56365640 | unaffordable=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00018` | third_division -> third_division | 30 | 5 | 12568000 | 14430037.5 | 13025850 | fee_below_valuation=18, unaffordable=1, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00019` | first_division -> first_division | 72 | 3 | 1030899450 | 1398728520 | 1003916082 | fee_below_valuation=44, player_unwilling=21 |
| `phase80a-prechange-baseline-world-00019` | second_division -> second_division | 80 | 2 | 161700000 | 248494759 | 281625013.5 | fee_below_valuation=63, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00019` | second_division -> third_division | 7 | 2 | 14832100 | 22067198 | 16393986.5 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00019` | third_division -> second_division | 3 | 1 | 50124800 | 67668480 | 65976740 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00019` | third_division -> third_division | 27 | 0 | 12526900 | 16911315 | 0 | fee_below_valuation=14, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00020` | first_division -> first_division | 68 | 12 | 580883750 | 658347412.5 | 259037033 | fee_below_valuation=37, stale_ownership=1, player_unwilling=15, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | first_division -> second_division | 6 | 1 | 17967700 | 21945353.5 | 20520491 | fee_below_valuation=2, player_unwilling=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> first_division | 9 | 4 | 55730300 | 57680861 | 263021345.5 | stale_ownership=4, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> second_division | 76 | 4 | 166188900 | 260267963 | 259268084 | fee_below_valuation=56, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00020` | second_division -> third_division | 10 | 1 | 63037700 | 71617838 | 10633075 | fee_below_valuation=7, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00020` | third_division -> first_division | 3 | 2 | 231666000 | 275682540 | 212230256 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | third_division -> second_division | 4 | 1 | 53929900 | 72805365 | 58788715 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00020` | third_division -> third_division | 34 | 4 | 12164600 | 13685175 | 7445339.5 | fee_below_valuation=24, player_unwilling=3, unaffordable=2 |

## Year-10 Exceptional Stock Locations

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | FAIL | 19 | 11 | senior 1223..1277; youth 594..594; total 1817..1871 | 0 | 0 | 0 | structural 0; cash 755000000; wage 1.0000; free agents 0.0301; values 4241400..12298000000; renew/release/expiry 273/3/2 | 12 | avg 29.00; min 28; max 30; low season 2; champion pts 61..65; last pts 31..37; ability spread 6.57->5.50; draw rate avg/max 0.250/0.270 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.44; top assist Matteo Basiletti; top scorer Nico Sorrentino:13 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00010` | FAIL | 20 | 11 | senior 1230..1289; youth 594..594; total 1824..1883 | 0 | 0 | 0 | structural 0; cash 736673075; wage 0.9998; free agents 0.0324; values 4143000..13495000000; renew/release/expiry 281/0/0 | 12 | avg 27.00; min 24; max 30; low season 1; champion pts 59..60; last pts 29..36; ability spread 6.58->5.81; draw rate avg/max 0.260/0.270 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00019` | WARN | 19 | 11 | senior 1222..1287; youth 594..594; total 1816..1881 | 0 | 0 | 0 | structural 0; cash 764974526; wage 1.0000; free agents 0.0402; values 3989400..12760000000; renew/release/expiry 300/0/0 | 9 | avg 36.00; min 31; max 41; low season 2; champion pts 63..65; last pts 24..32; ability spread 6.29->5.56; draw rate avg/max 0.240/0.240 | season 2; Virtus Trieste; Matteo Bonacina; assists 9; team goals 49; top1 0.18; top3 0.41; top assist Giorgio Bonetti; top scorer Luca Cambi:18 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00006` | WARN | 19 | 11 | senior 1230..1302; youth 594..594; total 1824..1896 | 0 | 0 | 0 | structural 0; cash 808808150; wage 1.0000; free agents 0.0378; values 4066500..13684000000; renew/release/expiry 280/1/2 | 11 | avg 35.50; min 35; max 36; low season 1; champion pts 63..66; last pts 28..30; ability spread 6.42->5.55; draw rate avg/max 0.270/0.290 | season 2; A.S. Genoa; Luca Basile; assists 11; team goals 53; top1 0.21; top3 0.40; top assist Luca Basile; top scorer Marko Jovanovic:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00002` | WARN | 19 | 11 | senior 1227..1299; youth 594..594; total 1821..1893 | 0 | 0 | 0 | structural 0; cash 768869489; wage 1.0000; free agents 0.0366; values 4147500..12760000000; renew/release/expiry 275/1/1 | 11 | avg 42.00; min 38; max 46; low season 2; champion pts 70..73; last pts 27..32; ability spread 6.17->5.07; draw rate avg/max 0.250/0.260 | season 1; Virtus Parma; Sergio Molina; assists 10; team goals 50; top1 0.20; top3 0.42; top assist Logan Morgan; top scorer Enrico Bortolotti:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00013` | WARN | 18 | 11 | senior 1215..1293; youth 594..594; total 1809..1887 | 0 | 0 | 0 | structural 0; cash 812416780; wage 1.0000; free agents 0.0348; values 3542800..15000000000; renew/release/expiry 255/0/1 | 11 | avg 34.00; min 28; max 40; low season 2; champion pts 57..72; last pts 29..32; ability spread 5.91->4.83; draw rate avg/max 0.250/0.270 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Enrico Bruni; top scorer Dario Milosevic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00009` | WARN | 18 | 11 | senior 1218..1279; youth 594..594; total 1812..1873 | 0 | 0 | 0 | structural 0; cash 836342649; wage 1.0000; free agents 0.0330; values 3657600..14020000000; renew/release/expiry 260/0/3 | 10 | avg 30.50; min 24; max 37; low season 2; champion pts 60..63; last pts 26..36; ability spread 6.32->5.33; draw rate avg/max 0.230/0.250 | season 1; Parma Calcio; Oumar Traore; assists 8; team goals 46; top1 0.17; top3 0.43; top assist Diego Herrera; top scorer Giorgio Taddei:14 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00018` | WARN | 19 | 11 | senior 1219..1291; youth 594..594; total 1813..1885 | 0 | 0 | 0 | structural 0; cash 743778250; wage 1.0000; free agents 0.0329; values 3853900..12298000000; renew/release/expiry 271/2/1 | 10 | avg 31.50; min 28; max 35; low season 1; champion pts 60..64; last pts 29..32; ability spread 6.06->5.06; draw rate avg/max 0.250/0.260 | season 1; U.S. Trieste; Sekou Keita; assists 8; team goals 41; top1 0.20; top3 0.41; top assist Davide Spinelli; top scorer Davide Mazzi:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00007` | WARN | 19 | 11 | senior 1223..1288; youth 594..594; total 1817..1882 | 0 | 0 | 0 | structural 0; cash 753393606; wage 1.0000; free agents 0.0329; values 3920000..13495000000; renew/release/expiry 289/0/0 | 10 | avg 33.50; min 32; max 35; low season 1; champion pts 63..64; last pts 29..31; ability spread 5.78->5.17; draw rate avg/max 0.230/0.250 | season 1; U.S. Matera; Enrico Rossetti; assists 9; team goals 44; top1 0.20; top3 0.46; top assist Matteo Cantini; top scorer Nico Corsi:16 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00005` | WARN | 19 | 11 | senior 1225..1290; youth 594..594; total 1819..1884 | 0 | 0 | 0 | structural 0; cash 817765560; wage 1.0000; free agents 0.0329; values 3949400..12760000000; renew/release/expiry 250/0/1 | 10 | avg 31.00; min 28; max 34; low season 1; champion pts 64..65; last pts 31..36; ability spread 5.86->5.05; draw rate avg/max 0.210/0.220 | season 1; A.C. Catania; Davide Corsi; assists 10; team goals 51; top1 0.20; top3 0.39; top assist Davide Corsi; top scorer Giorgio Pagano:18 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase80a-prechange-baseline-world-00015` | 14 | season 2; A.C. Lecco; Enrico Capra; assists 14; team goals 69; top1 0.20; top3 0.38; top assist Enrico Capra; top scorer Luca Pagano:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 13 | season 1; A.S. Pescara; Luca Silvestri; assists 9; team goals 46; top1 0.20; top3 0.40; top assist Luca Silvestri; top scorer Enrico Cambi:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 12 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.44; top assist Matteo Basiletti; top scorer Nico Sorrentino:13 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00010` | 12 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 11 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Enrico Bruni; top scorer Dario Milosevic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 11 | season 2; Pro Matera; Matteo Fabiani; assists 9; team goals 43; top1 0.21; top3 0.40; top assist Luca Ricciardi; top scorer Luca Ricciardi:16 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 11 | season 2; A.S. Genoa; Luca Basile; assists 11; team goals 53; top1 0.21; top3 0.40; top assist Luca Basile; top scorer Marko Jovanovic:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00017` | 11 | season 2; F.C. Lecco; Matteo Orlando; assists 11; team goals 54; top1 0.20; top3 0.38; top assist Matteo Orlando; top scorer Nolan Rousseau:13 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 11 | season 1; Virtus Parma; Sergio Molina; assists 10; team goals 50; top1 0.20; top3 0.42; top assist Logan Morgan; top scorer Enrico Bortolotti:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 11 | season 2; S.S. Siena; Nico Vitali; assists 10; team goals 51; top1 0.20; top3 0.39; top assist Nico Vitali; top scorer Giorgio Pagano:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00017` | 2 | Pro Trento | 67..67 | 41.50 | 1 | transfer=64; squad=106 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 2 | A.S.D. Lecco | 63..66 | 35.50 | 1 | transfer=77; squad=117 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 2 | Pro Brescia | 62..68 | 34.50 | 1 | transfer=85; squad=124 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 1 | A.C. Terni | 73..73 | 46.00 | 2 | transfer=65; squad=110 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 1 | A.C. Taranto | 69..69 | 43.00 | 2 | transfer=95; squad=138 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 1 | U.S. Florence | 65..65 | 43.00 | 2 | transfer=60; squad=96 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00016` | 1 | A.S. Florence | 74..74 | 42.00 | 2 | transfer=86; squad=122 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 1 | S.S. Lecco | 69..69 | 42.00 | 2 | transfer=76; squad=113 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00019` | 1 | A.S. Pisa | 65..65 | 41.00 | 2 | transfer=60; squad=92 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 1 | A.C. Matera | 74..74 | 40.00 | 2 | transfer=87; squad=124 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00010` | 27.00 | 24..30 | 59..60 | 29..36 | avg 0.260 max 0.270 | 6.58->5.81 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 29.00 | 28..30 | 61..65 | 31..37 | avg 0.250 max 0.270 | 6.57->5.50 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00009` | 30.50 | 24..37 | 60..63 | 26..36 | avg 0.230 max 0.250 | 6.32->5.33 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00005` | 31.00 | 28..34 | 64..65 | 31..36 | avg 0.210 max 0.220 | 5.86->5.05 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00018` | 31.50 | 28..35 | 60..64 | 29..32 | avg 0.250 max 0.260 | 6.06->5.06 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 32.00 | 29..35 | 62..63 | 28..33 | avg 0.280 max 0.280 | 6.52->5.10 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00007` | 33.50 | 32..35 | 63..64 | 29..31 | avg 0.230 max 0.250 | 5.78->5.17 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00004` | 33.50 | 32..35 | 66..66 | 31..34 | avg 0.240 max 0.240 | 6.02->5.09 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 34.00 | 28..40 | 57..72 | 29..32 | avg 0.250 max 0.270 | 5.91->4.83 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 34.50 | 30..39 | 62..68 | 29..32 | avg 0.260 max 0.280 | 6.67->5.76 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

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
| `phase80a-prechange-baseline-world-00010` | 0 | 0.0324 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase80a-prechange-baseline-world-00012` | 0.3704 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00008` | 0.3426 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00007` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00011` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00013` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00019` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00003` | 0.3333 | 0.0000 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00009` | 0.3241 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00020` | 0.3241 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00001` | 0.3241 | 0.0093 | 0.0000 | 1.0000 |

## Reproduction

Run the same gate with:

```bash
nvm use 24
pnpm cli ten-season-report --seed-prefix=phase80a-prechange-baseline --worlds=20 --seasons=2 --checkpoint-dir=<checkpoint-directory> --shards=20 --workers=7 --report-output=artifacts/phase80a-step08-v5-p80-report.md
```
