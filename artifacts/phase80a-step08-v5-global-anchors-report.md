# Phase 80A Prospect And Player-Economy Bounded Gates Report

Date: 2026-08-01
Seed prefix: `phase80a-prechange-baseline`
Worlds: 20
Seasons per world: 2
Total seasons: 40
Execution: sharded; workers=7; shards=20; resumed=0; partition_hashes=1164e4bf2bf75c99,1843ac9b3a4291a6,3956622c942126e9,3626bb30efeeb215,517a59e18e7bf07f,30db95cdfd249d4f,6e2f054968892ed7,13bb2beb5243df56,dc5a5d15072d222a,80ba8978cb2a6ce3,13c1b801c1bdae8e,c75b4367a8251f84,3403b7f52a467b01,1161bb9fdb053cd0,04734bb549a8596b,c56a701f9051a0ae,c465a4e50d3bf478,bab017dd423847d4,ce82bed66d886f90,46c732449d98211b
Status: FAIL

## Aggregate Metrics

- Failed worlds: 2
- Warning worlds: 18
- Player-economy gate violations: 0
- Closing division-value fit: PASS
- Closing checkpoint season start year: 2028
- Closing division-value observations: 25775
- Closing division-value violations: 0
- Year-10 rating-stock observations: 0/20
- Year-10 current-six maximum observed: n/a
- Year-10 stored-ceiling-six maximum observed: n/a
- Year-10 lower-tier stored-ceiling-six maximum observed: n/a
- Goals per match average: 2.910
- Goals per match p95: 3.030
- Table spread average: 34.75
- Table spread minimum world average: 26.50
- Draw rate average: 0.240
- Draw rate maximum world average: 0.280
- Champion streak max observed: 2
- Top assist max p95: 14
- Production warning max: assists=15 top1=0.24 top3=0.48
- Age 30+ share p95: 0.16
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 1787
- Role coverage warnings p95: 93
- Youth roster max observed: 11
- Active player count min/max: senior=1216..1299 youth=594..594 total=1810..1893
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 702720506
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.8700; p90=0.9800; p95=1.0000; p99=1.0000; pressure share=0.3000; exact ceiling share=0.0200; above budget share=0.0000; reallocation exact ceiling count=1
- Annual wage headroom (minor): p10=7020000; p50=228040000
- Maximum free-agent share: 0.0402
- Maximum useful free-agent stock: 0
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=1617/0/2/0; ability <8/8-9/10-11/12+=920/699/0/0; unattached <1/1-2/3+ seasons=1273/346/0
- Permanent-transfer funnel: needs=408960; recruitable=316683; targets=10227; unavailable=398733; offers=10227; seller rejected/countered/accepted/expired/withdrawn=6923/2704/2881/385/43; player started/countered/rejected/counter-accepted=2876/0/1118/0; unaffordable=43; completed=1461; lost reasons=active_talk_limit_reached=805, club_already_handled=10741, club_cannot_recruit=80731, counter_exceeds_capacity=43, implausible_downward_move=389, permanent_start_limit_reached=92586, seller_department_floor=18746, transfer_terms_unaffordable=5797, transfer_window_closed=188938
- Preliminary-agreement funnel: candidates=1786; unavailable=221186; offers=1786; rejected/countered/counter-accepted/counter-rejected=454/0/0/0; agreements=472; expired=807; activations=20; activation failures=6; lost reasons=active_talk_limit_reached=13498, club_terms_unaffordable=44, contract_overlap=6, current_contract_expired=4, negotiation_deadline=803, player_unwilling=410, preliminary_start_limit_reached=461, preliminary_target_unavailable=207227
- Permanent-transfer public values: count=1461; p50=103851500; p90=1532194400; p99=3082350900; max=3625493300
- Permanent-transfer asking prices: count=1461; p50=113038000; p90=1804043070; p99=4179660520; max=4729541600
- Permanent-transfer completed fees: count=1461; p50=105252435; p90=1640908323; p99=3795712930; max=4284604355
- Free-agent public values: count=706; p50=10869400; p90=15225300; p99=32526400; max=58633300
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 3241400..15000000000
- Contract lifecycle: renewals=5482; releases=16; expiries=23; selected expiry decisions=3
- Warning check counts: role_coverage_warning_count=20, senior_active_player_population=20, total_active_player_population=20, youth_active_player_population=20, wage_budget_pressure_prevalence=19, table_points_spread_avg=11, goals_per_match_avg=4
- Signal check counts: monitor=103, story=11
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
| `free_agent_zero_fee_and_value` | 706 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent |
| `hard_cap_eligibility_and_display` | 8 | 0 | 0 | 12 | matching=3 share_bps=3750 cohort_evidence=n/a cohort_minimum=n/a | positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points |
| `initial_established_current_six_stock` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs |
| `initial_exceptional_allocation` | 35640 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | established current-six 2..3; young stored-ceiling-six 4..5; lower-tier young stored-ceiling-six <=1; allocated/effective identity |
| `initial_young_stored_ceiling_six_stock` | 88 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail |
| `intrinsic_public_value_invariance_contract_expiry` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_free_agent` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_owner_category` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_promotion_relegation` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_transfer` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `negotiation_counter_path` | 2704 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required counter observations and at least one completed-after-counter path |
| `negotiation_offer_spread` | 10227 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required offers; not structural 100% asking/offer equality |
| `negotiation_seller_outcomes` | 10227 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required accepted, rejected, and countered observations |
| `public_potential_range_ordering` | 75210 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | current <= P50 <= public upper <= stored ceiling |
| `stored_ceiling_six_joint_profile` | 288 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every stored-ceiling-six observation has positive public value; asking is measured separately |
| `stored_ceiling_six_prospect_value_observations` | 188 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required positive-valued stored-ceiling-six prospect population |
| `young_stored_ceiling_prospect_share_first_division` | 4127 | 0 | 0 | 0 | matching=861 share_bps=2086 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points |
| `young_stored_ceiling_prospect_share_second_division` | 3647 | 0 | 0 | 0 | matching=486 share_bps=1333 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 800..1500 basis points |
| `young_stored_ceiling_prospect_share_third_division` | 3258 | 0 | 0 | 0 | matching=217 share_bps=666 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 400..800 basis points |
| `young_stored_ceiling_six_active_stock` | 60 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (4 or 5) |
| `young_stored_ceiling_six_no_inflation` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target |
| `young_stored_ceiling_six_stock_arrival_category_placement` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals; outside First Division <=1; every introduced First Division placement is title_contender or playoff_contender |
| `young_stored_ceiling_six_stock_arrival_club_uniqueness` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals introduce <=1 associated player per club; later market concentration remains descriptive |
| `young_stored_ceiling_six_vacancy_replacement` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=12 cohort_minimum=1 | adjacent-season vacancies are replenished to the closing snapshot's deterministic target |

## Closing Checkpoint Division Public Values

This cohort is the active senior stock at the explicitly named closing season checkpoint; it is not a year-ten proxy.

| Division | Observations | Median | P90 | P99 | Maximum | Fit |
|---|---:|---:|---:|---:|---:|---|
| first_division | 9324 | 302235350 | 2551270890 | 4806335015 | 13684000000 | pass |
| second_division | 8362 | 50355900 | 239383210 | 554359277 | 1680041600 | pass |
| third_division | 8089 | 11756800 | 46853480 | 101460016 | 464868200 | pass |

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
| `phase80a-prechange-baseline-world-00001` | first_division | 18 | 462 | 166570000/824585000/1786206800 | 7433670000/13161291000/13977011000 | 0.8673/0.9874/0.9995 | 81173000/1190140000 |
| `phase80a-prechange-baseline-world-00001` | second_division | 18 | 415 | 51570000/143074000/226628400 | 1340290000/2293270000/2474800800 | 0.8531/0.9799/0.9899 | 46393000/273555000 |
| `phase80a-prechange-baseline-world-00001` | third_division | 18 | 401 | 12260000/27640000/39130000 | 269590000/417709000/448783000 | 0.9639/0.9925/0.9995 | 3390000/9885000 |
| `phase80a-prechange-baseline-world-00002` | first_division | 18 | 470 | 162170000/803181000/1652898900 | 8100790000/13262629000/13809714600 | 0.8755/0.9509/0.9864 | 610706000/1234760000 |
| `phase80a-prechange-baseline-world-00002` | second_division | 18 | 417 | 52440000/133332000/251155600 | 1264725000/2273476000/2472678500 | 0.8333/0.9830/0.9946 | 37314000/258350000 |
| `phase80a-prechange-baseline-world-00002` | third_division | 18 | 408 | 11185000/27755000/38309500 | 279835000/434811000/448078500 | 0.9775/0.9898/0.9960 | 3655000/6795000 |
| `phase80a-prechange-baseline-world-00003` | first_division | 18 | 469 | 157090000/804718000/2232216000 | 7559430000/13324275000/13987289800 | 0.8934/0.9841/0.9983 | 159034000/1001910000 |
| `phase80a-prechange-baseline-world-00003` | second_division | 18 | 424 | 52170000/138966000/245045200 | 1401475000/2364380000/2487421000 | 0.8639/0.9638/0.9950 | 79627000/225825000 |
| `phase80a-prechange-baseline-world-00003` | third_division | 18 | 402 | 12250000/28304000/38207000 | 292015000/445000000/450939300 | 0.9794/0.9976/0.9982 | 887000/6710000 |
| `phase80a-prechange-baseline-world-00004` | first_division | 18 | 466 | 157385000/882655000/2096476500 | 6879680000/13764784000/14012789900 | 0.8581/0.9853/0.9980 | 183871000/1190365000 |
| `phase80a-prechange-baseline-world-00004` | second_division | 18 | 418 | 48770000/146000000/229867400 | 1359520000/2307840000/2475581100 | 0.8153/0.9862/0.9917 | 34579000/267845000 |
| `phase80a-prechange-baseline-world-00004` | third_division | 18 | 400 | 11300000/29279000/39880900 | 291400000/445622000/450869500 | 0.9772/1.0000/1.0000 | 0/6025000 |
| `phase80a-prechange-baseline-world-00005` | first_division | 18 | 463 | 192600000/879390000/1837410200 | 7969680000/13320243000/13724823300 | 0.8884/0.9655/0.9812 | 464957000/1024215000 |
| `phase80a-prechange-baseline-world-00005` | second_division | 18 | 416 | 53005000/145170000/229058000 | 1295855000/2458595000/2504342600 | 0.8677/0.9859/0.9981 | 26551000/215910000 |
| `phase80a-prechange-baseline-world-00005` | third_division | 18 | 406 | 11475000/29250000/40413000 | 285450000/443092000/446834600 | 0.9792/0.9961/0.9999 | 961000/5610000 |
| `phase80a-prechange-baseline-world-00006` | first_division | 18 | 470 | 158965000/844180000/2135502600 | 8119545000/13479362000/13955129800 | 0.8767/0.9628/0.9968 | 520638000/1139270000 |
| `phase80a-prechange-baseline-world-00006` | second_division | 18 | 422 | 52940000/129641000/231700000 | 1352605000/2430944000/2491093100 | 0.8177/0.9913/0.9964 | 16878000/251080000 |
| `phase80a-prechange-baseline-world-00006` | third_division | 18 | 407 | 10980000/29050000/41368600 | 280785000/447639000/449760500 | 0.9851/1.0000/1.0000 | 7000/4260000 |
| `phase80a-prechange-baseline-world-00007` | first_division | 18 | 464 | 151325000/802408000/2281038300 | 7669200000/13150130000/13793577700 | 0.8586/0.9807/0.9947 | 182801000/1138335000 |
| `phase80a-prechange-baseline-world-00007` | second_division | 18 | 418 | 52910000/138501000/232485500 | 1388420000/2449775000/2461757300 | 0.8310/0.9799/0.9847 | 50225000/238135000 |
| `phase80a-prechange-baseline-world-00007` | third_division | 18 | 405 | 11140000/28360000/48019600 | 287350000/442995000/449137400 | 0.9787/0.9998/1.0000 | 47000/5755000 |
| `phase80a-prechange-baseline-world-00008` | first_division | 18 | 469 | 179300000/826444000/1872242800 | 7909010000/14001753000/14039615400 | 0.8579/0.9998/0.9999 | 2372000/1290990000 |
| `phase80a-prechange-baseline-world-00008` | second_division | 18 | 420 | 53775000/145914000/221258600 | 1378850000/2459446000/2496508700 | 0.8651/0.9838/0.9979 | 40554000/217990000 |
| `phase80a-prechange-baseline-world-00008` | third_division | 18 | 407 | 10430000/28614000/44618000 | 300420000/438812000/445853600 | 0.9744/0.9988/1.0000 | 462000/8720000 |
| `phase80a-prechange-baseline-world-00009` | first_division | 18 | 459 | 155340000/879762000/1967593400 | 8242880000/13030127000/13882180200 | 0.9002/0.9691/0.9916 | 292819000/1112705000 |
| `phase80a-prechange-baseline-world-00009` | second_division | 18 | 421 | 56790000/132990000/214758000 | 1383830000/2414909000/2507710100 | 0.8490/0.9848/0.9997 | 27425000/214685000 |
| `phase80a-prechange-baseline-world-00009` | third_division | 18 | 400 | 11375000/28564000/41101400 | 274420000/444035000/449157300 | 0.9784/0.9988/1.0000 | 553000/7055000 |
| `phase80a-prechange-baseline-world-00010` | first_division | 18 | 462 | 161160000/828012000/1920152300 | 8085290000/12575165000/13818492700 | 0.8694/0.9852/0.9979 | 207313000/1195090000 |
| `phase80a-prechange-baseline-world-00010` | second_division | 18 | 421 | 52600000/135710000/217554000 | 1476270000/2458471000/2493236200 | 0.8752/0.9930/0.9973 | 14920000/217010000 |
| `phase80a-prechange-baseline-world-00010` | third_division | 18 | 406 | 11225000/28845000/41209000 | 298350000/440924000/448400200 | 0.9783/0.9952/0.9993 | 1731000/6755000 |
| `phase80a-prechange-baseline-world-00011` | first_division | 18 | 463 | 162140000/732526000/2082510000 | 7296165000/13351899000/13715031300 | 0.8802/0.9786/0.9800 | 277442000/1099820000 |
| `phase80a-prechange-baseline-world-00011` | second_division | 18 | 411 | 56610000/134360000/205102000 | 1364965000/2179541000/2492055700 | 0.8436/0.9684/0.9968 | 68459000/232870000 |
| `phase80a-prechange-baseline-world-00011` | third_division | 18 | 410 | 10955000/28073000/40674600 | 281500000/412090000/448296700 | 0.9601/0.9998/1.0000 | 91000/12175000 |
| `phase80a-prechange-baseline-world-00012` | first_division | 18 | 463 | 167450000/846724000/1972728000 | 7603915000/13744974000/13922710600 | 0.8582/0.9842/0.9945 | 163760000/1226335000 |
| `phase80a-prechange-baseline-world-00012` | second_division | 18 | 409 | 56670000/141998000/224264000 | 1343105000/2344920000/2449879300 | 0.8515/0.9798/0.9800 | 48125000/260295000 |
| `phase80a-prechange-baseline-world-00012` | third_division | 18 | 406 | 11560000/29595000/40515000 | 323525000/438212000/447190700 | 0.9795/1.0000/1.0000 | 0/5635000 |
| `phase80a-prechange-baseline-world-00013` | first_division | 18 | 467 | 160650000/771886000/1949472400 | 7565825000/13582470000/13958019300 | 0.8306/0.9808/0.9968 | 258033000/1383075000 |
| `phase80a-prechange-baseline-world-00013` | second_division | 18 | 423 | 53580000/135374000/233329600 | 1421405000/2387032000/2489372700 | 0.9072/0.9869/0.9957 | 30873000/154875000 |
| `phase80a-prechange-baseline-world-00013` | third_division | 18 | 405 | 11480000/28434000/40591200 | 296240000/447283000/449412900 | 0.9761/0.9994/0.9999 | 247000/7655000 |
| `phase80a-prechange-baseline-world-00014` | first_division | 18 | 470 | 156665000/864067000/2044926900 | 8076455000/13682813000/14012542300 | 0.8800/0.9817/0.9998 | 154395000/1093525000 |
| `phase80a-prechange-baseline-world-00014` | second_division | 18 | 418 | 52050000/138413000/217975200 | 1331570000/2474468000/2492389200 | 0.8167/0.9847/0.9970 | 38622000/256215000 |
| `phase80a-prechange-baseline-world-00014` | third_division | 18 | 403 | 10880000/28624000/41708800 | 272790000/442818000/449959000 | 0.9775/0.9981/0.9999 | 856000/7060000 |
| `phase80a-prechange-baseline-world-00015` | first_division | 18 | 468 | 163065000/813674000/2090262100 | 7825155000/13776202000/14056488000 | 0.8456/0.9840/0.9982 | 223798000/1513575000 |
| `phase80a-prechange-baseline-world-00015` | second_division | 18 | 420 | 54220000/143950000/224929800 | 1279820000/2394074000/2495828900 | 0.8914/0.9899/0.9983 | 21786000/198875000 |
| `phase80a-prechange-baseline-world-00015` | third_division | 18 | 396 | 11135000/29295000/41010000 | 301580000/441074000/447396300 | 0.9705/0.9953/0.9994 | 1902000/10735000 |
| `phase80a-prechange-baseline-world-00016` | first_division | 18 | 474 | 169230000/804461000/2060584700 | 8462635000/13722706000/13844149300 | 0.8692/0.9804/0.9889 | 229722000/1307630000 |
| `phase80a-prechange-baseline-world-00016` | second_division | 18 | 419 | 53520000/139144000/250765200 | 1350285000/2449158000/2466884000 | 0.8582/0.9797/0.9868 | 48394000/229885000 |
| `phase80a-prechange-baseline-world-00016` | third_division | 18 | 401 | 11430000/28120000/39830000 | 283785000/440894000/447407400 | 0.9441/0.9798/0.9942 | 6615000/15625000 |
| `phase80a-prechange-baseline-world-00017` | first_division | 18 | 472 | 138105000/821006000/2074591700 | 8046220000/13655945000/13948552500 | 0.8643/0.9803/0.9965 | 264939000/1357135000 |
| `phase80a-prechange-baseline-world-00017` | second_division | 18 | 420 | 56680000/137991000/205228100 | 1410285000/2378688000/2498974600 | 0.8793/0.9604/0.9965 | 86935000/203720000 |
| `phase80a-prechange-baseline-world-00017` | third_division | 18 | 405 | 12000000/27726000/40157600 | 301645000/403034000/449395100 | 0.9796/0.9969/0.9987 | 1194000/6285000 |
| `phase80a-prechange-baseline-world-00018` | first_division | 18 | 472 | 162210000/810832000/2037869300 | 8224180000/13796281000/13964310300 | 0.8632/0.9835/0.9975 | 178351000/1215240000 |
| `phase80a-prechange-baseline-world-00018` | second_division | 18 | 417 | 51350000/146264000/222778400 | 1362815000/2453313000/2488734200 | 0.8308/0.9817/0.9955 | 40618000/304145000 |
| `phase80a-prechange-baseline-world-00018` | third_division | 18 | 402 | 10975000/28432000/42055000 | 317280000/420987000/438817600 | 0.9793/1.0000/1.0000 | 0/7945000 |
| `phase80a-prechange-baseline-world-00019` | first_division | 18 | 460 | 141555000/833300000/2639953300 | 7916790000/14006736000/14156662700 | 0.8773/0.9990/0.9999 | 14351000/1137840000 |
| `phase80a-prechange-baseline-world-00019` | second_division | 18 | 414 | 53210000/143515000/224754800 | 1349860000/2455779000/2495348400 | 0.8751/0.9849/0.9981 | 29101000/191280000 |
| `phase80a-prechange-baseline-world-00019` | third_division | 18 | 410 | 10985000/28955000/38975900 | 280700000/431180000/451456000 | 0.9784/0.9995/1.0000 | 203000/4815000 |
| `phase80a-prechange-baseline-world-00020` | first_division | 18 | 461 | 165930000/798580000/2310876000 | 8251220000/13673543000/13921736900 | 0.8387/0.9917/0.9944 | 90419000/1361550000 |
| `phase80a-prechange-baseline-world-00020` | second_division | 18 | 419 | 52280000/136314000/216539000 | 1334280000/2426587000/2494986600 | 0.8349/0.9715/0.9980 | 61709000/225755000 |
| `phase80a-prechange-baseline-world-00020` | third_division | 18 | 409 | 11040000/29718000/41027600 | 279515000/446983000/449527600 | 0.9877/1.0000/1.0000 | 0/3795000 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 31097580504.5/33263821372/34512409169.73 | 6800000000/11970313000/13433219475.99 | 0/60182400/110876260 | 0/522756000/1076266300 | 65/16/17 |
| `phase80a-prechange-baseline-world-00001` | second_division | 6110868107.5/7658417928.8/8045371071.18 | 1180000000/2157223969.4/2398075590.44 | 0/2813500/6782420 | 0/46893000/76699600 | 89/6/0 |
| `phase80a-prechange-baseline-world-00001` | third_division | 1307521635/1439548879.6/1584254258.92 | 133115405.5/300000000/330999982.91 | 0/0/3721720 | 0/0/26584900 | 82/16/0 |
| `phase80a-prechange-baseline-world-00002` | first_division | 31175264530/35858996054/40401738779.89 | 6800000000/12203588250/13288527569.63 | 7011500/52012800/154772910 | 116855000/541992000/1697102000 | 78/6/27 |
| `phase80a-prechange-baseline-world-00002` | second_division | 6089466664/7244075682.6/7362129890.81 | 1020000000/1633269554.8/1769112799.25 | 0/2573100/8017850 | 0/42884000/86483500 | 88/6/2 |
| `phase80a-prechange-baseline-world-00002` | third_division | 1315968241.5/1470519567.3/1576075376.18 | 118837805/300000000/313268504.5 | 0/0/3566510 | 0/0/28369400 | 52/8/0 |
| `phase80a-prechange-baseline-world-00003` | first_division | 31200560034/33838162011.6/37328503433.35 | 6800000000/11990305000/13122499136.34 | 0/192441700/314063540 | 0/1431232000/2363105400 | 64/12/27 |
| `phase80a-prechange-baseline-world-00003` | second_division | 6232739058.5/6615141039.6/6711923746.3 | 860000000/1500000000/1531532374.79 | 0/3230200/8647160 | 0/52165000/96793100 | 99/7/0 |
| `phase80a-prechange-baseline-world-00003` | third_division | 1329336256/1623793125.1/3217142980.71 | 134745035/419199148.5/2209605880.71 | 0/0/0 | 0/0/0 | 47/9/0 |
| `phase80a-prechange-baseline-world-00004` | first_division | 30763031279/35325959743.4/39408238841.18 | 6987024302.5/12000000000/12763744628.33 | 2383500/85464200/313718060 | 39725000/930690000/2240845900 | 68/8/29 |
| `phase80a-prechange-baseline-world-00004` | second_division | 6033285326/7145858337.3/7402950042.51 | 1180000000/1500000000/1558331491.98 | 0/9325700/27668590 | 0/88776000/286253300 | 89/9/4 |
| `phase80a-prechange-baseline-world-00004` | third_division | 1319141300.5/1399717181.2/1563742879.96 | 136062887/299195000/300000000 | 0/0/0 | 0/0/0 | 37/7/0 |
| `phase80a-prechange-baseline-world-00005` | first_division | 30487543063.5/34691794603.9/38843483454.04 | 6827834359.5/12000000000/12500337371.3 | 1892500/31991400/97349050 | 31545000/389844000/762164200 | 88/8/22 |
| `phase80a-prechange-baseline-world-00005` | second_division | 6112871526/7093474065.6/7660881241.17 | 1020000000/1500000000/1924027383.78 | 0/1451900/5673510 | 0/24199000/58654400 | 76/12/0 |
| `phase80a-prechange-baseline-world-00005` | third_division | 1316669699.5/1446349415.7/1524612012.73 | 130158425/300000000/300000000 | 0/0/0 | 0/0/0 | 33/6/0 |
| `phase80a-prechange-baseline-world-00006` | first_division | 30696796687/33497095368/38625385015.16 | 6800000000/12000000000/12264121553.37 | 3621500/29229800/203246220 | 60360000/268402000/1677274600 | 94/10/27 |
| `phase80a-prechange-baseline-world-00006` | second_division | 6145420594.5/7071252422/7447028127.46 | 1124681891/1500000000/1988486815.56 | 0/10304500/21893450 | 0/143754000/163993600 | 90/6/0 |
| `phase80a-prechange-baseline-world-00006` | third_division | 1325843337/1403352333.2/1412385288.48 | 116454825/300000000/300000000 | 0/0/0 | 0/0/0 | 24/3/0 |
| `phase80a-prechange-baseline-world-00007` | first_division | 30705621106/34606715798.6/36003021650.39 | 6982540941.5/12000000000/13627030219.59 | 2015000/35755000/115363770 | 33585000/457727000/906198900 | 72/9/27 |
| `phase80a-prechange-baseline-world-00007` | second_division | 6227115257.5/7137178510.6/7626197067.22 | 1020000000/1531230669.6/2083374057.22 | 0/8864100/11906760 | 0/115076000/132186700 | 98/8/0 |
| `phase80a-prechange-baseline-world-00007` | third_division | 1294897710.5/1458664424.6/1518080603.67 | 131313873/300000000/300000000 | 0/0/0 | 0/0/0 | 34/6/0 |
| `phase80a-prechange-baseline-world-00008` | first_division | 31056100828.5/35349030637.3/41384939400.08 | 7517751199.5/11991334000/13136242677.23 | 2988500/67638100/161500180 | 49810000/797232000/1233322500 | 68/12/21 |
| `phase80a-prechange-baseline-world-00008` | second_division | 6204624590/6783220963.4/8504169004.86 | 937202004/1500000000/3139465515.31 | 0/2185000/6212810 | 0/36409000/103547900 | 88/6/2 |
| `phase80a-prechange-baseline-world-00008` | third_division | 1308263447/1459884317.5/1501261472.86 | 137016000/300000000/300000000 | 0/0/0 | 0/0/0 | 26/2/0 |
| `phase80a-prechange-baseline-world-00009` | first_division | 30457619714.5/34996725561.7/37812836088.71 | 6800000000/12703789586.6/13515745116.39 | 0/23818700/35861340 | 0/396968000/597682900 | 92/18/20 |
| `phase80a-prechange-baseline-world-00009` | second_division | 6118862219/6548986995.1/6821880901.95 | 860000000/1492762000/1500000000 | 0/381900/2774470 | 0/6363000/46234500 | 90/10/0 |
| `phase80a-prechange-baseline-world-00009` | third_division | 1317375859.5/1564660873.4/1910489434.9 | 132955000/367951824.9/562208591.1 | 0/0/0 | 0/0/0 | 33/4/0 |
| `phase80a-prechange-baseline-world-00010` | first_division | 31426890396.5/33975888444.1/35797670084.2 | 6797565000/12094728630/13747972149.08 | 2615000/42746900/66482840 | 43580000/427529000/660947300 | 70/13/23 |
| `phase80a-prechange-baseline-world-00010` | second_division | 6075786631.5/6759082100.5/7291525321.64 | 1014588959.5/1500000000/1574414658.45 | 0/739500/2499860 | 0/12327000/41671000 | 83/9/0 |
| `phase80a-prechange-baseline-world-00010` | third_division | 1298783617.5/1435652965.7/1580792590.42 | 133639420.5/300000000/300000000 | 0/0/0 | 0/0/0 | 59/10/0 |
| `phase80a-prechange-baseline-world-00011` | first_division | 30579675341/34580797486.6/38783622957.6 | 6926303940/12195126480/13091609391.48 | 0/12826300/228300680 | 0/173945000/1653651900 | 92/18/23 |
| `phase80a-prechange-baseline-world-00011` | second_division | 6201860717.5/6772046650.9/7339546008.43 | 936812801.5/1500000000/2068318529.6 | 0/3105100/9543270 | 0/41043000/102234400 | 96/7/0 |
| `phase80a-prechange-baseline-world-00011` | third_division | 1288022406/1520882493.2/1577674762.85 | 133708166.5/346500324.2/415031458.23 | 0/0/0 | 0/0/0 | 53/4/0 |
| `phase80a-prechange-baseline-world-00012` | first_division | 30770307372/37690832685/39519141775.64 | 8320342155/12000000000/13405628415.13 | 491000/43737000/236619790 | 8185000/489999000/1792298200 | 79/7/22 |
| `phase80a-prechange-baseline-world-00012` | second_division | 6155661490/6668530641.1/6934659054.78 | 876355599/1500000000/1553481610.25 | 0/356700/3047370 | 0/5943000/50793900 | 91/10/0 |
| `phase80a-prechange-baseline-world-00012` | third_division | 1262839487/1465640766.4/1498385343.16 | 119569557/300000000/304600013.55 | 0/0/0 | 0/0/0 | 39/8/0 |
| `phase80a-prechange-baseline-world-00013` | first_division | 31171506750/34424771940.8/35957460595.4 | 6800000000/11996458000/12000000000 | 2029000/27548600/47189350 | 33810000/390949000/495991600 | 86/4/26 |
| `phase80a-prechange-baseline-world-00013` | second_division | 6141542366.5/6773975164.9/7198222349.34 | 1054336961.5/1500000000/1561320532.8 | 0/3021500/4674950 | 0/47141000/65512700 | 90/11/0 |
| `phase80a-prechange-baseline-world-00013` | third_division | 1326875648/1498452378.7/2842024547.18 | 138845000/300000000/1527039459.85 | 0/0/4073640 | 0/0/29099800 | 41/12/0 |
| `phase80a-prechange-baseline-world-00014` | first_division | 30939139946/34619513125.3/36624247064.33 | 6800000000/11987533000/12000000000 | 3379500/51326200/89641590 | 56320000/855440000/973091400 | 77/9/27 |
| `phase80a-prechange-baseline-world-00014` | second_division | 6142825846.5/6633074922.1/8098019176.59 | 881291793.5/1500000000/2412775914.11 | 0/478800/2215180 | 0/7980000/36916900 | 90/9/0 |
| `phase80a-prechange-baseline-world-00014` | third_division | 1320496387/1545287140.2/3311563653.56 | 180148690/301533216.6/2117836264.74 | 0/0/0 | 0/0/0 | 44/7/0 |
| `phase80a-prechange-baseline-world-00015` | first_division | 31161374168.5/34409526735.6/36029380965.72 | 6800000000/11930875000/12000000000 | 850500/36265000/124689040 | 14175000/367489000/921034900 | 72/6/25 |
| `phase80a-prechange-baseline-world-00015` | second_division | 6135430639.5/6947634544.4/7226317625.14 | 1015975486.5/1507975040.7/1559835544.86 | 0/1632500/5036770 | 0/27204000/83947800 | 85/13/0 |
| `phase80a-prechange-baseline-world-00015` | third_division | 1323745359/1531611279.9/3299872249.04 | 140000000/300000000/2168583663.77 | 0/0/0 | 0/0/0 | 48/5/0 |
| `phase80a-prechange-baseline-world-00016` | first_division | 31072956934/32591963039.7/37755067838.57 | 6800000000/12000000000/12000000000 | 0/40448800/72178860 | 0/557680000/805269400 | 70/18/26 |
| `phase80a-prechange-baseline-world-00016` | second_division | 6098267002/6774395139.5/7162230494.73 | 860341203/1500000000/1527097259 | 0/6186700/36376020 | 0/84829000/310948700 | 94/12/1 |
| `phase80a-prechange-baseline-world-00016` | third_division | 1336497097/1599155211.4/3235626021.43 | 190023414/336555127.2/2179690914.47 | 0/0/0 | 0/0/0 | 71/12/1 |
| `phase80a-prechange-baseline-world-00017` | first_division | 31158598761/35037213024.8/38885490823.04 | 6800000000/12000000000/12025800120.89 | 5093500/159715300/424207220 | 84890000/1239244000/3079664100 | 78/10/30 |
| `phase80a-prechange-baseline-world-00017` | second_division | 6199274494/6632511277.5/6709409436.4 | 866527262.5/1493504000/1500000000 | 0/2399600/16493320 | 0/39993000/126759700 | 91/9/1 |
| `phase80a-prechange-baseline-world-00017` | third_division | 1326951515/1462474753.6/1559909405.26 | 140000000/300000000/300000000 | 0/0/0 | 0/0/0 | 52/12/0 |
| `phase80a-prechange-baseline-world-00018` | first_division | 30755568482.5/35305192355.9/38715363443.88 | 6886558534/12000000000/13457418002.32 | 1729000/98301100/187219850 | 28810000/736748000/1342112700 | 81/13/27 |
| `phase80a-prechange-baseline-world-00018` | second_division | 6218008753.5/6857847042.3/7089570991.69 | 988395475/1500000000/2145873975.28 | 0/3561400/22726730 | 0/59353000/234840800 | 94/12/0 |
| `phase80a-prechange-baseline-world-00018` | third_division | 1345749250/1516505395.5/1586612995.15 | 133065872.5/304103626.8/409543095.32 | 0/1248600/6555540 | 0/12550000/47468800 | 58/10/0 |
| `phase80a-prechange-baseline-world-00019` | first_division | 30919157989/34031111517.1/41676595901.87 | 6800000000/11950797000/13475699976.57 | 903000/71114700/402294510 | 15050000/652983000/2880742400 | 66/1/25 |
| `phase80a-prechange-baseline-world-00019` | second_division | 6135014982/7253240236.4/7804720181.74 | 1020000000/1547520910.8/2794840511.74 | 0/6537100/30275550 | 0/75604000/221671200 | 81/3/0 |
| `phase80a-prechange-baseline-world-00019` | third_division | 1298583662/1457517431.6/1490471891.72 | 140000000/298362000/300000000 | 0/0/0 | 0/0/0 | 38/5/0 |
| `phase80a-prechange-baseline-world-00020` | first_division | 30976612456.5/33417083655.9/35697750660.96 | 6077341750/12000000000/13147257741.69 | 5792500/103535100/230505980 | 85760000/835203000/1682793600 | 74/11/24 |
| `phase80a-prechange-baseline-world-00020` | second_division | 6261424651/7134233867.5/7383344316.86 | 1232841091.5/1661264973.5/1869499347.45 | 505500/9726300/18024650 | 8425000/105161000/184392800 | 95/10/1 |
| `phase80a-prechange-baseline-world-00020` | third_division | 1315882378/1436116704.6/1462329607.09 | 121990000/300000000/340485428.75 | 0/0/3570660 | 0/0/27937800 | 33/2/0 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00001` | first_division -> first_division | 59 | 13 | 783540200 | 1013744311 | 893235820 | fee_below_valuation=27, player_unwilling=16, stale_ownership=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00001` | first_division -> second_division | 3 | 0 | 16085600 | 16648596 | 0 | fee_below_valuation=2, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> first_division | 5 | 2 | 73150800 | 94642505 | 173739239.5 | stale_ownership=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00001` | second_division -> second_division | 85 | 6 | 173168000 | 232509150 | 264914984 | player_unwilling=17, fee_below_valuation=59, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> third_division | 16 | 0 | 30462900 | 34270763 | 0 | player_unwilling=6, fee_below_valuation=10 |
| `phase80a-prechange-baseline-world-00001` | third_division -> first_division | 1 | 1 | 8140000 | 9157500 | 8699600 | none |
| `phase80a-prechange-baseline-world-00001` | third_division -> second_division | 1 | 0 | 10754700 | 14841486 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00001` | third_division -> third_division | 66 | 16 | 13387800 | 16960644 | 9120580 | fee_below_valuation=31, player_unwilling=15, unaffordable=1 |
| `phase80a-prechange-baseline-world-00002` | first_division -> first_division | 78 | 6 | 1415167550 | 1592063494 | 227978175 | fee_below_valuation=62, player_unwilling=7 |
| `phase80a-prechange-baseline-world-00002` | first_division -> second_division | 1 | 0 | 19557600 | 17601840 | 0 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00002` | second_division -> second_division | 84 | 5 | 138155700 | 186510195 | 178549069 | fee_below_valuation=57, player_unwilling=18, unaffordable=1 |
| `phase80a-prechange-baseline-world-00002` | second_division -> third_division | 12 | 0 | 27123600 | 30514050.5 | 0 | fee_below_valuation=10, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00002` | third_division -> second_division | 3 | 1 | 17816300 | 24052005 | 22849403 | unaffordable=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00002` | third_division -> third_division | 40 | 8 | 13285600 | 14946300 | 8293874 | fee_below_valuation=24, player_unwilling=3, unaffordable=2 |
| `phase80a-prechange-baseline-world-00003` | first_division -> first_division | 52 | 8 | 726944100 | 750710813 | 433559922.5 | fee_below_valuation=32, player_unwilling=4, stale_ownership=5, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00003` | first_division -> second_division | 4 | 1 | 11712150 | 14762493 | 17294574 | fee_below_valuation=2, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00003` | second_division -> first_division | 11 | 3 | 129255100 | 162704363 | 205175688 | stale_ownership=3, fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00003` | second_division -> second_division | 93 | 4 | 161020300 | 187469663 | 104150734.5 | fee_below_valuation=70, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00003` | second_division -> third_division | 9 | 1 | 14728200 | 14139072 | 47651000 | fee_below_valuation=5, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00003` | third_division -> first_division | 1 | 1 | 176196500 | 243151170 | 224914785 | none |
| `phase80a-prechange-baseline-world-00003` | third_division -> second_division | 2 | 2 | 178908100 | 213138894 | 191110222 | none |
| `phase80a-prechange-baseline-world-00003` | third_division -> third_division | 38 | 8 | 12383800 | 14332388 | 9282610 | fee_below_valuation=22, player_unwilling=5 |
| `phase80a-prechange-baseline-world-00004` | first_division -> first_division | 66 | 7 | 731293800 | 987246630 | 128410770 | stale_ownership=6, fee_below_valuation=39, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00004` | first_division -> second_division | 5 | 2 | 17501100 | 18113639 | 496971935 | stale_ownership=2, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00004` | second_division -> first_division | 2 | 1 | 18423700 | 25424706 | 27395070 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | second_division -> second_division | 81 | 5 | 163002300 | 209825100 | 174208694 | fee_below_valuation=58, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00004` | second_division -> third_division | 11 | 3 | 23594500 | 26543813 | 22414750 | fee_below_valuation=5, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> second_division | 3 | 2 | 72846100 | 101984540 | 52467760 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> third_division | 26 | 4 | 12574600 | 16269822 | 13004663 | fee_below_valuation=15, player_unwilling=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | first_division -> first_division | 88 | 8 | 1271417300 | 1615924087.5 | 1784022763 | fee_below_valuation=61, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00005` | second_division -> second_division | 68 | 8 | 131500450 | 162100657.5 | 83783325 | player_unwilling=8, fee_below_valuation=48, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | second_division -> third_division | 5 | 2 | 11142900 | 15377202 | 23905635 | unaffordable=2, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> second_division | 8 | 4 | 43201100 | 54850012.5 | 41618756.5 | fee_below_valuation=3, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> third_division | 28 | 4 | 11630500 | 13084313 | 11764238 | fee_below_valuation=13, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00006` | first_division -> first_division | 83 | 7 | 790731500 | 1067487525 | 146921970 | player_unwilling=19, fee_below_valuation=50, stale_ownership=4 |
| `phase80a-prechange-baseline-world-00006` | second_division -> first_division | 6 | 2 | 130938700 | 172252048.5 | 343280387 | stale_ownership=1, fee_below_valuation=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00006` | second_division -> second_division | 90 | 6 | 134048600 | 202025509 | 98504175 | fee_below_valuation=59, player_unwilling=20 |
| `phase80a-prechange-baseline-world-00006` | second_division -> third_division | 2 | 1 | 22134400 | 28136130 | 33262680 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00006` | third_division -> first_division | 5 | 1 | 9563700 | 12373515 | 15507064 | fee_below_valuation=2, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | third_division -> third_division | 22 | 2 | 12155400 | 13793288 | 5872794 | fee_below_valuation=11, player_unwilling=8 |
| `phase80a-prechange-baseline-world-00007` | first_division -> first_division | 69 | 8 | 753714600 | 1017514710 | 29925540 | player_unwilling=8, fee_below_valuation=45, stale_ownership=3, player_not_for_sale=3 |
| `phase80a-prechange-baseline-world-00007` | first_division -> second_division | 2 | 1 | 37263550 | 48300951 | 50842831 | player_unwilling=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> first_division | 3 | 1 | 22240600 | 30384067 | 28774888 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> second_division | 87 | 4 | 168682200 | 209918655 | 239060279 | fee_below_valuation=75, player_unwilling=3, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> third_division | 5 | 1 | 28258800 | 31791150 | 43910900 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00007` | third_division -> second_division | 9 | 3 | 24235600 | 29782238 | 31082130 | fee_below_valuation=3, unaffordable=3 |
| `phase80a-prechange-baseline-world-00007` | third_division -> third_division | 29 | 5 | 11930400 | 12166300 | 8434832 | fee_below_valuation=15, player_unwilling=7, stale_ownership=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00008` | first_division -> first_division | 64 | 12 | 533993100 | 701568816 | 675259958 | fee_below_valuation=36, player_unwilling=9, player_not_for_sale=2, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00008` | first_division -> second_division | 2 | 1 | 14287850 | 13709713.5 | 13657325 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00008` | second_division -> first_division | 2 | 0 | 163597300 | 191899633 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00008` | second_division -> second_division | 75 | 4 | 176200000 | 218282850 | 156804918.5 | fee_below_valuation=60, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00008` | second_division -> third_division | 4 | 1 | 23338400 | 27130890 | 8478590 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00008` | third_division -> first_division | 2 | 0 | 163597300 | 211858503.5 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00008` | third_division -> second_division | 11 | 1 | 45553100 | 57421320 | 184946744 | fee_below_valuation=9 |
| `phase80a-prechange-baseline-world-00008` | third_division -> third_division | 22 | 1 | 11755100 | 14106120 | 12292000 | player_unwilling=8, fee_below_valuation=11, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | first_division -> first_division | 90 | 17 | 513889550 | 575626678.5 | 422988460 | fee_below_valuation=38, player_unwilling=28, stale_ownership=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | first_division -> second_division | 3 | 1 | 47423300 | 54430680 | 42680970 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> first_division | 1 | 1 | 9417500 | 12996150 | 11696525 | none |
| `phase80a-prechange-baseline-world-00009` | second_division -> second_division | 85 | 7 | 182988700 | 247700835 | 115497957 | player_unwilling=14, fee_below_valuation=59, unaffordable=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> third_division | 11 | 1 | 59746500 | 80657775 | 20448745 | fee_below_valuation=7, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00009` | third_division -> first_division | 1 | 0 | 10223100 | 14107878 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> second_division | 2 | 2 | 35529700 | 49028659 | 45468304.5 | none |
| `phase80a-prechange-baseline-world-00009` | third_division -> third_division | 22 | 3 | 15279400 | 15279400 | 16014600 | fee_below_valuation=13, player_unwilling=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | first_division -> first_division | 65 | 11 | 532982500 | 719526375 | 73947226 | fee_below_valuation=34, player_unwilling=13, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00010` | first_division -> second_division | 4 | 1 | 158847950 | 164407628.5 | 18232125 | fee_below_valuation=1, player_unwilling=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00010` | second_division -> first_division | 5 | 2 | 205816000 | 266284741 | 126503501.5 | fee_below_valuation=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00010` | second_division -> second_division | 74 | 7 | 164470800 | 221697945 | 253864530 | fee_below_valuation=48, stale_ownership=2, player_unwilling=9, unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | second_division -> third_division | 4 | 2 | 13042550 | 14393334 | 17856752 | unaffordable=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00010` | third_division -> second_division | 5 | 1 | 54809900 | 73993365 | 54554850 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00010` | third_division -> third_division | 55 | 8 | 12433100 | 13987238 | 7289888 | fee_below_valuation=26, player_unwilling=14, unaffordable=2 |
| `phase80a-prechange-baseline-world-00011` | first_division -> first_division | 83 | 15 | 903823100 | 1220161185 | 1193654080 | fee_below_valuation=39, player_unwilling=18, stale_ownership=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00011` | first_division -> second_division | 2 | 1 | 6362900 | 10097922 | 10097922 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00011` | second_division -> first_division | 6 | 2 | 63068950 | 77951832 | 76095242 | stale_ownership=2, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00011` | second_division -> second_division | 91 | 4 | 135530400 | 157434975 | 219546891.5 | fee_below_valuation=64, player_unwilling=16 |
| `phase80a-prechange-baseline-world-00011` | second_division -> third_division | 16 | 2 | 45371450 | 54445740 | 79742097 | fee_below_valuation=11, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> first_division | 3 | 1 | 12545000 | 17312100 | 19320683 | fee_below_valuation=1, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> second_division | 3 | 2 | 47517900 | 59619375 | 165908204 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> third_division | 37 | 2 | 14706000 | 16700063 | 18553662 | player_unwilling=15, fee_below_valuation=17 |
| `phase80a-prechange-baseline-world-00012` | first_division -> first_division | 78 | 7 | 1209509600 | 1451411520 | 1211096282 | player_unwilling=8, fee_below_valuation=57, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00012` | first_division -> second_division | 4 | 3 | 13863400 | 19306709 | 20260549 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> first_division | 1 | 0 | 11272200 | 10821312 | 0 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> second_division | 77 | 5 | 135109800 | 161729100 | 133860657 | fee_below_valuation=55, player_unwilling=11, unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | second_division -> third_division | 6 | 1 | 10340200 | 11612208 | 12225853 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00012` | third_division -> second_division | 10 | 2 | 19096000 | 29555620.5 | 11964006.5 | fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00012` | third_division -> third_division | 33 | 7 | 9805800 | 10644638 | 11915850 | fee_below_valuation=17, player_unwilling=6, unaffordable=2 |
| `phase80a-prechange-baseline-world-00013` | first_division -> first_division | 84 | 3 | 862123200 | 1163866320 | 1586197957 | fee_below_valuation=58, player_unwilling=18, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | first_division -> second_division | 1 | 1 | 11358000 | 15674040 | 14498470 | none |
| `phase80a-prechange-baseline-world-00013` | second_division -> first_division | 2 | 1 | 224600900 | 320174944 | 402857685 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | second_division -> second_division | 85 | 7 | 150788700 | 201106238 | 123414425 | fee_below_valuation=56, player_unwilling=15, unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | second_division -> third_division | 4 | 2 | 56175850 | 72386032.5 | 80719754 | player_unwilling=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00013` | third_division -> second_division | 4 | 3 | 47093000 | 64797400 | 59870650 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00013` | third_division -> third_division | 37 | 10 | 10429300 | 10505363 | 10280264 | player_unwilling=6, fee_below_valuation=18, unaffordable=2 |
| `phase80a-prechange-baseline-world-00014` | first_division -> first_division | 68 | 7 | 813779650 | 944135887.5 | 474119471 | fee_below_valuation=43, player_unwilling=7, stale_ownership=4, player_not_for_sale=3 |
| `phase80a-prechange-baseline-world-00014` | first_division -> second_division | 7 | 3 | 9381100 | 9709439 | 13784339 | fee_below_valuation=1, stale_ownership=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> first_division | 9 | 2 | 94727300 | 147064133 | 1031599348 | stale_ownership=2, fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00014` | second_division -> second_division | 83 | 6 | 155300100 | 205862985 | 60509100 | fee_below_valuation=59, player_unwilling=16 |
| `phase80a-prechange-baseline-world-00014` | second_division -> third_division | 6 | 1 | 20182000 | 21258574 | 29649663 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00014` | third_division -> third_division | 38 | 6 | 10355700 | 13962780 | 9920179 | fee_below_valuation=22, player_unwilling=5, unaffordable=3 |
| `phase80a-prechange-baseline-world-00015` | first_division -> first_division | 70 | 5 | 1417922300 | 1441693900 | 1652083440 | fee_below_valuation=50, player_unwilling=13, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00015` | first_division -> second_division | 3 | 1 | 7911200 | 8188092 | 9208950 | stale_ownership=2 |
| `phase80a-prechange-baseline-world-00015` | second_division -> first_division | 1 | 1 | 84559400 | 95129325 | 95129325 | none |
| `phase80a-prechange-baseline-world-00015` | second_division -> second_division | 82 | 12 | 146974800 | 176369760 | 191807550 | fee_below_valuation=45, player_unwilling=16, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00015` | second_division -> third_division | 7 | 1 | 19022600 | 21400425 | 37351713 | fee_below_valuation=5, unaffordable=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> first_division | 1 | 0 | 97868200 | 154142415 | 0 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> third_division | 41 | 4 | 11657700 | 16087626 | 14091011.5 | fee_below_valuation=22, player_unwilling=13, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00016` | first_division -> first_division | 56 | 12 | 521655400 | 626560181 | 124053916.5 | player_unwilling=9, stale_ownership=8, fee_below_valuation=23, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00016` | first_division -> second_division | 3 | 2 | 143187100 | 128868390 | 67264735.5 | none |
| `phase80a-prechange-baseline-world-00016` | second_division -> first_division | 9 | 3 | 136068100 | 211245725 | 37692265 | fee_below_valuation=3, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00016` | second_division -> second_division | 83 | 6 | 126982300 | 151947000 | 123189628.5 | fee_below_valuation=58, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00016` | second_division -> third_division | 13 | 5 | 14197700 | 15672163 | 18555914 | fee_below_valuation=7 |
| `phase80a-prechange-baseline-world-00016` | third_division -> first_division | 5 | 3 | 12115900 | 13630388 | 15710350 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> second_division | 8 | 4 | 32890300 | 40131066 | 12764101 | stale_ownership=1, fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00016` | third_division -> third_division | 58 | 7 | 11928400 | 13157842.5 | 11290749 | fee_below_valuation=22, player_unwilling=21, unaffordable=2 |
| `phase80a-prechange-baseline-world-00017` | first_division -> first_division | 72 | 7 | 996244600 | 1225618706.5 | 610752624 | player_unwilling=10, fee_below_valuation=47, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00017` | first_division -> second_division | 5 | 3 | 11114400 | 16135374 | 16756577 | player_unwilling=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> first_division | 4 | 2 | 57248200 | 88926354.5 | 140912160.5 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00017` | second_division -> second_division | 84 | 5 | 149242550 | 183290029 | 300112250 | fee_below_valuation=63, player_unwilling=9 |
| `phase80a-prechange-baseline-world-00017` | second_division -> third_division | 12 | 2 | 16543300 | 17882703.5 | 13738205.5 | fee_below_valuation=8, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> first_division | 2 | 1 | 14602100 | 18892197 | 18897760 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> second_division | 2 | 1 | 50697100 | 68893666 | 87052000 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> third_division | 40 | 10 | 10698100 | 11668000 | 8289375 | fee_below_valuation=20, unaffordable=3, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00018` | first_division -> first_division | 72 | 11 | 1019188200 | 1251943575 | 1364078663 | player_unwilling=12, fee_below_valuation=46, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00018` | first_division -> second_division | 1 | 1 | 63034100 | 81553519 | 73398160 | none |
| `phase80a-prechange-baseline-world-00018` | second_division -> first_division | 9 | 2 | 283024400 | 439395381 | 867966729 | fee_below_valuation=5, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00018` | second_division -> second_division | 87 | 8 | 129597500 | 174956625 | 175028650 | fee_below_valuation=60, player_unwilling=10, unaffordable=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00018` | second_division -> third_division | 12 | 4 | 33643850 | 37849331.5 | 35442000 | fee_below_valuation=4, player_unwilling=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00018` | third_division -> second_division | 6 | 3 | 12080000 | 16308000 | 16374015 | fee_below_valuation=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00018` | third_division -> third_division | 46 | 6 | 12650800 | 14476612.5 | 11403122 | fee_below_valuation=31, player_unwilling=8 |
| `phase80a-prechange-baseline-world-00019` | first_division -> first_division | 66 | 1 | 1093431000 | 1295403127.5 | 1371557300 | fee_below_valuation=49, player_unwilling=16 |
| `phase80a-prechange-baseline-world-00019` | second_division -> second_division | 78 | 3 | 158904250 | 222097907.5 | 158325543 | fee_below_valuation=58, player_unwilling=13, unaffordable=1 |
| `phase80a-prechange-baseline-world-00019` | second_division -> third_division | 3 | 0 | 19710000 | 22173750 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00019` | third_division -> second_division | 3 | 0 | 48277300 | 57932760 | 0 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00019` | third_division -> third_division | 35 | 5 | 8554000 | 10219488 | 8084730 | player_unwilling=13, fee_below_valuation=13, unaffordable=1 |
| `phase80a-prechange-baseline-world-00020` | first_division -> first_division | 60 | 6 | 897058000 | 1161719842.5 | 286125608 | fee_below_valuation=38, player_unwilling=9, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00020` | first_division -> second_division | 8 | 2 | 14399000 | 22851213 | 12616027 | stale_ownership=2, fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00020` | second_division -> first_division | 10 | 4 | 155961850 | 237800289.5 | 313145615.5 | stale_ownership=5, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> second_division | 84 | 7 | 146499000 | 203790668 | 318868535 | fee_below_valuation=63, player_unwilling=9 |
| `phase80a-prechange-baseline-world-00020` | second_division -> third_division | 3 | 0 | 80669800 | 90753525 | 0 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00020` | third_division -> first_division | 4 | 1 | 296999000 | 406443132 | 208777625 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00020` | third_division -> second_division | 3 | 1 | 58450700 | 78908445 | 71017573 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00020` | third_division -> third_division | 30 | 2 | 15035200 | 17752862.5 | 11858445 | player_unwilling=11, fee_below_valuation=16 |

## Year-10 Exceptional Stock Locations

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00010` | FAIL | 20 | 11 | senior 1230..1289; youth 594..594; total 1824..1883 | 0 | 0 | 0 | structural 0; cash 736673075; wage 1.0000; free agents 0.0324; values 4054300..13495000000; renew/release/expiry 285/0/0 | 12 | avg 26.50; min 24; max 29; low season 1; champion pts 58..60; last pts 29..36; ability spread 6.58->5.75; draw rate avg/max 0.260/0.270 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00001` | FAIL | 19 | 11 | senior 1224..1278; youth 594..594; total 1818..1872 | 0 | 0 | 0 | structural 0; cash 755000000; wage 1.0000; free agents 0.0301; values 4165200..12298000000; renew/release/expiry 271/3/2 | 12 | avg 28.00; min 26; max 30; low season 2; champion pts 61..63; last pts 31..37; ability spread 6.57->5.49; draw rate avg/max 0.250/0.270 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.44; top assist Matteo Basiletti; top scorer Nico Sorrentino:13 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00019` | WARN | 18 | 11 | senior 1221..1284; youth 594..594; total 1815..1878 | 0 | 0 | 0 | structural 0; cash 775394098; wage 1.0000; free agents 0.0402; values 3919700..12760000000; renew/release/expiry 299/0/1 | 10 | avg 36.00; min 31; max 41; low season 2; champion pts 63..65; last pts 24..32; ability spread 6.29->5.53; draw rate avg/max 0.240/0.250 | season 2; Virtus Trieste; Matteo Bonacina; assists 9; team goals 49; top1 0.18; top3 0.41; top assist Giorgio Bonetti; top scorer Luca Cambi:18 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00006` | WARN | 19 | 11 | senior 1229..1299; youth 594..594; total 1823..1893 | 0 | 0 | 0 | structural 0; cash 801293500; wage 1.0000; free agents 0.0378; values 3929700..13684000000; renew/release/expiry 282/1/2 | 11 | avg 35.50; min 35; max 36; low season 1; champion pts 63..66; last pts 28..30; ability spread 6.42->5.46; draw rate avg/max 0.270/0.290 | season 2; A.S. Genoa; Luca Basile; assists 11; team goals 53; top1 0.21; top3 0.40; top assist Luca Basile; top scorer Marko Jovanovic:14 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00013` | WARN | 19 | 11 | senior 1217..1295; youth 594..594; total 1811..1889 | 0 | 0 | 0 | structural 0; cash 812416780; wage 1.0000; free agents 0.0354; values 3484100..15000000000; renew/release/expiry 261/0/1 | 11 | avg 35.00; min 30; max 40; low season 2; champion pts 59..72; last pts 29..32; ability spread 5.91->5.16; draw rate avg/max 0.250/0.260 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Enrico Bruni; top scorer Dario Milosevic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00018` | WARN | 19 | 11 | senior 1220..1291; youth 594..594; total 1814..1885 | 0 | 0 | 0 | structural 0; cash 743778250; wage 1.0000; free agents 0.0329; values 3762800..12298000000; renew/release/expiry 270/2/1 | 10 | avg 32.00; min 28; max 36; low season 1; champion pts 60..65; last pts 29..32; ability spread 6.06->5.01; draw rate avg/max 0.250/0.260 | season 1; U.S. Trieste; Sekou Keita; assists 8; team goals 41; top1 0.20; top3 0.41; top assist Davide Spinelli; top scorer Davide Mazzi:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00007` | WARN | 18 | 11 | senior 1223..1287; youth 594..594; total 1817..1881 | 0 | 0 | 0 | structural 0; cash 767611246; wage 1.0000; free agents 0.0329; values 3786500..13495000000; renew/release/expiry 283/0/0 | 10 | avg 33.50; min 32; max 35; low season 1; champion pts 63..64; last pts 29..31; ability spread 5.78->5.17; draw rate avg/max 0.230/0.250 | season 1; U.S. Matera; Enrico Rossetti; assists 9; team goals 44; top1 0.20; top3 0.46; top assist Matteo Cantini; top scorer Nico Corsi:16 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00005` | WARN | 19 | 11 | senior 1225..1285; youth 594..594; total 1819..1879 | 0 | 0 | 0 | structural 0; cash 831000000; wage 1.0000; free agents 0.0329; values 3812100..12760000000; renew/release/expiry 253/0/1 | 10 | avg 31.00; min 28; max 34; low season 1; champion pts 64..65; last pts 31..36; ability spread 5.86->5.09; draw rate avg/max 0.220/0.220 | season 1; A.C. Catania; Davide Corsi; assists 10; team goals 51; top1 0.20; top3 0.39; top assist Davide Corsi; top scorer Giorgio Pagano:18 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00009` | WARN | 19 | 11 | senior 1219..1280; youth 594..594; total 1813..1874 | 0 | 0 | 0 | structural 0; cash 808911150; wage 1.0000; free agents 0.0325; values 3552400..14020000000; renew/release/expiry 266/0/2 | 10 | avg 30.50; min 24; max 37; low season 2; champion pts 60..63; last pts 26..36; ability spread 6.32->5.40; draw rate avg/max 0.230/0.250 | season 2; S.S. Ravenna; Lucas Lefevre; assists 8; team goals 42; top1 0.19; top3 0.43; top assist Nico D'Amico; top scorer Giorgio Ricciardi:17 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00017` | WARN | 20 | 11 | senior 1230..1297; youth 594..594; total 1824..1891 | 0 | 0 | 0 | structural 0; cash 779756000; wage 1.0000; free agents 0.0321; values 3613600..13684000000; renew/release/expiry 281/1/3 | 10 | avg 41.50; min 39; max 44; low season 1; champion pts 67..67; last pts 23..28; ability spread 6.78->5.44; draw rate avg/max 0.220/0.220 | season 1; S.S. Terni; Nico Tarantino; assists 9; team goals 45; top1 0.20; top3 0.41; top assist Nikola Vukovic; top scorer Timo Bergmann:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase80a-prechange-baseline-world-00015` | 15 | season 2; A.C. Lecco; Enrico Capra; assists 15; team goals 69; top1 0.22; top3 0.38; top assist Enrico Capra; top scorer Luca Pagano:17 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 14 | season 1; A.S. Pescara; Luca Silvestri; assists 9; team goals 46; top1 0.20; top3 0.40; top assist Luca Silvestri; top scorer Enrico Cambi:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 12 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.44; top assist Matteo Basiletti; top scorer Nico Sorrentino:13 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00010` | 12 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 11 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 44; top1 0.23; top3 0.43; top assist Enrico Bruni; top scorer Dario Milosevic:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00004` | 11 | season 2; S.S. Foggia; Enrico Valentini; assists 11; team goals 51; top1 0.22; top3 0.41; top assist Enrico Valentini; top scorer Nico Fontana:17 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 11 | season 2; Brescia Calcio; Davide Lazzari; assists 10; team goals 47; top1 0.21; top3 0.45; top assist Davide Lazzari; top scorer Davide Melis:14 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase80a-prechange-baseline-world-00006` | 11 | season 2; A.S. Genoa; Luca Basile; assists 11; team goals 53; top1 0.21; top3 0.40; top assist Luca Basile; top scorer Marko Jovanovic:14 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 11 | season 1; Virtus Parma; Sergio Molina; assists 10; team goals 50; top1 0.20; top3 0.42; top assist Logan Morgan; top scorer Enrico Bortolotti:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 11 | season 2; A.C. Vicenza; Emir Yilmaz; assists 10; team goals 51; top1 0.20; top3 0.39; top assist Emir Yilmaz; top scorer Luca Fabiani:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00017` | 2 | Pro Trento | 67..67 | 41.50 | 1 | transfer=65; squad=107 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 2 | A.S.D. Lecco | 63..66 | 35.50 | 1 | transfer=67; squad=107 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 2 | Pro Brescia | 60..68 | 33.50 | 1 | transfer=72; squad=112 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 1 | A.C. Terni | 73..73 | 46.00 | 2 | transfer=72; squad=117 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 1 | A.C. Taranto | 69..69 | 43.00 | 2 | transfer=77; squad=120 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 1 | U.S. Florence | 65..65 | 43.00 | 2 | transfer=72; squad=108 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00016` | 1 | A.S. Florence | 74..74 | 42.00 | 2 | transfer=91; squad=128 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 1 | S.S. Lecco | 69..69 | 42.00 | 2 | transfer=74; squad=112 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00019` | 1 | A.S. Pisa | 65..65 | 41.00 | 2 | transfer=61; squad=93 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 1 | Pro Catania | 72..72 | 40.00 | 2 | transfer=72; squad=105 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00010` | 26.50 | 24..29 | 58..60 | 29..36 | avg 0.260 max 0.270 | 6.58->5.75 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 28.00 | 26..30 | 61..63 | 31..37 | avg 0.250 max 0.270 | 6.57->5.49 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00009` | 30.50 | 24..37 | 60..63 | 26..36 | avg 0.230 max 0.250 | 6.32->5.40 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 30.50 | 26..35 | 59..63 | 28..33 | avg 0.280 max 0.280 | 6.52->5.10 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase80a-prechange-baseline-world-00005` | 31.00 | 28..34 | 64..65 | 31..36 | avg 0.220 max 0.220 | 5.86->5.09 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00018` | 32.00 | 28..36 | 60..65 | 29..32 | avg 0.250 max 0.260 | 6.06->5.01 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 33.50 | 28..39 | 60..68 | 29..32 | avg 0.260 max 0.280 | 6.67->5.67 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00007` | 33.50 | 32..35 | 63..64 | 29..31 | avg 0.230 max 0.250 | 5.78->5.17 | goals_per_match_avg, table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 34.50 | 27..42 | 61..69 | 27..34 | avg 0.220 max 0.240 | 6.29->5.44 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 35.00 | 30..40 | 59..72 | 29..32 | avg 0.250 max 0.260 | 5.91->5.16 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

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
| `phase80a-prechange-baseline-world-00013` | 0 | 0.0354 |
| `phase80a-prechange-baseline-world-00005` | 0 | 0.0329 |
| `phase80a-prechange-baseline-world-00007` | 0 | 0.0329 |
| `phase80a-prechange-baseline-world-00018` | 0 | 0.0329 |
| `phase80a-prechange-baseline-world-00009` | 0 | 0.0325 |
| `phase80a-prechange-baseline-world-00010` | 0 | 0.0324 |
| `phase80a-prechange-baseline-world-00017` | 0 | 0.0321 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase80a-prechange-baseline-world-00012` | 0.3611 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00008` | 0.3611 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00019` | 0.3426 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00020` | 0.3333 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00007` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00004` | 0.3148 | 0.0370 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00018` | 0.3148 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00013` | 0.3148 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00006` | 0.3056 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00005` | 0.3056 | 0.0093 | 0.0000 | 1.0000 |

## Reproduction

Run the same gate with:

```bash
nvm use 24
pnpm cli ten-season-report --seed-prefix=phase80a-prechange-baseline --worlds=20 --seasons=2 --checkpoint-dir=<checkpoint-directory> --shards=20 --workers=7 --report-output=artifacts/phase80a-step08-v5-global-anchors-report.md
```
